import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SalesDashboard.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import UserProfile

def create_prerana_user():
    username = 'prerana'
    password = 'prerana@123'
    
    # Check if user exists
    if User.objects.filter(username=username).exists():
        print(f"User '{username}' already exists. Updating password...")
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
    else:
        print(f"Creating user '{username}'...")
        user = User.objects.create_user(username=username, password=password)
        user.save()
    
    # Create profile if not exists
    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.role = 'L'  # Give leader access so they can see everything in the portal
    profile.save()
    
    print(f"Success: User '{username}' is ready with password '{password}'")

if __name__ == '__main__':
    create_prerana_user()
