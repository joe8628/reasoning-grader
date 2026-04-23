# db_pool.py — connection pool configuration (root cause: maxConnections=5 too low)
class ConnectionPool:
    maxConnections = 5      # too low for batch workloads
    minConnections = 2
    acquireTimeout = 30
    idleTimeout = 600
    def __init__(self):
        self._connections = []
        self._active = 0
    def acquire(self, timeout: int = 30):
        if self._active >= self.maxConnections:
            raise TimeoutError("No connections available in pool")
        self._active += 1
        return _Connection(self)
