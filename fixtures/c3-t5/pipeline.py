# pipeline.py — imports db_pool for connection management
from db_pool import ConnectionPool
class DataPipeline:
    def __init__(self):
        self.pool = ConnectionPool()  # configured in db_pool.py
    def get_connection(self):
        return self.pool.acquire(timeout=30)
    def run_batch(self, records: list) -> list:
        results = []
        for record in records:
            conn = self.get_connection()  # line 58 — pool exhausted here
            results.append(conn.execute(f"INSERT INTO processed VALUES ({record!r})"))
        return results
