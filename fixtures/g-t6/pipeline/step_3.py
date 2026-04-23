# step_3.py — filter regions
def run(records): return [r for r in records if r.get("total", 0) > 0]
