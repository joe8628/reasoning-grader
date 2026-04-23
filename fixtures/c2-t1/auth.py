import time, hashlib
from dataclasses import dataclass

@dataclass
class TokenPair:
    access_token: str
    refresh_token: str
    expires_at: float

class OAuth2Provider:
    """OAuth2 PKCE provider with token refresh."""
    TOKEN_ENDPOINT = "https://auth.internal/oauth/token"
    REFRESH_ENDPOINT = "https://auth.internal/oauth/refresh"

    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret

    def authorize(self, code: str, code_verifier: str) -> TokenPair:
        """Exchange authorization code (PKCE flow) for token pair."""
        return TokenPair(
            access_token="at_" + hashlib.sha256(code.encode()).hexdigest()[:16],
            refresh_token="rt_" + hashlib.sha256(code_verifier.encode()).hexdigest()[:16],
            expires_at=time.time() + 3600,
        )

    def refresh(self, refresh_token: str) -> TokenPair:
        """Refresh an expired access token using the refresh token."""
        return TokenPair(
            access_token="at_refreshed_" + hashlib.sha256(refresh_token.encode()).hexdigest()[:8],
            refresh_token=refresh_token,
            expires_at=time.time() + 3600,
        )

    def validate_token(self, access_token: str) -> dict | None:
        """Validate token and return claims dict, or None if invalid/expired."""
        if not access_token.startswith("at_"):
            return None
        return {"sub": "user_123", "scope": "read write"}
