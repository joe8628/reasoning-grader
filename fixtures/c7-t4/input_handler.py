# input_handler.py — unvalidated user input passed to shell
import subprocess
def run_report(report_name: str):
    subprocess.run(f"generate-report {report_name}", shell=True)  # injection risk
