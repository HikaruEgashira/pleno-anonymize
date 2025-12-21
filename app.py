import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel

import spacy
from spacy_llm.util import assemble

from presidio_analyzer import AnalyzerEngine, RecognizerResult
from presidio_analyzer.nlp_engine import SpacyNlpEngine
from presidio_anonymizer import AnonymizerEngine, OperatorConfig

# spaCyパイプラインをconfig.cfgから組み立て
nlp = assemble("config.cfg")

class LoadedSpacyNlpEngine(SpacyNlpEngine):
    def __init__(self, loaded_spacy_model):
        super().__init__()
        self.nlp = {"en": loaded_spacy_model}

loaded_engine = LoadedSpacyNlpEngine(nlp)
analyzer = AnalyzerEngine(nlp_engine=loaded_engine)
anonymizer = AnonymizerEngine()

app = FastAPI(title="PII Filter Server (Presidio + spaCy-LLM gpt-5-nano)")

class AnalyzeRequest(BaseModel):
    text: str
    language: str = "en"
    entities: Optional[List[str]] = None

class RedactRequest(BaseModel):
    text: str
    language: str = "en"
    entities: Optional[List[str]] = None
    operators: Optional[Dict[str, Dict[str, Any]]] = None

@app.post("/analyze")
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

@app.post("/redact")
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
                cfg = {"type": "replace", "new_value": f"<{et}>"}
            anonymizers[et] = OperatorConfig(**cfg)
    out = anonymizer.anonymize(
        text=req.text,
        analyzer_results=results,
        operators=anonymizers
    )
    return {"text": out.text, "items": [it.operator for it in out.items]}
