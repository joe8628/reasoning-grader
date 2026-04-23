# step_5.py — format output
def run(records): return [{"month": r["month"], "total": f"{r['total']:.2f}"} for r in records]
