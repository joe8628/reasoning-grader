from dataclasses import dataclass, field
from datetime import date
@dataclass
class OrderItem:
    sku: str; price: float; quantity: int
@dataclass
class Order:
    order_id: str; customer_id: str
    items: list[OrderItem] = field(default_factory=list)
    created_at: date = field(default_factory=date.today)
