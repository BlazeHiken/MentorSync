from django.http import response
from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import Role
from .models import (
    Assignment,
    Division,
    Feedback,
    SatisfactionSurvey,
    Issue,
    MentoringSession,
)


class DivisionAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            username="admin",
            password="password",
        )
        self.admin.profile.role = Role.ADMIN
        self.admin.profile.save()

        self.mentor = User.objects.create_user(
            username="mentor",
            password="password",
        )
        self.mentor.profile.role = Role.MENTOR
        self.mentor.profile.save()

        self.student = User.objects.create_user(
            username="student",
            password="password",
        )
        self.student.profile.role = Role.STUDENT
        self.student.profile.save()

    def test_admin_can_create_division(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            "/api/divisions/",
            {"name": "Division A"},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_mentor_cannot_create_division(self):
        self.client.force_authenticate(user=self.mentor)

        response = self.client.post(
            "/api/divisions/",
            {"name": "Division B"},
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_assign_mentor(self):
        self.client.force_authenticate(user=self.admin)
        division = Division.objects.create(name="Div A")

        response = self.client.patch(
            f"/api/divisions/{division.id}/",
            {"mentor": self.mentor.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        division.refresh_from_db()
        self.assertEqual(division.mentor, self.mentor)

    def test_admin_can_bulk_assign_students(self):
        self.client.force_authenticate(user=self.admin)
        division = Division.objects.create(name="Div A")

        response = self.client.post(
            "/api/assignments/bulk_assign/",
            {
                "division_id": division.id,
                "student_ids": [self.student.id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            Assignment.objects.filter(
                student=self.student,
                division=division,
            ).exists()
        )


class FeedbackAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = self.create_user("admin", Role.ADMIN)
        self.mentor = self.create_user("mentor", Role.MENTOR)
        self.student = self.create_user("student", Role.STUDENT)
        self.student2 = self.create_user("student2", Role.STUDENT)

    @staticmethod
    def create_user(username, role):
        user = User.objects.create_user(
            username=username,
            password="password",
        )
        user.profile.role = role
        user.profile.save()
        return user

    def feedback_payload(self):
        return {
            "category": "ACADEMIC",
            "rating": 4,
            "comments": "Great",
        }

    def test_student_can_submit_feedback(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            "/api/feedback/",
            self.feedback_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Feedback.objects.count(), 1)
        self.assertEqual(Feedback.objects.first().student, self.student)

    def test_invalid_rating(self):
        self.client.force_authenticate(user=self.student)
        payload = self.feedback_payload()
        payload["rating"] = 6

        response = self.client.post(
            "/api/feedback/",
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_unauthenticated_cannot_submit(self):
        response = self.client.post(
            "/api/feedback/",
            self.feedback_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_student_cannot_update_own_feedback(self):
        feedback = Feedback.objects.create(
            student=self.student,
            category="ACADEMIC",
            rating=4,
            comments="Original feedback",
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.patch(
            f"/api/feedback/{feedback.id}/",
            {"comments": "Changed feedback"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        feedback.refresh_from_db()
        self.assertEqual(feedback.comments, "Original feedback")

    def test_student_cannot_delete_own_feedback(self):
        feedback = Feedback.objects.create(
            student=self.student,
            category="ACADEMIC",
            rating=4,
            comments="Original feedback",
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.delete(
            f"/api/feedback/{feedback.id}/",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertTrue(Feedback.objects.filter(pk=feedback.pk).exists())

    def test_mentor_cannot_submit_feedback(self):
        self.client.force_authenticate(user=self.mentor)

        response = self.client.post(
            "/api/feedback/",
            self.feedback_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(Feedback.objects.count(), 0)

    def test_admin_cannot_submit_feedback(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            "/api/feedback/",
            self.feedback_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(Feedback.objects.count(), 0)

    def test_student_sees_only_own_feedback(self):
        Feedback.objects.create(
            student=self.student,
            category="ACADEMIC",
            rating=4,
            comments="My feedback",
        )
        Feedback.objects.create(
            student=self.student2,
            category="GENERAL",
            rating=3,
            comments="Other feedback",
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.get("/api/feedback/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["student"], self.student.id)


class SatisfactionSurveyAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = self.create_user("survey_student", Role.STUDENT)
        self.other_student = self.create_user("other_student", Role.STUDENT)
        self.mentor = self.create_user("survey_mentor", Role.MENTOR)
        self.admin = self.create_user("survey_admin", Role.ADMIN)

    @staticmethod
    def create_user(username, role):
        user = User.objects.create_user(
            username=username,
            password="password",
        )
        user.profile.role = role
        user.profile.save()
        return user

    def survey_payload(self):
        return {
            "mentor_satisfaction_rating": 5,
            "mentor_helpfulness_rating": 4,
            "comments": "Helpful mentoring",
        }

    def test_student_can_submit_survey(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            "/api/surveys/",
            self.survey_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SatisfactionSurvey.objects.count(), 1)
        self.assertEqual(
            SatisfactionSurvey.objects.first().student,
            self.student,
        )

    def test_student_cannot_update_own_survey(self):
        survey = SatisfactionSurvey.objects.create(
            student=self.student,
            mentor_satisfaction_rating=5,
            mentor_helpfulness_rating=4,
            comments="Original",
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.patch(
            f"/api/surveys/{survey.id}/",
            {"comments": "Changed"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        survey.refresh_from_db()
        self.assertEqual(survey.comments, "Original")

    def test_student_cannot_delete_own_survey(self):
        survey = SatisfactionSurvey.objects.create(
            student=self.student,
            mentor_satisfaction_rating=5,
            mentor_helpfulness_rating=4,
            comments="Original",
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.delete(f"/api/surveys/{survey.id}/")

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertTrue(
            SatisfactionSurvey.objects.filter(pk=survey.pk).exists()
        )

    def test_mentor_cannot_submit_survey(self):
        self.client.force_authenticate(user=self.mentor)

        response = self.client.post(
            "/api/surveys/",
            self.survey_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(SatisfactionSurvey.objects.count(), 0)

    def test_admin_cannot_submit_survey(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            "/api/surveys/",
            self.survey_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(SatisfactionSurvey.objects.count(), 0)

        def test_student_sees_only_own_surveys(self):
            SatisfactionSurvey.objects.create(
                student=self.student,
                mentor_satisfaction_rating=5,
                mentor_helpfulness_rating=4,
                comments="Mine",
            )
            SatisfactionSurvey.objects.create(
                student=self.other_student,
                mentor_satisfaction_rating=2,
                mentor_helpfulness_rating=2,
                comments="Other",
            )
            self.client.force_authenticate(user=self.student)

            response = self.client.get("/api/surveys/")

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]["student"], self.student.id)


class IssueAndMentoringSessionAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin = self.create_user("issue_admin", Role.ADMIN)
        self.mentor = self.create_user("issue_mentor", Role.MENTOR)
        self.other_mentor = self.create_user("other_mentor", Role.MENTOR)
        self.student = self.create_user("issue_student", Role.STUDENT)
        self.other_student = self.create_user("other_student", Role.STUDENT)

        self.division = Division.objects.create(
            name="Division A",
            mentor=self.mentor,
        )
        Assignment.objects.create(
            student=self.student,
            division=self.division,
        )

        self.other_division = Division.objects.create(
            name="Division B",
            mentor=self.other_mentor,
        )
        Assignment.objects.create(
            student=self.other_student,
            division=self.other_division,
        )

    @staticmethod
    def create_user(username, role):
        user = User.objects.create_user(
            username=username,
            password="password",
        )
        user.profile.role = role
        user.profile.save()
        return user

    def issue_payload(self):
        return {
            "title": "Need academic support",
            "category": "ACADEMIC",
            "description": "I need help with a subject.",
            "priority": "MEDIUM",
        }

    def test_student_can_create_issue(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            "/api/issues/",
            self.issue_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Issue.objects.count(), 1)
        self.assertEqual(Issue.objects.first().student, self.student)

    def test_student_cannot_update_submitted_issue(self):
        issue = Issue.objects.create(
            student=self.student,
            title="Original",
            category="ACADEMIC",
            description="Original description",
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.patch(
            f"/api/issues/{issue.id}/",
            {"title": "Changed"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        issue.refresh_from_db()
        self.assertEqual(issue.title, "Original")

    def test_assigned_mentor_can_update_issue_status(self):
        issue = Issue.objects.create(
            student=self.student,
            title="Need help",
            category="ACADEMIC",
            description="Help requested",
        )
        self.client.force_authenticate(user=self.mentor)

        response = self.client.patch(
            f"/api/issues/{issue.id}/",
            {
                "status": "IN_PROGRESS",
                "mentor_response": "I will follow up.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        issue.refresh_from_db()
        self.assertEqual(issue.status, "IN_PROGRESS")
        self.assertEqual(issue.mentor_response, "I will follow up.")

    def test_mentor_cannot_change_original_issue_details(self):
        issue = Issue.objects.create(
            student=self.student,
            title="Original",
            category="ACADEMIC",
            description="Original description",
        )
        self.client.force_authenticate(user=self.mentor)

        response = self.client.patch(
            f"/api/issues/{issue.id}/",
            {"title": "Changed"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        issue.refresh_from_db()
        self.assertEqual(issue.title, "Original")

    def test_other_mentor_cannot_update_issue(self):
        issue = Issue.objects.create(
            student=self.student,
            title="Need help",
            category="ACADEMIC",
            description="Help requested",
        )
        self.client.force_authenticate(user=self.other_mentor)

        response = self.client.patch(
            f"/api/issues/{issue.id}/",
            {"status": "IN_PROGRESS"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )
        issue.refresh_from_db()
        self.assertEqual(issue.status, "OPEN")

    def test_student_sees_only_own_issues(self):
        Issue.objects.create(
            student=self.student,
            title="My issue",
            category="ACADEMIC",
            description="My description",
        )
        Issue.objects.create(
            student=self.other_student,
            title="Other issue",
            category="OTHER",
            description="Other description",
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.get("/api/issues/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["student"], self.student.id)

    def test_mentor_cannot_create_session_for_other_mentors_student(self):
        self.client.force_authenticate(user=self.mentor)

        response = self.client.post(
            "/api/sessions/",
            {
                "student": self.other_student.id,
                "date": date.today().isoformat(),
                "discussion": "Discussion",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertEqual(MentoringSession.objects.count(), 0)

    def test_mentor_can_create_session_for_assigned_student(self):
        self.client.force_authenticate(user=self.mentor)

        response = self.client.post(
            "/api/sessions/",
            {
                "student": self.student.id,
                "date": date.today().isoformat(),
                "discussion": "Discussed academic progress",
                "observation": "Making progress",
                "action_follow_up": "Review next week",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MentoringSession.objects.count(), 1)
        self.assertEqual(MentoringSession.objects.first().mentor, self.mentor)

    def test_student_sees_only_own_sessions(self):
        MentoringSession.objects.create(
            student=self.student,
            mentor=self.mentor,
            date=date.today(),
            discussion="My session",
        )
        MentoringSession.objects.create(
            student=self.other_student,
            mentor=self.other_mentor,
            date=date.today() - timedelta(days=1),
            discussion="Other session",
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.get("/api/sessions/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["student"], self.student.id)