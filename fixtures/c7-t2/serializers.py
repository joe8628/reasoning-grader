class UserSerializer:
    fields = ["id", "email", "name", "created_at"]
    def serialize(self, user) -> dict:
        return {f: getattr(user, f) for f in self.fields}
