# pricing.py — thin facade, delegates to plugin
from plugins.pricing.calculator import PricingCalculator
_calc = PricingCalculator()
def calculate_order_price(order) -> float:
    return _calc.calculate(order)
def apply_discount(order, discount_pct: float) -> float:
    return _calc.apply_discount(order, discount_pct)
