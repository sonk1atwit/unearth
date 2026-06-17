import os

def get_secret(secret_name) -> str:
    """
    Return a secret via docker compose.

    Args:
        secret_name (str): The name of the secret to retrieve.

    Returns:
        str: The value of the secret.
    """
    # Default path
    secret_path = f"/run/secrets/{secret_name}"
    
    if os.path.exists(secret_path):
        with open(secret_path, "r") as f:
            return f.read().strip()
    else:
        raise FileNotFoundError(f"Secret '{secret_name}' not found at {secret_path}")