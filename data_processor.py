"""data-processor package implementation."""


class ProcessConfig:
    def __init__(self, data, output_format="summary", group_by=None):
        self.data = data
        self.output_format = output_format
        self.group_by = group_by


def process(config: ProcessConfig):
    """Process data based on config."""
    data = config.data
    
    if config.group_by == "date":
        grouped = {}
        for item in data:
            key = item.get("date")
            if key not in grouped:
                grouped[key] = {"sales": 0, "region": item.get("region")}
            grouped[key]["sales"] += item.get("sales", 0)
        return {"summary": grouped, "total": sum(item["sales"] for item in data)}
    
    return {"result": data, "total": sum(item.get("sales", 0) for item in data)}