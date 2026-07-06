from httpx import Response
from typing import Any, Dict
import re

class ResponseHandler:
    
    def response_handler(self, resp: Response, site: Any) -> Dict[str, Any]:
        """
        Response handler. Takes a response from a website and its corresponding json object to iterate through and
        interpret results.

        Args:
            resp (Response): The HTTPX response object to search through.
            site (Any): The json object corresponding to the site/service searched.

        Returns:
            Dict[str, Any]: A dictionary containing the status code and message for the account lookup result.
            NOTE: The integer returned can be - 0: Account does not exist - 1: Account exists - 2: Account may or may not exist but required information was not found.
        """
        code = -1
        info = "Query for site failed."

        error_type = site.get("error_type")
        body_regex = site.get("body_regex")
        error_regex = site.get("error_regex")
        error_code = site.get("error_code")

        body_text = resp.text if hasattr(resp, "text") else ""
        if not body_text:
            body_text = resp.content.decode("utf-8", errors="ignore") if hasattr(resp, "content") else ""

        # Message error type
        if(error_type == "message"):

            body_match = re.search(body_regex, body_text, re.S) if body_regex else None
            code_match = re.search(error_regex, body_text, re.S) if error_regex else None

            if(code_match):
                code = 0
                info = "User not found."
            elif(body_match):
                info = body_match.groupdict().get("value", body_match.group(1))
                code = 1
            else:
                info = "Error fetching error code and/or response body."
                code = 2
        
        # Standard code error type
        if(error_type == "status_code"):

            body_match = re.search(body_regex, body_text, re.S) if body_regex else None
            code_match = resp.status_code == error_code

            if(code_match):
                code = 0
                info = "User not found."
            elif (body_match):
                info = body_match.groupdict().get("value", body_match.group(1))
                code = 1
            else:
                info = "Error fetching error code and response body."
                code = 2

        return {"code": code, "info": info}
