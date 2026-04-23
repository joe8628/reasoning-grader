# app_settings.py — request timeout is 25s, shorter than gunicorn's 30s (the mismatch)
REQUEST_TIMEOUT = 25        # seconds — must be < gunicorn timeout to avoid 502s
MAX_PAYLOAD_SIZE = 10_485_760  # 10MB
DB_POOL_SIZE = 10
CACHE_TTL = 300
