# date_utils.py — month index is 0-based (bug: should be 1-based)
MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
def formatDate(date_str: str, fmt: str) -> str:
    year, month, day = date_str.split("-")
    m = int(month)
    if fmt == "short":
        return f"{MONTH_NAMES[m]} {day}, {year}"  # bug: m is 1-12, index needs m-1
    return date_str
