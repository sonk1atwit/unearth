from httpx import Response
from typing import Any, Dict
import re

class ResponseHandler:
    
    def response_handler(resp: Response, site: Any) -> Dict[int, str]:
        """
        Response handler. Takes a response from a website and its corresponding json object to iterate through and
        interpret results.

        Args:
            resp (Response): The HTTPX response object to search through.
            site (Any): The json object corresponding to the site/service searched.

        Returns:
            Dict[int, str]: A dictionary containing an int as well as a string containing any relevant info regarding the account if it is found.
            NOTE: The integer returned can be - 0: Account does not exist - 1: Account exists - 2: Account may or may not exist but required information was not found.
        """
        code = -1
        info = "User/person does not exist."

        error_type = site.get("error_type")
        body_regex = site.get("body_regex")
        error_regex = site.get("error_regex")
        error_code = site.get("error_code")

        # Message error type
        if(error_type == "message"):

            body_match = re.search(body_regex, str(resp.content))
            code_match = re.search(error_regex) in str(resp.content)

            if(code_match):
                code = 0
            elif(body_match):
                info = body_match.group(1)
                code = 1
            else:
                info = "Error fetching error code and/or response body."
                code = 2
        
        # Standard code error type
        if(error_type == "status_code"):

            body_match = re.search(body_regex, str(resp.content))
            code_match = resp.status_code == error_code

            if(code_match):
                code = 0
            elif (body_match):
                info = body_match.group(1)
                code = 1
            else:
                info = "Error fetching error code and/or response body."
                code = 2

        return {code, info}
