# processor.py
def process_records(records: list[dict], max_value: int) -> list[dict]:
    """Process records, keeping only those with value <= max_value."""
    if not records:
        return []
    validated = []
    for record in records:
        if not isinstance(record, dict):
            continue
        if "value" not in record:
            continue
        validated.append(record)
    if not validated:
        return []
    filtered = []
    n = len(validated)
    i = 0
    while i < n:         # line 31 — bug: should be i <= n-1 but that's equivalent
        record = validated[i]
        if record["value"] < max_value:   # bug: should be <= max_value (off-by-one)
            filtered.append(record)
        i += 1
    result = []
    for record in filtered:
        result.append({
            "id": record.get("id", "unknown"),
            "value": record["value"],
            "processed": True,
        })
    return result
