from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Employee, UserProfile


class Command(BaseCommand):
    help = 'Create login accounts for all 23 employees from Employee dimension with Demo@123456 password'

    def handle(self, *args, **options):
        # Get all employees from Employee dimension
        employees = Employee.objects.filter(is_active=True).order_by('rm_name')
        
        password = "Demo@123456"
        total_created = 0
        total_updated = 0

        self.stdout.write(self.style.SUCCESS('=' * 100))
        self.stdout.write(self.style.SUCCESS('CREATING LOGIN CREDENTIALS FOR ALL 23 EMPLOYEES'))
        self.stdout.write(self.style.SUCCESS('=' * 100))
        self.stdout.write(self.style.WARNING(f'\nPassword for all users: {password}\n'))

        # Create users for all employees
        for emp in employees:
            username = emp.rm_name.lower().replace(" ", "_")
            
            user, created = User.objects.get_or_create(username=username, defaults={
                'email': emp.email or f'{username}@onecapital.com',
                'first_name': emp.rm_name.split()[0] if emp.rm_name else '',
                'last_name': ' '.join(emp.rm_name.split()[1:]) if len(emp.rm_name.split()) > 1 else '',
            })
            
            # Always set password to Demo@123456
            user.set_password(password)
            user.save()
            
            # Create or update UserProfile
            profile, profile_created = UserProfile.objects.get_or_create(user=user)
            
            # Only update if not already linked to an employee, or if linking to same employee
            if not profile.employee or profile.employee.wire_code == emp.wire_code:
                profile.employee = emp
                profile.wire_code = emp.wire_code
                
                # Assign role based on hierarchy position
                if emp.manager is None:
                    # Top-level (no manager) = Leader
                    profile.role = 'L'
                    role_display = 'LEADER'
                elif emp.subordinates.exists():
                    # Has subordinates = Manager
                    profile.role = 'M'
                    role_display = 'MANAGER'
                else:
                    # Leaf node = RM
                    profile.role = 'R'
                    role_display = 'RM/MA'
                
                profile.save()
            else:
                # Already linked to different employee, skip
                role_display = 'SKIPPED'
            
            if created:
                total_created += 1
                status = "Created"
            else:
                total_updated += 1
                status = "Updated"
            
            self.stdout.write(f"  {status}: {emp.rm_name:30} ({username:25}) | {role_display:10} | {emp.wire_code}")

        # Print Summary
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 100))
        self.stdout.write(self.style.SUCCESS('SUMMARY'))
        self.stdout.write(self.style.SUCCESS('=' * 100))
        self.stdout.write(f"Total Users Created: {total_created}")
        self.stdout.write(f"Total Users Updated: {total_updated}")
        self.stdout.write(f"Total Users: {total_created + total_updated}")

        # Get role counts
        leaders = UserProfile.objects.filter(role='L').count()
        managers = UserProfile.objects.filter(role='M').count()
        rms = UserProfile.objects.filter(role='R').count()
        
        self.stdout.write(f"\nRole Distribution:")
        self.stdout.write(f"  Leaders: {leaders}")
        self.stdout.write(f"  Managers: {managers}")
        self.stdout.write(f"  RMs/MAs: {rms}")

        # Print Complete List
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 100))
        self.stdout.write(self.style.SUCCESS('COMPLETE LOGIN CREDENTIALS (All passwords: Demo@123456)'))
        self.stdout.write(self.style.SUCCESS('=' * 100))

        for emp in employees:
            username = emp.rm_name.lower().replace(" ", "_")
            profile = UserProfile.objects.get(user__username=username)
            role_display = dict(profile._meta.get_field('role').choices).get(profile.role, 'Unknown')
            
            self.stdout.write(f"  {emp.rm_name:30} | {username:25} | {role_display:15} | {emp.wire_code}")

        self.stdout.write(self.style.SUCCESS('\n' + '=' * 100))
        self.stdout.write(self.style.SUCCESS('[OK] All accounts have been created/updated successfully!'))
        self.stdout.write(self.style.SUCCESS('[OK] All users can login with password: Demo@123456'))
        self.stdout.write(self.style.SUCCESS('=' * 100))
