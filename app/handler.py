"""AWS Lambda handler for pleno-anonymize API."""
import os
import json
import urllib.request
import urllib.error
from typing import Any, Optional

# Lazy initialization for heavy imports
_app_initialized = False
_analyzer = None
_anonymizer = None
_nlp = None


def _init_presidio():
    """Lazy initialization of Presidio components."""
    global _app_initialized, _analyzer, _anonymizer, _nlp

    if _app_initialized:
        return

    from pathlib import Path
    from spacy_llm.util import assemble
    from presidio_analyzer import AnalyzerEngine
    from presidio_analyzer.nlp_engine import SpacyNlpEngine
    from presidio_anonymizer import AnonymizerEngine

    class LoadedSpacyNlpEngine(SpacyNlpEngine):
        def __init__(self, loaded_spacy_model):
            super().__init__()
            self.nlp = {"en": loaded_spacy_model}

    # Load config
    lambda_task_root = os.getenv("LAMBDA_TASK_ROOT", "")
    config_path = Path(lambda_task_root) / "config.cfg" if lambda_task_root else Path(__file__).parent / "config.cfg"

    _nlp = assemble(str(config_path))
    loaded_engine = LoadedSpacyNlpEngine(_nlp)
    _analyzer = AnalyzerEngine(nlp_engine=loaded_engine)
    _anonymizer = AnonymizerEngine()
    _app_initialized = True


OPENAI_API_BASE = os.getenv("OPENAI_API_BASE", "https://api.openai.com")


def handle_analyze(body: dict) -> dict:
    """Handle /analyze endpoint."""
    _init_presidio()

    from presidio_anonymizer import OperatorConfig

    text = body.get("text", "")
    language = body.get("language", "en")
    entities = body.get("entities")

    results = _analyzer.analyze(text=text, language=language, entities=entities)

    return [
        {
            "entity_type": r.entity_type,
            "start": r.start,
            "end": r.end,
            "score": r.score,
            "text": text[r.start:r.end],
        }
        for r in results
    ]


def handle_redact(body: dict) -> dict:
    """Handle /redact endpoint."""
    _init_presidio()

    from presidio_anonymizer import OperatorConfig

    text = body.get("text", "")
    language = body.get("language", "en")
    entities = body.get("entities")
    operators = body.get("operators")

    results = _analyzer.analyze(text=text, language=language, entities=entities)

    anonymizers = {}
    for r in results:
        et = r.entity_type
        if et not in anonymizers:
            cfg = operators.get(et) if operators else None
            if not cfg:
                anonymizers[et] = OperatorConfig("replace", {"new_value": f"<{et}>"})
            else:
                operator_name = cfg.get("type", "replace")
                params = {k: v for k, v in cfg.items() if k != "type"}
                anonymizers[et] = OperatorConfig(operator_name, params)

    out = _anonymizer.anonymize(text=text, analyzer_results=results, operators=anonymizers)
    return {"text": out.text, "items": [it.operator for it in out.items]}


def handle_openai_proxy(method: str, path: str, headers: dict, body: str, query_string: str) -> dict:
    """Handle /openai/* proxy endpoint."""
    target_url = f"{OPENAI_API_BASE}/{path}"
    if query_string:
        target_url = f"{target_url}?{query_string}"

    proxy_headers = {}
    skip_headers = {"host", "content-length", "transfer-encoding", "connection"}
    for key, value in headers.items():
        if key.lower() not in skip_headers:
            proxy_headers[key] = value

    try:
        req = urllib.request.Request(
            target_url,
            data=body.encode("utf-8") if body else None,
            headers=proxy_headers,
            method=method,
        )
        with urllib.request.urlopen(req, timeout=120) as response:
            return {
                "statusCode": response.status,
                "headers": {
                    "content-type": response.headers.get("content-type", "application/json"),
                    "access-control-allow-origin": "*",
                },
                "body": response.read().decode("utf-8"),
            }
    except urllib.error.HTTPError as e:
        return {
            "statusCode": e.code,
            "headers": {"content-type": "application/json", "access-control-allow-origin": "*"},
            "body": e.read().decode("utf-8"),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"content-type": "application/json", "access-control-allow-origin": "*"},
            "body": json.dumps({"error": str(e)}),
        }


def handler(event: dict, context: Any) -> dict:
    """AWS Lambda handler."""
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
    path = event.get("rawPath", "/")
    query_string = event.get("rawQueryString", "")
    headers = event.get("headers", {})
    body = event.get("body", "")

    if event.get("isBase64Encoded", False):
        import base64
        body = base64.b64decode(body).decode("utf-8")

    # Route handling
    try:
        if path == "/api/analyze" and method == "POST":
            body_json = json.loads(body) if body else {}
            result = handle_analyze(body_json)
            return {
                "statusCode": 200,
                "headers": {"content-type": "application/json", "access-control-allow-origin": "*"},
                "body": json.dumps(result),
            }

        elif path == "/api/redact" and method == "POST":
            body_json = json.loads(body) if body else {}
            result = handle_redact(body_json)
            return {
                "statusCode": 200,
                "headers": {"content-type": "application/json", "access-control-allow-origin": "*"},
                "body": json.dumps(result),
            }

        elif path.startswith("/api/openai/"):
            proxy_path = path[12:]  # Remove "/api/openai/"
            return handle_openai_proxy(method, proxy_path, headers, body, query_string)

        elif path == "/api/openai":
            return handle_openai_proxy(method, "", headers, body, query_string)

        else:
            return {
                "statusCode": 404,
                "headers": {"content-type": "application/json", "access-control-allow-origin": "*"},
                "body": json.dumps({"error": "Not Found"}),
            }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"content-type": "application/json", "access-control-allow-origin": "*"},
            "body": json.dumps({"error": str(e)}),
        }
