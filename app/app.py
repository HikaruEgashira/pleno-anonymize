import os
import json
import re
from pathlib import Path
from typing import List, Optional, Dict, Any, Tuple
import httpx
from fastapi import FastAPI, Request, Response
from pydantic import BaseModel

import spacy
from spacy_llm.util import assemble

from presidio_analyzer import AnalyzerEngine, RecognizerResult
from presidio_analyzer.nlp_engine import SpacyNlpEngine
from presidio_anonymizer import AnonymizerEngine, OperatorConfig

# spaCyパイプラインをconfig.cfgから組み立て
# Lambda環境ではLAMBDA_TASK_ROOTを使用
lambda_task_root = os.getenv("LAMBDA_TASK_ROOT")
if lambda_task_root:
    config_path = Path(lambda_task_root) / "config.cfg"
else:
    config_path = Path(__file__).parent / "config.cfg"
nlp = assemble(str(config_path))

class LoadedSpacyNlpEngine(SpacyNlpEngine):
    def __init__(self, loaded_spacy_model):
        super().__init__()
        self.nlp = {"en": loaded_spacy_model}

loaded_engine = LoadedSpacyNlpEngine(nlp)
analyzer = AnalyzerEngine(nlp_engine=loaded_engine)
anonymizer = AnonymizerEngine()

app = FastAPI(title="pleno-anonymize")

class AnalyzeRequest(BaseModel):
    text: str
    language: str = "en"
    entities: Optional[List[str]] = None

class RedactRequest(BaseModel):
    text: str
    language: str = "en"
    entities: Optional[List[str]] = None
    operators: Optional[Dict[str, Dict[str, Any]]] = None

@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    results: List[RecognizerResult] = analyzer.analyze(
        text=req.text,
        language=req.language,
        entities=req.entities
    )
    return [
        {
            "entity_type": r.entity_type,
            "start": r.start,
            "end": r.end,
            "score": r.score,
            "text": req.text[r.start:r.end],
        }
        for r in results
    ]

@app.post("/api/redact")
def redact(req: RedactRequest):
    results = analyzer.analyze(
        text=req.text,
        language=req.language,
        entities=req.entities
    )
    anonymizers = {}
    for r in results:
        et = r.entity_type
        if et not in anonymizers:
            cfg = req.operators.get(et) if req.operators else None
            if not cfg:
                anonymizers[et] = OperatorConfig("replace", {"new_value": f"<{et}>"})
            else:
                operator_name = cfg.get("type", "replace")
                params = {k: v for k, v in cfg.items() if k != "type"}
                anonymizers[et] = OperatorConfig(operator_name, params)
    out = anonymizer.anonymize(
        text=req.text,
        analyzer_results=results,
        operators=anonymizers
    )
    return {"text": out.text, "items": [it.operator for it in out.items]}


OPENAI_API_BASE = os.getenv("OPENAI_API_BASE", "https://api.openai.com")


def redact_text_with_mapping(text: str, language: str = "en") -> Tuple[str, Dict[str, str]]:
    """Redact PII from text and return mapping for de-anonymization."""
    results = analyzer.analyze(text=text, language=language)

    # Sort by start position descending to replace from end
    results_sorted = sorted(results, key=lambda r: r.start, reverse=True)

    mapping = {}
    redacted_text = text

    for r in results_sorted:
        original = text[r.start:r.end]
        placeholder = f"<{r.entity_type}_{r.start}>"
        mapping[placeholder] = original
        redacted_text = redacted_text[:r.start] + placeholder + redacted_text[r.end:]

    return redacted_text, mapping


def deanonymize_text(text: str, mapping: Dict[str, str]) -> str:
    """Restore original values from placeholders."""
    result = text
    for placeholder, original in mapping.items():
        result = result.replace(placeholder, original)
    return result


def redact_openai_request(body: dict) -> Tuple[dict, Dict[str, str]]:
    """Redact PII from OpenAI API request body."""
    combined_mapping = {}

    if "messages" not in body:
        return body, combined_mapping

    redacted_body = body.copy()
    redacted_messages = []

    for msg in body.get("messages", []):
        redacted_msg = msg.copy()
        content = msg.get("content")

        if isinstance(content, str) and content:
            redacted_content, mapping = redact_text_with_mapping(content)
            redacted_msg["content"] = redacted_content
            combined_mapping.update(mapping)
        elif isinstance(content, list):
            # Handle array content (e.g., vision API)
            redacted_parts = []
            for part in content:
                if isinstance(part, dict) and part.get("type") == "text":
                    text = part.get("text", "")
                    if text:
                        redacted_text, mapping = redact_text_with_mapping(text)
                        redacted_part = part.copy()
                        redacted_part["text"] = redacted_text
                        redacted_parts.append(redacted_part)
                        combined_mapping.update(mapping)
                    else:
                        redacted_parts.append(part)
                else:
                    redacted_parts.append(part)
            redacted_msg["content"] = redacted_parts

        redacted_messages.append(redacted_msg)

    redacted_body["messages"] = redacted_messages
    return redacted_body, combined_mapping


def deanonymize_openai_response(body: dict, mapping: Dict[str, str]) -> dict:
    """Restore PII in OpenAI API response."""
    if not mapping:
        return body

    result = body.copy()

    if "choices" in result:
        redacted_choices = []
        for choice in result.get("choices", []):
            redacted_choice = choice.copy()
            message = choice.get("message", {})
            if message:
                redacted_message = message.copy()
                content = message.get("content")
                if isinstance(content, str):
                    redacted_message["content"] = deanonymize_text(content, mapping)
                redacted_choice["message"] = redacted_message

            # Handle delta for streaming
            delta = choice.get("delta", {})
            if delta:
                redacted_delta = delta.copy()
                content = delta.get("content")
                if isinstance(content, str):
                    redacted_delta["content"] = deanonymize_text(content, mapping)
                redacted_choice["delta"] = redacted_delta

            redacted_choices.append(redacted_choice)
        result["choices"] = redacted_choices

    return result


@app.api_route("/api/openai/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def openai_proxy(request: Request, path: str):
    """OpenAI API HTTP Proxy endpoint with automatic PII redaction."""
    target_url = f"{OPENAI_API_BASE}/{path}"

    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None)

    body = await request.body()
    mapping = {}

    # Redact PII for chat completions requests
    if request.method == "POST" and body:
        try:
            body_json = json.loads(body)
            if "messages" in body_json:
                redacted_body, mapping = redact_openai_request(body_json)
                body = json.dumps(redacted_body).encode("utf-8")
        except (json.JSONDecodeError, UnicodeDecodeError):
            pass

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
            params=request.query_params,
        )

    # Deanonymize response if we have a mapping
    response_content = response.content
    if mapping and response.status_code == 200:
        try:
            response_json = json.loads(response.content)
            deanonymized = deanonymize_openai_response(response_json, mapping)
            response_content = json.dumps(deanonymized).encode("utf-8")
        except (json.JSONDecodeError, UnicodeDecodeError):
            pass

    return Response(
        content=response_content,
        status_code=response.status_code,
        headers=dict(response.headers),
        media_type=response.headers.get("content-type"),
    )


# AWS Lambda handler
try:
    from mangum import Mangum
    handler = Mangum(app)
except ImportError:
    handler = None
