import httpx
from httpx import Response
from fastapi import Request, HTTPException, status
import asyncio
from typing import Any, Optional, Dict, List
import json
from user_scanner.core import engine

# Internal
from .config import Config
from .response_handler import ResponseHandler

# Env vars

class UnearthClient:

    async def connect(self):
        self.client = httpx.AsyncClient()
        self.resp_handler = ResponseHandler()
        print(r"""
/////////////////////////////////////////////////////////////////////////////        
/░██     ░██                                              ░██    ░██        /
/░██     ░██                                              ░██    ░██        /
/░██     ░██ ░████████   ░███████   ░██████   ░██░████ ░████████ ░████████  /
/░██     ░██ ░██    ░██ ░██    ░██       ░██  ░███        ░██    ░██    ░██ /
/░██     ░██ ░██    ░██ ░█████████  ░███████  ░██         ░██    ░██    ░██ /
/ ░██   ░██  ░██    ░██ ░██        ░██   ░██  ░██         ░██    ░██    ░██ /
/  ░██████   ░██    ░██  ░███████   ░█████░██ ░██          ░████ ░██    ░██ /
/                                                                           /
/                                        Unearth API Server version 1.1.0   /
/////////////////////////////////////////////////////////////////////////////                             
                                                                           """)
        
    async def disconnect(self):
        if self.client:
            await self.client.aclose()
        print("Disconnected.")

    def __init__(self, config: Config):
        # Init config
        self.conf = config

    async def scanner_batch_call(self, type: str, query: str, use_email: bool = True) -> List[Dict[str, Any]]:
        """
        Wrapper for using user-scanner to make batch calls across different service types to check for username or email.

        Args:
            type (str): The service type (social, entertainment, dev, etc) to search across.
            query (str): The string containing the query content (should be an email or username)
            use_email (bool): A boolean value indicating whether to search email or not. (False = username search instead)
        
        Raises:
            HTTPException (400): Bad request if query or type are empty.

        Returns:
            List[Dict[str, any]]: A list of JSON objects containing information regarding the query. JSON object content will vary.
        """
        if not query:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User query is required.")
        if not type:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Service type is required.")
        
        if (type == "all"):
            results = await engine.check_all(query, use_email)
        else:
            results = await engine.check_category(type, query, use_email)

        data: List[Dict[str, Any]] = []

        for result in results:
            resultdict = result.to_dict()
            if (use_email == True):
                if resultdict.get("status") == "Registered":
                    data.append(resultdict)
            else:
                if resultdict.get("status") == "Found":
                    data.append(resultdict)

        totals = {"Total sites searched": len(results),
                  "Total Hits": len(data)}
        
        data.insert(0, totals)

        return data
    
    async def external_call_get_user(self, request: Request,
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

    async def batch_call_user(self, type: str, query: str, request: Optional[Request] = None) -> Dict:
        """
        Batch call. The custom logic "catch-all" call that will query multiple popular websites simultaneously for usernames.

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
                resp = await self.external_call_get_user(
                    request=request,
                    url=site["query_url"],
                    user_query=query
                )
            except HTTPException as exc:
                key = site.get("name") or name or site.get("query_url")
                responses[key] = {"code": 2, "info": str(exc.detail)}
                continue

            key = site.get("name") or name or site.get("query_url")
            info_dict = self.resp_handler.response_handler_user(resp, site)
            responses[key] = info_dict

        return responses



