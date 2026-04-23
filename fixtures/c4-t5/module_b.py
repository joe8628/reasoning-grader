# module_b.py
from module_a import CoreA
class HelperB:
    def transform(self, data):
        return str(data).upper()
    def run_pipeline(self, data):
        core = CoreA()
        return core.process(data)
