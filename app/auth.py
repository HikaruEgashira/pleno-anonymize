"""
Authentication module for invitely integration.

This module provides token introspection-based authentication
using invitely OAuth server.
"""

import os
from typing import Optional

import httpx
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

INVITELY_INTROSPECT_URL = os.getenv("INVITELY_INTROSPECT_URL")

security = HTTPBearer(auto_error=False)


async def verify_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
) -> dict:
    """
    Verify access token via invitely token introspection endpoint.

    If INVITELY_INTROSPECT_URL is not set, authentication is skipped
    (useful for local development without invitely).

    Args:
        credentials: Bearer token from Authorization header

    Returns:
        Token introspection result containing user info

    Raises:
        HTTPException: 401 if token is missing or invalid
    """
    if not INVITELY_INTROSPECT_URL:
        return {}  # Auth disabled, skip validation

    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Authorization required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                INVITELY_INTROSPECT_URL,
                data={"token": credentials.credentials},
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=10.0,
            )
            response.raise_for_status()
            result = response.json()
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Token introspection service unavailable: {str(e)}",
            )

        if not result.get("active"):
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return result
