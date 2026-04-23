class UserPreferences:
    DEFAULTS = {"notifications": True, "language": "en", "timezone": "UTC"}
    def __init__(self, user_id: str):
        self.user_id = user_id
        self._prefs = dict(self.DEFAULTS)
    def get(self, key: str):
        return self._prefs.get(key)
    def set(self, key: str, value) -> None:
        self._prefs[key] = value
    def reset(self) -> None:
        self._prefs = dict(self.DEFAULTS)
    def to_dict(self) -> dict:
        return dict(self._prefs)
