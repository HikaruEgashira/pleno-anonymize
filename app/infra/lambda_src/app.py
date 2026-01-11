import os
import json
import urllib.request
import urllib.error
from typing import Any

OPENAI_API_BASE = os.getenv("OPENAI_API_BASE", "https://api.openai.com")


def handler(event: dict, context: Any) -> dict:
    """AWS Lambda handler for OpenAI API Proxy."""
    http_method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
    path = event.get("rawPath", "/")
    query_string = event.get("rawQueryString", "")
    headers = event.get("headers", {})
    body = event.get("body", "")

    if event.get("isBase64Encoded", False):
        import base64
        body = base64.b64decode(body).decode("utf-8")

    # Remove /openai prefix if present
    if path.startswith("/openai"):
        path = path[7:] or "/"

    # Build target URL
    target_url = f"{OPENAI_API_BASE}{path}"
    if query_string:
        target_url = f"{target_url}?{query_string}"

    # Prepare headers (remove hop-by-hop headers)
    proxy_headers = {}
    skip_headers = {"host", "content-length", "transfer-encoding", "connection"}
    for key, value in headers.items():
        if key.lower() not in skip_headers:
            proxy_headers[key] = value

    # Make request to OpenAI API
    try:
        req = urllib.request.Request(
            target_url,
            data=body.encode("utf-8") if body else None,
            headers=proxy_headers,
            method=http_method,
        )
        with urllib.request.urlopen(req, timeout=120) as response:
            response_body = response.read().decode("utf-8")
            response_headers = dict(response.headers)

            return {
                "statusCode": response.status,
                "headers": {
                    "content-type": response_headers.get("content-type", "application/json"),
                    "access-control-allow-origin": "*",
                    "access-control-allow-methods": "*",
                    "access-control-allow-headers": "*",
                },
                "body": response_body,
            }
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        return {
            "statusCode": e.code,
            "headers": {
                "content-type": "application/json",
                "access-control-allow-origin": "*",
            },
            "body": error_body,
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "content-type": "application/json",
                "access-control-allow-origin": "*",
            },
            "body": json.dumps({"error": str(e)}),
        }
