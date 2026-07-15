import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SalesDashboard.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import SalesRecord

# Get unique values
rms = list(SalesRecord.objects.values_list('rm_name', flat=True).distinct().exclude(rm_name__isnull=True).exclude(rm_name__exact=''))
mas = list(SalesRecord.objects.values_list('ma_name', flat=True).distinct().exclude(ma_name__isnull=True).exclude(ma_name__exact=''))
managers = list(SalesRecord.objects.values_list('rm_manager_name', flat=True).distinct().exclude(rm_manager_name__isnull=True).exclude(rm_manager_name__exact=''))

print("=" * 80)
print("CREATING LOGIN CREDENTIALS FOR ALL USERS")
print("=" * 80)

all_users = {}

# Create RMs
print("\n--- RELATIONSHIP MANAGERS (RM) ---")
for rm in rms:
    username = rm.lower().replace(" ", "_")
    password = "RM@123456"
    user, created = User.objects.get_or_create(username=username, defaults={
        'email': f'{username}@rm.com',
        'first_name': rm.split()[0] if rm else '',
        'last_name': ' '.join(rm.split()[1:]) if len(rm.split()) > 1 else '',
    })
    if created:
        user.set_password(password)
        user.save()
        print(f"[OK] Created RM: {username:30} | Password: {password}")
    else:
        print(f"\u2022 Already exists: {username:30} | Password: {password}")
    all_users[rm] = {'username': username, 'password': password, 'role': 'RM', 'original_name': rm}

# Create MAs
print("\n--- MUTUAL FUND ADVISORS (MA) ---")
for ma in mas:
    username = ma.lower().replace(" ", "_")
    password = "MA@123456"
    user, created = User.objects.get_or_create(username=username, defaults={
        'email': f'{username}@ma.com',
        'first_name': ma.split()[0] if ma else '',
        'last_name': ' '.join(ma.split()[1:]) if len(ma.split()) > 1 else '',
    })
    if created:
        user.set_password(password)
        user.save()
        print(f"[OK] Created MA: {username:30} | Password: {password}")
    else:
        print(f"\u2022 Already exists: {username:30} | Password: {password}")
    all_users[ma] = {'username': username, 'password': password, 'role': 'MA', 'original_name': ma}

# Create Managers
print("\n--- MANAGERS ---")
for manager in managers:
    username = manager.lower().replace(" ", "_")
    password = "Manager@123456"
    user, created = User.objects.get_or_create(username=username, defaults={
        'email': f'{username}@manager.com',
        'first_name': manager.split()[0] if manager else '',
        'last_name': ' '.join(manager.split()[1:]) if len(manager.split()) > 1 else '',
    })
    if created:
        user.set_password(password)
        user.save()
        print(f"[OK] Created Manager: {username:30} | Password: {password}")
    else:
        print(f"\u2022 Already exists: {username:30} | Password: {password}")
    all_users[manager] = {'username': username, 'password': password, 'role': 'Manager', 'original_name': manager}

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Total RMs: {len(rms)}")
print(f"Total MAs: {len(mas)}")
print(f"Total Managers: {len(managers)}")
print(f"Total Users Created/Updated: {len(all_users)}")

print("\n" + "=" * 80)
print("COMPLETE LOGIN LIST")
print("=" * 80)

# Print organized table
print("\nRELATIONSHIP MANAGERS (RM):")
print("-" * 80)
for rm in rms:
    info = all_users[rm]
    print(f"  Name: {rm:30} | Username: {info['username']:30} | Password: RM@123456")

print("\n\nMUTUAL FUND ADVISORS (MA):")
print("-" * 80)
for ma in mas:
    info = all_users[ma]
    print(f"  Name: {ma:30} | Username: {info['username']:30} | Password: MA@123456")

print("\n\nMANAGERS:")
print("-" * 80)
for manager in managers:
    info = all_users[manager]
    print(f"  Name: {manager:30} | Username: {info['username']:30} | Password: Manager@123456")

print("\n" + "=" * 80)
print("[OK] All accounts have been created successfully!")
print("=" * 80)
