import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SalesDashboard.settings')
django.setup()

from django.contrib.auth.models import User

# Update user names
user_data = {
    'anil_gavali': ('Anil', 'Gavali'),
    'bhushan_kulkarni': ('Bhushan', 'Kulkarni'),
    'dhananjay_yadav': ('Dhananjay', 'Yadav'),
    'kedar_kulkarni': ('Kedar', 'Kulkarni'),
    'abhijeet_mane': ('Abhijeet', 'Mane'),
    'rahul_khot': ('Rahul', 'Khot'),
    'rohan_joshi': ('Rohan', 'Joshi'),
    'ashwini_patankar': ('Ashwini', 'Patankar'),
    'nm': ('NM', ''),
}

for username, (first_name, last_name) in user_data.items():
    user = User.objects.filter(username=username).first()
    if user:
        user.first_name = first_name
        user.last_name = last_name
        user.save()
        print(f"Updated {username}: {user.get_full_name()}")

print("All users updated!")
