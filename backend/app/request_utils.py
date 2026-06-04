import os
import requests
from fastapi import Request, HTTPException, status

# Env vars
INTERNAL_SECRET = os.getenv("INTERNAL_SECRET") 
ALLOWED_FRONTEND_ORIGIN = os.getenv("ALLOWED_FRONTEND_ORIGIN") # No default; should always be set

async def validate_request(request: Request):
    """
    Use this function in the event of any request made out to external APIs. 

    Args:
        request (Request): The incoming request object from FastAPI.

    Raises:
        HTTPException: Raises a 403 Forbidden error if the request is not authorized to prevent abuse of external API calls.

    TODO: Does not need to be used for every single request, but at the start of each batch. As of now this checks individual requests.
    This should be changed to check batches of requests or validate a single header before a large batch of requests to prevent bottleneck. 
    """
    # Secret header requirement
    secret = request.headers.get("x-internal-secret")
    if INTERNAL_SECRET and secret and secret == INTERNAL_SECRET:
        return

    # Check origin
    origin = request.headers.get("origin")
    referer = request.headers.get("referer", "")
    if origin and origin.lower() == ALLOWED_FRONTEND_ORIGIN.lower():
        return
    if referer and referer.startswith(ALLOWED_FRONTEND_ORIGIN):
        return
    
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

async def external_call(url: str, method: str = "GET", **kwargs):
    """
    Wrapper for making external API calls with request validation.

    Args:
        url (str): The URL to make the request to.
        method (str): The HTTP method to use (default is "GET").
        **kwargs: Additional arguments to pass to the requests method.
    """
    pass
    
