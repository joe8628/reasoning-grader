# api.py — receives raw request body, passes to validator without field checking
from validator import validate
def handle_request(request_body: dict) -> dict:
    """Handle POST /orders — expects user_id and value in body."""
    return validate(request_body)  # user_id not validated here
