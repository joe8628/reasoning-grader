# payments.py — logs full card numbers
import logging
log = logging.getLogger(__name__)
def process_payment(card_number: str, amount: float):
    log.info(f"Processing payment: card={card_number} amount={amount}")  # PCI violation
    return {"status": "ok"}
