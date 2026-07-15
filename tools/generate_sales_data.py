"""
Generates deterministic synthetic sales data for the last 12 months and appends to data_files/sales_data.csv
Run with: python tools/generate_sales_data.py
"""
from datetime import date, timedelta, datetime
import random
import csv

OUT_CSV = r"h:\SalesDashboardProject\data_files\sales_data.csv"
START_DAYS = 365  # last year

managers = ["manager1", "manager2"]
rms = ["rm1", "rm2", "rm3", "rm4"]
clients = [
    ("Omega Corp", "CID100"),
    ("Sigma Ltd", "CID101"),
    ("Tau Inc", "CID102"),
    ("Upsilon LLC", "CID103"),
    ("Phi Partners", "CID104"),
]

random.seed(42)

start_date = date.today() - timedelta(days=START_DAYS)
rows = []
for i in range(START_DAYS + 1):
    d = start_date + timedelta(days=i)
    # skip weekends to keep it realistic
    if d.weekday() >= 5:
        continue
    manager = random.choice(managers)
    rm = random.choice(rms)
    client = random.choice(clients)
    equity = round(random.uniform(500.0, 10000.0), 2)
    mf = round(random.uniform(100.0, 4000.0), 2)
    row = [
        "leader",
        manager,
        rm,
        client[0],
        client[1] + f"-{d.strftime('%Y%m%d')}",
        f"{equity:.2f}",
        f"{mf:.2f}"
    ]
    rows.append(row)

with open(OUT_CSV, "a", newline='', encoding="utf-8") as f:
    writer = csv.writer(f)
    for r in rows:
        writer.writerow(r)

print(f"Appended {len(rows)} rows to {OUT_CSV}")
