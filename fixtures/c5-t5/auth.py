import hmac, hashlib
SECRET_KEY = "super-secret-key-do-not-commit-abc123"  # hardcoded — should be env var
SESSION_DURATION = 3600
def create_session_token(user_id: str) -> str:
    payload = f"{user_id}:{SESSION_DURATION}"
    sig = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{sig}"
def verify_token(token: str) -> str | None:
    try:
        payload, sig = token.rsplit(".", 1)
        expected = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if hmac.compare_digest(sig, expected):
            return payload.split(":")[0]
    except Exception:
        pass
    return None
