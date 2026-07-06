import httpx
from httpx import Response
from fastapi import Request, HTTPException, status
import asyncio
from typing import Any, Optional, Dict
import json

# Internal
from config import Config
from response_handler import ResponseHandler

# Env vars

class UnearthClient:

    async def connect(self):
        self.client = httpx.AsyncClient()
        self.resp_handler = ResponseHandler()
        print(r"""
        
░██     ░██                                              ░██    ░██        
░██     ░██                                              ░██    ░██        
░██     ░██ ░████████   ░███████   ░██████   ░██░████ ░████████ ░████████  
░██     ░██ ░██    ░██ ░██    ░██       ░██  ░███        ░██    ░██    ░██ 
░██     ░██ ░██    ░██ ░█████████  ░███████  ░██         ░██    ░██    ░██ 
 ░██   ░██  ░██    ░██ ░██        ░██   ░██  ░██         ░██    ░██    ░██ 
  ░██████   ░██    ░██  ░███████   ░█████░██ ░██          ░████ ░██    ░██ 
                                                                           
                                        Unearth API Server version 1.1.0                               
                                                                           """)
        
    async def disconnect(self):
        if self.client:
            await self.client.aclose()
        print("Disconnected.")

    def __init__(self, config: Config):
        # Init config
        self.conf = config

    async def external_call_get(self, request: Request,
        url: str,
        method: str = "GET",
        params: Optional[Dict[str, Any]] = None,
        user_query: str = "",
        json: Optional[Any] = None,
        timeout: float = 10,
        retries: int = 2,
    ) -> Response:
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

        # await self.validate_request(request)

        url = url + user_query
        print(f"[DEBUG] Requesting URL: {url}")

        attempt = 0

        # Exponential backoff
        while True:
            try:
                resp = await self.client.request(method, url, params=params, json=json, timeout=timeout)

                """
                print(f"[DEBUG] Status {resp.status_code} for {url}")
                if resp.history:
                    print(f"[DEBUG] Redirect history: {[(r.status_code, str(r.url)) for r in resp.history]}")
                if resp.is_redirect:
                    print(f"[DEBUG] Final redirect target: {resp.headers.get('location')}")
                """

                if resp.is_error and resp.status_code >= 500:
                    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Upstream service error: {resp.status_code}")

                print(f"Response for {url}: {resp}")
                return resp
            except (httpx.RequestError, HTTPException) as e:
                if attempt >= retries:
                    # Gateway failure if too many attempts
                    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
                await asyncio.sleep(0.5 * (2 ** attempt))
                attempt += 1

    async def batch_call(self, type: str, query: str, request: Optional[Request] = None) -> Dict:
        """
        Batch call. Potentially the "catch-all" call that will query multiple popular websites simultaneously.

        Returns:
            Any: The aggregated results from the batch of external API calls.
        """
        responses: Dict[str, Dict[str, Any]] = {}
        
        with open("data.json", "r", encoding="utf-8") as fh:
            data = json.load(fh)

        for name, site in data.get("services", {}).items():
            
            if site.get("type") != type:
                continue

            try:
                resp = await self.external_call_get(
                    request=request,
                    url=site["query_url"],
                    user_query=query
                )
            except HTTPException as exc:
                key = site.get("name") or name or site.get("query_url")
                responses[key] = {"code": 2, "info": str(exc.detail)}
                continue

            key = site.get("name") or name or site.get("query_url")
            info_dict = self.resp_handler.response_handler(resp, site)
            responses[key] = info_dict

        return responses



