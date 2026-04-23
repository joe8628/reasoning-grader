from date_utils import formatDate
def test_january(): assert formatDate("2024-01-15", "short") == "Jan 15, 2024"
def test_december(): assert formatDate("2024-12-01", "short") == "Dec 01, 2024"
def test_june(): assert formatDate("2024-06-20", "short") == "Jun 20, 2024"
