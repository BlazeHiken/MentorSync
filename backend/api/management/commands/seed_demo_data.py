from datetime import date
from django.conf import settings
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError

from accounts.models import UserProfile, Role
from api.models import (
    Division,
    Assignment,
    Feedback,
    FeedbackCategory,
    SatisfactionSurvey,
    Issue,
    IssueCategory,
    IssuePriority,
    IssueStatus,
    MentoringSession,
)


class Command(BaseCommand):
    help = 'Seeds initial baseline demo data (users, divisions, assignments, issues, feedbacks, sessions). Use --reset to restore baseline.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Wipes existing demo issues, sessions, feedbacks, and assignments before reseeding to baseline state.',
        )

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("This command can only be run when DEBUG is True.")

        reset = options.get('reset', False)

        if reset:
            self.stdout.write(self.style.WARNING("Resetting existing demo records..."))
            SatisfactionSurvey.objects.all().delete()
            Feedback.objects.all().delete()
            MentoringSession.objects.all().delete()
            Issue.objects.all().delete()
            Assignment.objects.all().delete()
            Division.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("Demo records cleaned successfully."))

        # 1. Ensure Superusers have ADMIN profile
        for superuser in User.objects.filter(is_superuser=True):
            profile, _ = UserProfile.objects.get_or_create(user=superuser)
            profile.role = Role.ADMIN
            profile.department = profile.department or 'Administration'
            profile.save()

        # 2. Seed Users
        # Admin
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@mentorsync.edu',
                'first_name': 'System',
                'last_name': 'Administrator',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('password123')
        admin_user.save()
        p, _ = UserProfile.objects.get_or_create(user=admin_user)
        p.role = Role.ADMIN
        p.department = 'Administration'
        p.save()

        # Mentor 1
        mentor1, _ = User.objects.get_or_create(
            username='mentor_rahul',
            defaults={
                'email': 'rahul.sharma@mentorsync.edu',
                'first_name': 'Rahul',
                'last_name': 'Sharma',
            }
        )
        mentor1.set_password('password123')
        mentor1.save()
        p, _ = UserProfile.objects.get_or_create(user=mentor1)
        p.role = Role.MENTOR
        p.department = 'Computer Science'
        p.designation = 'Assistant Professor'
        p.phone = '+91 98765 43210'
        p.save()

        # Mentor 2
        mentor2, _ = User.objects.get_or_create(
            username='mentor_priya',
            defaults={
                'email': 'priya.verma@mentorsync.edu',
                'first_name': 'Priya',
                'last_name': 'Verma',
            }
        )
        mentor2.set_password('password123')
        mentor2.save()
        p, _ = UserProfile.objects.get_or_create(user=mentor2)
        p.role = Role.MENTOR
        p.department = 'Information Technology'
        p.designation = 'Associate Professor'
        p.phone = '+91 98765 12345'
        p.save()

        # Student 1
        student1, _ = User.objects.get_or_create(
            username='student_aarav',
            defaults={
                'email': 'aarav.patel@mentorsync.edu',
                'first_name': 'Aarav',
                'last_name': 'Patel',
            }
        )
        student1.set_password('password123')
        student1.save()
        p, _ = UserProfile.objects.get_or_create(user=student1)
        p.role = Role.STUDENT
        p.department = 'Computer Science'
        p.roll_number = 'CS2026-042'
        p.phone = '+91 91234 56789'
        p.save()

        # Student 2
        student2, _ = User.objects.get_or_create(
            username='student_sneha',
            defaults={
                'email': 'sneha.rao@mentorsync.edu',
                'first_name': 'Sneha',
                'last_name': 'Rao',
            }
        )
        student2.set_password('password123')
        student2.save()
        p, _ = UserProfile.objects.get_or_create(user=student2)
        p.role = Role.STUDENT
        p.department = 'Computer Science'
        p.roll_number = 'CS2026-043'
        p.phone = '+91 91234 98765'
        p.save()

        # Student 3
        student3, _ = User.objects.get_or_create(
            username='student_rohan',
            defaults={
                'email': 'rohan.gupta@mentorsync.edu',
                'first_name': 'Rohan',
                'last_name': 'Gupta',
            }
        )
        student3.set_password('password123')
        student3.save()
        p, _ = UserProfile.objects.get_or_create(user=student3)
        p.role = Role.STUDENT
        p.department = 'Information Technology'
        p.roll_number = 'IT2026-012'
        p.phone = '+91 91234 11223'
        p.save()

        self.stdout.write(self.style.SUCCESS("Users seeded (admin, mentor_rahul, mentor_priya, student_aarav, student_sneha, student_rohan)."))

        # 3. Seed Divisions
        div_a, _ = Division.objects.get_or_create(name='Division A', defaults={'mentor': mentor1})
        if div_a.mentor != mentor1:
            div_a.mentor = mentor1
            div_a.save()

        div_b, _ = Division.objects.get_or_create(name='Division B', defaults={'mentor': mentor2})
        if div_b.mentor != mentor2:
            div_b.mentor = mentor2
            div_b.save()

        self.stdout.write(self.style.SUCCESS("Divisions seeded (Division A -> mentor_rahul, Division B -> mentor_priya)."))

        # 4. Seed Assignments
        Assignment.objects.get_or_create(student=student1, defaults={'division': div_a})
        Assignment.objects.get_or_create(student=student2, defaults={'division': div_a})
        Assignment.objects.get_or_create(student=student3, defaults={'division': div_b})

        self.stdout.write(self.style.SUCCESS("Student assignments seeded."))

        # 5. Seed Issues (OPEN, IN_PROGRESS, RESOLVED)
        Issue.objects.get_or_create(
            student=student1,
            title='Library access card not activated',
            defaults={
                'category': IssueCategory.FACILITIES,
                'priority': IssuePriority.MEDIUM,
                'status': IssueStatus.OPEN,
                'description': 'My RFID smart card is not recognized at the main digital library turnstiles.',
            }
        )

        Issue.objects.get_or_create(
            student=student1,
            title='Lab workstation Python environment setup',
            defaults={
                'category': IssueCategory.ACADEMIC,
                'priority': IssuePriority.HIGH,
                'status': IssueStatus.IN_PROGRESS,
                'description': 'Need administrative privileges to configure virtual environments for Machine Learning lab assignment.',
                'mentor_response': 'Discussed with lab administrator. Permissions will be updated by tomorrow afternoon.',
                'mentor_action': 'Coordinated with IT helpdesk ticket #4091.',
            }
        )

        Issue.objects.get_or_create(
            student=student1,
            title='Elective course registration confirmation',
            defaults={
                'category': IssueCategory.ADMINISTRATIVE,
                'priority': IssuePriority.LOW,
                'status': IssueStatus.RESOLVED,
                'description': 'Awaiting confirmation of enrollment in Advanced Database Systems elective.',
                'mentor_response': 'Verified enrollment with the academic registrar. Seat confirmed.',
                'mentor_action': 'Approved course change form and submitted to Dean\'s office.',
            }
        )

        Issue.objects.get_or_create(
            student=student2,
            title='Project lab cooling and ventilation issue',
            defaults={
                'category': IssueCategory.FACILITIES,
                'priority': IssuePriority.LOW,
                'status': IssueStatus.OPEN,
                'description': 'Room 304 AC unit has been malfunctioning during evening project hours.',
            }
        )

        self.stdout.write(self.style.SUCCESS("Issues seeded across all lifecycle statuses."))

        # 6. Seed Mentoring Sessions
        MentoringSession.objects.get_or_create(
            student=student1,
            mentor=mentor1,
            date=date(2026, 9, 21),
            defaults={
                'discussion': 'Review of academic performance, midterm assessments, and project milestone selection.',
                'observation': 'Student demonstrates strong conceptual grasp in systems programming; suggested focusing on database indexing.',
                'action_follow_up': 'Prepare preliminary system architecture diagram and bring draft for next week\'s review.',
            }
        )

        MentoringSession.objects.get_or_create(
            student=student2,
            mentor=mentor1,
            date=date(2026, 9, 24),
            defaults={
                'discussion': 'Internship preparation, resume critique, and campus placement schedule.',
                'observation': 'Good coding foundation. Recommended participating in upcoming competitive programming hackathon.',
                'action_follow_up': 'Submit updated technical resume before Friday.',
            }
        )

        self.stdout.write(self.style.SUCCESS("Mentoring sessions seeded."))

        # 7. Seed Feedbacks
        Feedback.objects.get_or_create(
            student=student1,
            category=FeedbackCategory.ACADEMIC,
            defaults={
                'rating': 5,
                'comments': 'The interactive lab sessions and practical demonstrations have been really helpful.',
            }
        )

        Feedback.objects.get_or_create(
            student=student2,
            category=FeedbackCategory.MENTORING,
            defaults={
                'rating': 5,
                'comments': 'Prof. Rahul provided clear guidance on project scoping and academic priorities.',
            }
        )

        Feedback.objects.get_or_create(
            student=student3,
            category=FeedbackCategory.FACILITIES,
            defaults={
                'rating': 4,
                'comments': 'Campus Wi-Fi connectivity in block C is good, but would appreciate longer weekend library hours.',
            }
        )

        self.stdout.write(self.style.SUCCESS("Student feedback entries seeded."))

        # 8. Seed Satisfaction Surveys
        SatisfactionSurvey.objects.get_or_create(
            student=student1,
            defaults={
                'mentor_satisfaction_rating': 5,
                'mentor_helpfulness_rating': 5,
                'comments': 'Very accessible mentor who always follows up on pending issues.',
            }
        )

        SatisfactionSurvey.objects.get_or_create(
            student=student2,
            defaults={
                'mentor_satisfaction_rating': 4,
                'mentor_helpfulness_rating': 5,
                'comments': 'Great guidance throughout the semester.',
            }
        )

        self.stdout.write(self.style.SUCCESS("Mentor satisfaction surveys seeded."))
        self.stdout.write(self.style.SUCCESS("========================================"))
        self.stdout.write(self.style.SUCCESS("Baseline demo data ready!"))
        self.stdout.write(self.style.SUCCESS("Credentials: [admin, mentor_rahul, mentor_priya, student_aarav, student_sneha, student_rohan] / password123"))
        self.stdout.write(self.style.SUCCESS("========================================"))
