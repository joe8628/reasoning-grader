# main.py — uses match statement (Python 3.10+ only)
def handle_command(cmd: str) -> str:
    match cmd:
        case "start": return "Starting..."
        case "stop": return "Stopping..."
        case _: return f"Unknown command: {cmd}"
