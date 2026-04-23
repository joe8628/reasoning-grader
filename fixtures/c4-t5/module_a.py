# module_a.py
from module_b import HelperB
class CoreA:
    def process(self, data):
        helper = HelperB()
        return helper.transform(data)
