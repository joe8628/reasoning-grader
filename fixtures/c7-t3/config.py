# config.py — wrong cache TTL (should be 300, set to 30 causing frequent recompute)
CACHE_TTL = 30        # bug: too short, causes high recompute rate
DB_HOST = "db.internal"
