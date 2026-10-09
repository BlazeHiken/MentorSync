from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import UserProfile, Role

class Command(BaseCommand):
    help = 'Seeds initial demo users: Admin, Mentor, and Student'

    def handle(self, *args, **kwargs):
        # 1. Update any existing superusers to ADMIN profile
        for superuser in User.objects.filter(is_superuser=True):
            profile, _ = UserProfile.objects.get_or_create(user=superuser)
            profile.role = Role.ADMIN
            profile.department = profile.department or 'Administration'
            profile.save()
            self.stdout.write(self.style.SUCCESS(f"Updated superuser '{superuser.username}' to ADMIN role."))

        # 2. Demo Admin
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@mentorsync.edu',
                'first_name': 'System',
                'last_name': 'Administrator',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('password123')
            admin_user.save()
        profile, _ = UserProfile.objects.get_or_create(user=admin_user)
        profile.role = Role.ADMIN
        profile.department = 'Administration'
        profile.save()
        self.stdout.write(self.style.SUCCESS("Admin ready: admin / password123"))

        # 3. Demo Mentor
        mentor_user, created = User.objects.get_or_create(
            username='mentor_rahul',
            defaults={
                'email': 'rahul.sharma@mentorsync.edu',
                'first_name': 'Rahul',
                'last_name': 'Sharma',
            }
        )
        if created:
            mentor_user.set_password('password123')
            mentor_user.save()
        profile, _ = UserProfile.objects.get_or_create(user=mentor_user)
        profile.role = Role.MENTOR
        profile.department = 'Computer Science'
        profile.designation = 'Assistant Professor'
        profile.phone = '+91 98765 43210'
        profile.save()
        self.stdout.write(self.style.SUCCESS("Mentor ready: mentor_rahul / password123"))

        # 4. Demo Student
        student_user, created = User.objects.get_or_create(
            username='student_aarav',
            defaults={
                'email': 'aarav.patel@mentorsync.edu',
                'first_name': 'Aarav',
                'last_name': 'Patel',
            }
        )
        if created:
            student_user.set_password('password123')
            student_user.save()
        profile, _ = UserProfile.objects.get_or_create(user=student_user)
        profile.role = Role.STUDENT
        profile.department = 'Computer Science'
        profile.roll_number = 'CS2026-042'
        profile.phone = '+91 91234 56789'
        profile.save()
        self.stdout.write(self.style.SUCCESS("Student ready: student_aarav / password123"))
