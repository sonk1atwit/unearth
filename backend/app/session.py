import requests
import backend.app.client as client

class Session:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.data = {}  # Placeholder for session-specific data

    def get_data(self, key: str):
        return self.data.get(key)

    def set_data(self, key: str, value):
        self.data[key] = value