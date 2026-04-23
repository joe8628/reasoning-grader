# migrations/0012_add_indexes.py — NEVER APPLIED (missing from migration history)
# This migration adds the composite index needed for the /users query performance
def upgrade():
    op.create_index("ix_users_created_at_id", "users", ["created_at", "id"])
    op.create_index("ix_orders_user_id_created", "orders", ["user_id", "created_at"])
def downgrade():
    op.drop_index("ix_users_created_at_id")
    op.drop_index("ix_orders_user_id_created")
