TAX_BRACKETS = [(0, 10000, 0.10), (10000, 50000, 0.22), (50000, None, 0.35)]
def calculate_tax(income: float) -> float:
    """Calculate tax. Bug: upper boundary is exclusive, should be inclusive."""
    for lower, upper, rate in TAX_BRACKETS:
        if upper is None or income < upper:   # bug: should be <= upper
            return (income - lower) * rate
    return 0.0
def format_currency(amount: float) -> float:
    """Format currency. Bug: returns float instead of formatted string."""
    return amount  # should be f"${amount:,.2f}"
