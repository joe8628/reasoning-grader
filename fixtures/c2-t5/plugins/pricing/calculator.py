# plugins/pricing/calculator.py — actual discount logic lives here
class PricingCalculator:
    BASE_TAX_RATE = 0.08
    def calculate(self, order) -> float:
        subtotal = sum(item.price * item.quantity for item in order.items)
        return subtotal * (1 + self.BASE_TAX_RATE)
    def apply_discount(self, order, discount_pct: float) -> float:
        base = self.calculate(order)
        return base * (1 - discount_pct / 100)
    # loyalty discount: TODO — apply 15% for accounts > 1 year
