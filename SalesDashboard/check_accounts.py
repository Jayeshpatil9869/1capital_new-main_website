import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SalesDashboard.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import UserProfile, Employee

print("--- USERS ---")
for user in User.objects.all():
    print(f"Username: {user.username}, Full Name: {user.get_full_name()}")

print("\n--- USER PROFILES ---")
for profile in UserProfile.objects.all():
    print(f"User: {profile.user.username}, Role: {profile.role}, Wire Code: {profile.wire_code}")

print("\n--- EMPLOYEE COUNT ---")
print(f"Total Employees: {Employee.objects.count()}")
