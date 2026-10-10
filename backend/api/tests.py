
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import Role
from .models import (
    Division,
    Assignment,
    Feedback,
    SatisfactionSurvey,
    Issue,
    MentoringSession,
)


class DivisionAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            username='admin',
            password='password',
        )
        self.admin.profile.role = Role.ADMIN
        self.admin.profile.save()

        self.mentor = User.objects.create_user(
            username='mentor',
            password='password',
        )
        self.mentor.profile.role = Role.MENTOR
        self.mentor.profile.save()

        self.student = User.objects.create_user(
            username='student',
            password='password',
        )
        self.student.profile.role = Role.STUDENT
        self.student.profile.save()

    def test_admin_can_create_division(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            '/api/divisions/',
            {'name': 'Division A'},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

    def test_mentor_cannot_create_division(self):
        self.client.force_authenticate(user=self.mentor)

        response = self.client.post(
            '/api/divisions/',
            {'name': 'Division B'},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_admin_can_assign_mentor(self):
        self.client.force_authenticate(user=self.admin)
        division = Division.objects.create(name='Div A')

        response = self.client.patch(
            f'/api/divisions/{division.id}/',
            {'mentor': self.mentor.id},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        division.refresh_from_db()
        self.assertEqual(division.mentor, self.mentor)

    def test_admin_can_bulk_assign_students(self):
        self.client.force_authenticate(user=self.admin)
        division = Division.objects.create(name='Div A')

        response = self.client.post(
            '/api/assignments/bulk_assign/',
            {
                'division_id': division.id,
                'student_ids': [self.student.id],
            },
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertTrue(
            Assignment.objects.filter(
                student=self.student,
                division=division,
            ).exists()
        )


class FeedbackAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.student = User.objects.create_user(
            username='student',
            password='password',
        )
        self.student.profile.role = Role.STUDENT
        self.student.profile.save()

        self.student2 = User.objects.create_user(
            username='student2',
            password='password',
        )
        self.student2.profile.role = Role.STUDENT
        self.student2.profile.save()

    def test_student_can_submit_feedback(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            '/api/feedback/',
            {
                'category': 'ACADEMIC',
                'rating': 4,
                'comments': 'Great',
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertEqual(Feedback.objects.count(), 1)
        self.assertEqual(
            Feedback.objects.first().student,
            self.student,
        )

    def test_invalid_rating(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            '/api/feedback/',
            {
                'category': 'ACADEMIC',
                'rating': 6,
                'comments': 'Great',
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_unauthenticated_cannot_submit(self):
        response = self.client.post(
            '/api/feedback/',
            {
                'category': 'ACADEMIC',
                'rating': 4,
                'comments': 'Great',
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )


class SatisfactionSurveyAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.student = User.objects.create_user(
            username='student',
            password='password',
        )
        self.student.profile.role = Role.STUDENT
        self.student.profile.save()

    def test_student_can_submit_survey(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            '/api/surveys/',
            {
                'mentor_satisfaction_rating': 5,
                'mentor_helpfulness_rating': 4,
                'comments': 'Helpful mentor',
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertEqual(SatisfactionSurvey.objects.count(), 1)
        self.assertEqual(
            SatisfactionSurvey.objects.first().student,
            self.student,
        )


class IssueAndMentoringSessionAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            username='issue_admin',
            password='password',
        )
        self.admin.profile.role = Role.ADMIN
        self.admin.profile.save()

        self.mentor = User.objects.create_user(
            username='issue_mentor',
            password='password',
        )
        self.mentor.profile.role = Role.MENTOR
        self.mentor.profile.save()

        self.other_mentor = User.objects.create_user(
            username='other_mentor',
            password='password',
        )
        self.other_mentor.profile.role = Role.MENTOR
        self.other_mentor.profile.save()

        self.student = User.objects.create_user(
            username='issue_student',
            password='password',
        )
        self.student.profile.role = Role.STUDENT
        self.student.profile.save()

        self.other_student = User.objects.create_user(
            username='other_student',
            password='password',
        )
        self.other_student.profile.role = Role.STUDENT
        self.other_student.profile.save()

        self.division = Division.objects.create(
            name='Issue Test Division',
            mentor=self.mentor,
        )
        Assignment.objects.create(
            student=self.student,
            division=self.division,
        )

        self.other_division = Division.objects.create(
            name='Other Test Division',
            mentor=self.other_mentor,
        )
        Assignment.objects.create(
            student=self.other_student,
            division=self.other_division,
        )

        self.issue = Issue.objects.create(
            student=self.student,
            title='Assignment problem',
            category='ACADEMIC',
            description='Unable to submit assignment.',
            priority='MEDIUM',
        )

    def test_student_can_create_issue(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            '/api/issues/',
            {
                'title': 'Library problem',
                'category': 'FACILITIES',
                'description': 'The library computer is not working.',
                'priority': 'LOW',
            },
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertTrue(
            Issue.objects.filter(
                student=self.student,
                title='Library problem',
            ).exists()
        )

    def test_student_cannot_update_submitted_issue(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.patch(
            f'/api/issues/{self.issue.id}/',
            {'description': 'Changed description'},
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_assigned_mentor_can_update_issue_status(self):
        self.client.force_authenticate(user=self.mentor)
        self.issue.refresh_from_db()

        response = self.client.patch(
            f'/api/issues/{self.issue.id}/',
            {
                'status': 'IN_PROGRESS',
                'mentor_response': 'I am looking into this.',
            },
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.issue.refresh_from_db()
        self.assertEqual(self.issue.status, 'IN_PROGRESS')
        self.assertEqual(
            self.issue.mentor_response,
            'I am looking into this.',
        )

    def test_mentor_cannot_change_original_issue_details(self):
        self.client.force_authenticate(user=self.mentor)

        response = self.client.patch(
            f'/api/issues/{self.issue.id}/',
            {'title': 'Changed by mentor'},
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.issue.refresh_from_db()
        self.assertEqual(self.issue.title, 'Assignment problem')

    def test_other_mentor_cannot_update_issue(self):
        self.client.force_authenticate(user=self.other_mentor)

        response = self.client.patch(
            f'/api/issues/{self.issue.id}/',
            {'status': 'RESOLVED'},
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_student_sees_only_own_issues(self):
        Issue.objects.create(
            student=self.other_student,
            title='Other student issue',
            category='OTHER',
            description='Private issue.',
            priority='LOW',
        )

        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/issues/')

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = (
            response.data['results']
            if isinstance(response.data, dict)
            else response.data
        )
        returned_ids = [item['id'] for item in results]

        self.assertIn(self.issue.id, returned_ids)
        self.assertEqual(len(returned_ids), 1)

    def test_mentor_cannot_create_session_for_other_mentors_student(self):
        self.client.force_authenticate(user=self.mentor)

        response = self.client.post(
            '/api/sessions/',
            {
                'student': self.other_student.id,
                'date': '2026-10-10',
                'discussion': 'Discussed academic progress.',
                'observation': 'Needs more practice.',
                'action_follow_up': 'Review progress next session.',
            },
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertEqual(MentoringSession.objects.count(), 0)

    def test_mentor_can_create_session_for_assigned_student(self):
        self.client.force_authenticate(user=self.mentor)

        response = self.client.post(
            '/api/sessions/',
            {
                'student': self.student.id,
                'date': '2026-10-10',
                'discussion': 'Discussed academic progress.',
                'observation': 'Needs more practice.',
                'action_follow_up': 'Review progress next session.',
            },
            format='json',
        )

        self.assertEqual(
             response.status_code,
    status.HTTP_201_CREATED,
    response.data,
        )
        self.assertEqual(MentoringSession.objects.count(), 1)
        self.assertEqual(
            MentoringSession.objects.get().mentor,
            self.mentor,
        )

    def test_student_sees_only_own_sessions(self):
        session = MentoringSession.objects.create(
            student=self.student,
            mentor=self.mentor,
            date='2026-10-10',
            discussion='Academic progress.',
            observation='Progress is satisfactory.',
            action_follow_up='Continue current plan.',
        )

        MentoringSession.objects.create(
            student=self.other_student,
            mentor=self.other_mentor,
            date='2026-10-10',
            discussion='Other student session.',
        )

        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/sessions/')

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = (
            response.data['results']
            if isinstance(response.data, dict)
            else response.data
        )
        returned_ids = [item['id'] for item in results]

        self.assertEqual(returned_ids, [session.id])
