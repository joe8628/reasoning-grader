class UserService:
    def __init__(self):
        self.users = {}

    def get_user(self, user_id: str):
        return self.users.get(user_id)

    def authenticate_user(self, user_id: str, credentials: dict):
        # TODO: integrate with auth system in auth.py
        pass
