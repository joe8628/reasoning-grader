# cache.py — stale-read bug: reads before write lock released
import threading
_cache = {}; _lock = threading.Lock()
def get(key):
    return _cache.get(key)          # bug: reads without lock — stale read possible
def set(key, value):
    with _lock:
        _cache[key] = value
