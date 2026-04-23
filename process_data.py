from data_processor import process, ProcessConfig

data = [
    {"date": "2024-01", "sales": 1200, "region": "north"},
    {"date": "2024-02", "sales": 1450, "region": "north"},
]

result = process(ProcessConfig(
    data=data,
    output_format="summary",
    group_by="date"
))

print(result)