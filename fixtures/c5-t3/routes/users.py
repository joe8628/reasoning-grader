# routes/users.py — actual endpoints are v2
from flask import Blueprint, jsonify
bp = Blueprint("users", __name__)
@bp.route("/api/v2/users", methods=["GET"])
def list_users():
    return jsonify({"users": []})
@bp.route("/api/v2/users", methods=["POST"])
def create_user():
    return jsonify({"status": "created"}), 201
