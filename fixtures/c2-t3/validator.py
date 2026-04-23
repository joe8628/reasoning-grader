# validator.py — passes data through without checking required fields
from database import store
def validate(data: dict) -> dict:
    if not isinstance(data, dict):
        raise ValueError("data must be a dict")
    return store(data)  # passes unchecked to database
