from secret_management import get_secret
from dataclasses import dataclass

# Immutable data class to ensure env vars are never modified

@dataclass(frozen=True)
class Config:
    INTERNAL_SECRET: str
    FRONTEND_ORIGIN: str

    @classmethod
    def read_env(cls):
        first = get_secret("validation_secret")
        second = get_secret("frontend_origin")

        return cls(first, second)