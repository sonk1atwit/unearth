import httpx
from fastapi import Request, HTTPException, status
import asyncio
from typing import Any, Optional, Dict
import json

# Internal
from config import Config

# Env vars

class UnearthClient:

    async def connect(self):
        self.client = httpx.AsyncClient()
        print(r"""░██     ░██                                              ░██    ░██        
░██     ░██                                              ░██    ░██        
░██     ░██ ░████████   ░███████   ░██████   ░██░████ ░████████ ░████████  
░██     ░██ ░██    ░██ ░██    ░██       ░██  ░███        ░██    ░██    ░██ 
░██     ░██ ░██    ░██ ░█████████  ░███████  ░██         ░██    ░██    ░██ 
 ░██   ░██  ░██    ░██ ░██        ░██   ░██  ░██         ░██    ░██    ░██ 
  ░██████   ░██    ░██  ░███████   ░█████░██ ░██          ░████ ░██    ░██ 
                                                                           
                                                                           
                                                                           """)
        print("\n")
        print("Unearth API Server version 1.1.0")
        
    async def disconnect(self):
        if self.client:
            await self.client.aclose()
        print("Disconnected.")

    def __init__(self, config: Config):
        # Init config
        self.conf = config
    
    async def validate_request(self, request: Request) -> None:
        """
        Use this function in the event of receiving incoming requests.

        Args:
            request (Request): The incoming request object from FastAPI.

        Raises:
            HTTPException (403): Forbidden error if the request is not authorized to prevent abuse of external API calls.

        NOTE: Does not need to be used for every single request, but at the start of each batch. This function verifies that the request
        received is coming exclusively from the front end. 
        """
        # Secret header requirement. Check for header giving proper secret and (unnecessarily) ensure env var is set
        secret = request.headers.get("x-internal-secret")
        if not secret or secret != self.conf._INTERNAL_SECRET:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

        # Check origin and referer. Referer is important to prevent external API usage
        origin = request.headers.get("origin")
        referer = request.headers.get("referer")
        if origin and origin.lower() == self.conf._ALLOWED_FRONTEND_ORIGIN.lower():
            return
        if referer and referer.startswith(self.conf._ALLOWED_FRONTEND_ORIGIN):
            return
        
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    async def external_call_get(self, request: Request,
        url: str,
        method: str = "GET",
        params: Optional[Dict[str, Any]] = None,
        user_query: str = "",
        json: Optional[Any] = None,
        timeout: float = 10,
        retries: int = 2,
    ) -> Any:
        """
        Wrapper for making external API calls with request validation.

        Args:
            url (str): The URL to make the request to.
            method (str): The HTTP method to use (GET default for obvious reasons).
            params (Optional[Dict[str, Any]]): Optional dictionary of query parameters. Probably not necessary.
            user_query (str): The string to append to the end of the service URL. This is the user input (full name or email or username).
            json (Optional[Any]): Optional JSON body to include in the request. Probably not necessary.
            timeout (float): The timeout for the request in seconds.
            retries (int): The number of times to retry the request.

        Raises:
            HTTPException (400): Bad request if user_query is empty.
            HTTPException (502): Authorization failure.

        Returns:
            Any: The JSON response from the external API or an error message.
        """
        if not user_query:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User query is required.")

        await self.validate_request(request)

        url = url + user_query

        attempt = 0

        # Exponential backoff
        while True:
            try:
                async with self.client:
                    resp = await self.client.request(method, url, params=params, json=json)
                    resp.raise_for_status()
                    return resp.json()
            except (httpx.RequestError, httpx.HTTPStatusError) as e:
                if attempt >= 2:
                    # Gateway failure if too many attempts
                    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
                await asyncio.sleep(0.5 * (2 ** attempt))
                attempt += 1

    async def batch_call(self, type: str, query: str) -> Dict:
        """
        Batch call. Potentially the "catch-all" call that will query multiple popular websites simultaneously.

        Returns:
            Any: The aggregated results from the batch of external API calls.
        """
        responses = {}
        file = json.load("backend/data.json")

        for site in file["services"]:
            if site["type"] == type:
                response = self.external_call_get(url=site["query_url"], user_query=query)
                if response["status_code"] == "200":
                    responses[site] = 1
        
        return responses



