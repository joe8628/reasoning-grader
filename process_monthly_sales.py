"""Process sales data CSV and compute monthly totals."""

import pandas as pd
from pathlib import Path


def process_monthly_sales(csv_path: str, chunk_size: int = 500_000) -> pd.DataFrame:
    """
    Process large sales CSV in chunks and compute total sales amount per month.
    
    Args:
        csv_path: Path to sales_data.csv
        chunk_size: Number of rows to process at a time (default 500K for memory efficiency)
    
    Returns:
        DataFrame with monthly sales totals
    """
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    
    # Initialize aggregator
    monthly_totals = {}
    
    # Process in chunks to handle 10M rows efficiently
    for chunk in pd.read_csv(csv_path, chunksize=chunk_size):
        # Parse dates (assumes 'date' column exists)
        chunk["date"] = pd.to_datetime(chunk["date"])
        
        # Extract year-month key
        chunk["month"] = chunk["date"].dt.to_period("M")
        
        # Aggregate sales by month
        monthly_totals_chunk = chunk.groupby("month")["sales"].sum()
        
        for month, total in monthly_totals_chunk.items():
            if month in monthly_totals:
                monthly_totals[month] += total
            else:
                monthly_totals[month] = total
    
    # Convert to sorted DataFrame
    result = pd.DataFrame(
        list(monthly_totals.items()),
        columns=["month", "total_sales"]
    ).sort_values("month").reset_index(drop=True)
    
    # Convert period to string for readability
    result["month"] = result["month"].astype(str)
    
    return result


if __name__ == "__main__":
    import sys
    
    csv_file = sys.argv[1] if len(sys.argv) > 1 else "sales_data.csv"
    
    print(f"Processing {csv_file}...")
    result = process_monthly_sales(csv_file)
    
    print(f"\nMonthly Sales Totals:\n{result.to_string(index=False)}")
    print(f"\nTotal months processed: {len(result)}")
    print(f"Overall total: ${result['total_sales'].sum():,.2f}")