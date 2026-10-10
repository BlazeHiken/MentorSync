from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import UserProfile, Role
from .models import Division, Assignment, Feedback, SatisfactionSurvey

class DivisionAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create Admin
        self.admin = User.objects.create_user(username='admin', password='password')
        self.admin.profile.role = Role.ADMIN
        self.admin.profile.save()
        
        # Create Mentor
        self.mentor = User.objects.create_user(username='mentor', password='password')
        self.mentor.profile.role = Role.MENTOR
        self.mentor.profile.save()

        # Create Student
        self.student = User.objects.create_user(username='student', password='password')
        self.student.profile.role = Role.STUDENT
        self.student.profile.save()

    def test_admin_can_create_division(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/divisions/', {'name': 'Division A'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_mentor_cannot_create_division(self):
        self.client.force_authenticate(user=self.mentor)
        response = self.client.post('/api/divisions/', {'name': 'Division B'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_assign_mentor(self):
        self.client.force_authenticate(user=self.admin)
        div = Division.objects.create(name='Div A')
        response = self.client.patch(f'/api/divisions/{div.id}/', {'mentor': self.mentor.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        div.refresh_from_db()
        self.assertEqual(div.mentor, self.mentor)

    def test_admin_can_bulk_assign_students(self):
        self.client.force_authenticate(user=self.admin)
        div = Division.objects.create(name='Div A')
        response = self.client.post('/api/assignments/bulk_assign/', {
            'division_id': div.id,
            'student_ids': [self.student.id]
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Assignment.objects.filter(student=self.student, division=div).exists())

class FeedbackAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(username='student', password='password')
        self.student.profile.role = Role.STUDENT
        self.student.profile.save()

        self.student2 = User.objects.create_user(username='student2', password='password')
        self.student2.profile.role = Role.STUDENT
        self.student2.profile.save()

    def test_student_can_submit_feedback(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/feedback/', {
            'category': 'ACADEMIC',
            'rating': 4,
            'comments': 'Great'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Feedback.objects.count(), 1)
        self.assertEqual(Feedback.objects.first().student, self.student)

    def test_invalid_rating(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/feedback/', {
            'category': 'ACADEMIC',
            'rating': 6,  # max is 5
            'comments': 'Great'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_cannot_submit(self):
        response = self.client.post('/api/feedback/', {
            'category': 'ACADEMIC',
            'rating': 4,
            'comments': 'Great'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class SatisfactionSurveyAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(username='student', password='password')
        self.student.profile.role = Role.STUDENT
        self.student.profile.save()

    def test_student_can_submit_survey(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/surveys/', {
            'mentor_satisfaction_rating': 5,
            'mentor_helpfulness_rating': 4,
            'comments': 'Helpful mentor'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SatisfactionSurvey.objects.count(), 1)
        self.assertEqual(SatisfactionSurvey.objects.first().student, self.student)
