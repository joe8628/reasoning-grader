# step_2.py — aggregate by month (BUG: sums amount twice — double-counts each record)
from collections import defaultdict
def run(records):
    totals = defaultdict(float)
    for r in records:
        month = r["date"][:7]
        totals[month] += r["amount"]
        totals[month] += r["amount"]   # bug: double-add
    return [{"month": k, "total": v} for k, v in totals.items()]
