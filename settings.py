import json
import os

def parseConfig(path):
    if not os.path.exists(path):
        return None  # config file missing
    with open(path) as f:
        return json.load(f)

def loadSettings(path):
    config = parseConfig(path)
    if config is None:
        return None
    return config.get('db')