# In-memory dict-based cache — no Memcached dependency anywhere
class MemoryCache:
    """Simple in-memory cache using a Python dict."""
    def __init__(self, max_size: int = 1000):
        self._store: dict = {}
        self.max_size = max_size
    def get(self, key: str):
        return self._store.get(key)
    def set(self, key: str, value, ttl: int = 300) -> None:
        if len(self._store) >= self.max_size:
            oldest = next(iter(self._store))
            del self._store[oldest]
        self._store[key] = value
    def delete(self, key: str) -> None:
        self._store.pop(key, None)
    def flush(self) -> None:
        self._store.clear()
