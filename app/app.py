import os
from pathlib import Path
from typing import List, Optional, Dict, Any
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


@app.api_route("/api/openai/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def openai_proxy(request: Request, path: str):
    """OpenAI API HTTP Proxy endpoint."""
    target_url = f"{OPENAI_API_BASE}/{path}"

    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None)

    body = await request.body()

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
            params=request.query_params,
        )

    return Response(
        content=response.content,
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
