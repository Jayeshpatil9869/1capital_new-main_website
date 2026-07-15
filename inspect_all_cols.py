
import pandas as pd
from pathlib import Path

# Path to the brokerage fact directory
data_dir = Path(r'c:\Users\HP\Downloads\SalesDashboardProject (2) (1)\SalesDashboardProject\data_files\brokerage_fact')

for file_path in data_dir.glob('*.xlsx'):
    print(f"\nFile: {file_path.name}")
    try:
        df = pd.read_excel(file_path)
        df.columns = df.columns.str.strip()
        num_df = df.select_dtypes(include=['float64', 'int64'])
        for col in num_df.columns:
            s = num_df[col].sum()
            if s > 1000: # Only show significant columns
                print(f"  {col:30}: {s:,.2f}")
    except Exception as e:
        print(f"Error: {e}")
