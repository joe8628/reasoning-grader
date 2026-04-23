# step_1.py — load raw data
def run(data): return [{"date": r["date"], "amount": float(r["amount"]), "region": r["region"]} for r in data]
