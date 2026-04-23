# worker.py — race condition on shared counter
import threading
_processed = 0          # shared counter, no lock
def process_item(item):
    global _processed
    _processed += 1     # bug: not atomic, race condition under concurrency
    return item
