import os
import httpx
from fastapi import Request, HTTPException, status
import asyncio
from typing import Any, Optional, Dict

# Env vars
INTERNAL_SECRET = os.getenv("INTERNAL_SECRET") 
ALLOWED_FRONTEND_ORIGIN = os.getenv("ALLOWED_FRONTEND_ORIGIN")

async def validate_request(request: Request) -> None:
    """
    Use this function in the event of any request made out to external APIs. 

    Args:
        request (Request): The incoming request object from FastAPI.

    Raises:
        HTTPException: Raises a 403 Forbidden error if the request is not authorized to prevent abuse of external API calls.

    TODO: Does not need to be used for every single request, but at the start of each batch. As of now this checks individual requests.
    This should be changed to check batches of requests or validate a single header before a large batch of requests to prevent bottleneck. 
    """
    # Secret header requirement. Check for header giving proper secret and (unnecessarily) ensure env var is set
    secret = request.headers.get("x-internal-secret")
    if not secret or secret != INTERNAL_SECRET:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    # Check origin and referer. Referer is important to prevent external API usage
    origin = request.headers.get("origin")
    referer = request.headers.get("referer", "")
    if origin and origin.lower() == ALLOWED_FRONTEND_ORIGIN.lower():
        return
    if referer and referer.startswith(ALLOWED_FRONTEND_ORIGIN):
        return
    
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

async def external_call_get(request: Request,
    url: str,
    method: str = "GET",
    params: Optional[Dict[str, Any]] = None,
    json: Optional[Any] = None,
    timeout: float = 10,
    retries: int = 2,
) -> Any:
    """
    Wrapper for making external API calls with request validation.

    Args:
        url (str): The URL to make the request to.
        method (str): The HTTP method to use (GET default for obvious reasons).

    Raises:
        HTTPException: Authorization failure.

    Returns:
        Any: The JSON response from the external API or an error message.
    """
    await validate_request(request)

    headers = {"x-internal-secret": INTERNAL_SECRET}
    attempt = 0

    # Exponential backoff
    while True:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.request(method, url, headers=headers, params=params, json=json)
                resp.raise_for_status()
                return resp.json()
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            if attempt >= 2:
                # Gateway failure if too many attempts
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
            await asyncio.sleep(0.5 * (2 ** attempt))
            attempt += 1

async def batch_call() -> Any:
    """
    Batch call. Potentially the "catch-all" call that will query multiple popular websites simultaneously.

    Returns:
        Any: The aggregated results from the batch of external API calls.
    """
    pass