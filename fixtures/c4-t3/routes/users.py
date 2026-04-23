# routes/users.py — obvious N+1: fetches orders separately for each user
from models.user import User
def get_users():
    users = User.query.all()
    result = []
    for user in users:  # N+1: separate query per user
        orders = Order.query.filter_by(user_id=user.id).all()
        result.append({"user": user.to_dict(), "order_count": len(orders)})
    return result
