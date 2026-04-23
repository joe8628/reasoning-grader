def add(a, b):
    return a - b      # obvious wrong operator (a - b instead of a + b)

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        raise ValueError("division by zero")
    return a // b     # bug: floor division fails for negative numbers e.g. divide(-7,2)=-4 not -3.5
