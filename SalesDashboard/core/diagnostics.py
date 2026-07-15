"""
Quick diagnostic script to check database state
Run from Django shell: python manage.py shell < core/diagnostics.py
"""

from core.models import SalesRecord
from django.db.models import Count, Q

print("=" * 80)
print("DATABASE DIAGNOSTIC REPORT")
print("=" * 80)

# Total records
total = SalesRecord.objects.count()
print(f"\n\u1f4ca Total SalesRecords in database: {total}")

# Breakdown by data source
brokerage_count = SalesRecord.objects.filter(data_source='BROKERAGE').count()
mf_count = SalesRecord.objects.filter(data_source='MF').count()

print(f"\n  \u2022 Brokerage records: {brokerage_count}")
print(f"  \u2022 MF records: {mf_count}")

# Breakdown by RM_Name
print(f"\n\u1f4c8 Records by RM_Name:")
rm_breakdown = SalesRecord.objects.values('rm_name').annotate(
    count=Count('id'),
    brokerage=Count('id', filter=Q(data_source='BROKERAGE')),
    mf=Count('id', filter=Q(data_source='MF'))
).order_by('-count')

if rm_breakdown:
    for item in rm_breakdown:
        print(f"  \u2022 {item['rm_name']}: {item['count']} total ({item['brokerage']} brokerage, {item['mf']} MF)")
else:
    print("  \u26a0\ufe0f  No RM names found")

# Check unique values
print(f"\n\u1f50d Unique values:")
print(f"  \u2022 Unique RM names: {SalesRecord.objects.values('rm_name').distinct().count()}")
print(f"  \u2022 Unique MA names: {SalesRecord.objects.values('ma_name').distinct().count()}")
print(f"  \u2022 Unique clients: {SalesRecord.objects.values('client_name').distinct().count()}")

# Recent records
print(f"\n\u23f1\ufe0f  Recent records (last 5):")
recent = SalesRecord.objects.order_by('-created_at')[:5]
for record in recent:
    print(f"  \u2022 {record.rm_name} | {record.client_name} | {record.total_brokerage} | {record.created_at}")

print("\n" + "=" * 80)
