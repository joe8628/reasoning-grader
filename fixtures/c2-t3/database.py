_records = []
def store(data: dict) -> dict:
    record = {"id": data["user_id"], "value": data["value"]}  # line 4 — KeyError here
    _records.append(record)
    return record
