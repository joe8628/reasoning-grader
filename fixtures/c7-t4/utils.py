# utils.py — clean, no issues
def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))
