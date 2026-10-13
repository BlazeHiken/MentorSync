from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.db import connections
from django.db.models import Avg, Q
from django.db.utils import OperationalError
from .models import Division, Assignment, Feedback, SatisfactionSurvey, Issue, MentoringSession, IssueStatus
from .serializers import DivisionSerializer, AssignmentSerializer, BulkAssignmentSerializer, FeedbackSerializer, SatisfactionSurveySerializer, IssueSerializer, MentoringSessionSerializer
from django.contrib.auth.models import User
from accounts.models import Role
from .permissions import (
    IsAdminUser,
    IsStudentUser,
    IsMentorUser,
    IsAdminOrAssignedMentor,
    CanManageMentoringSession,
    StudentSubmissionPermission,
)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    db_healthy = True
    try:
        connections['default'].cursor()
    except OperationalError:
        db_healthy = False
    return Response({
        "status": "healthy",
        "message": "MentorSync backend is running",
        "database_connected": db_healthy
    })

class DivisionViewSet(viewsets.ModelViewSet):
    serializer_class = DivisionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'profile'):
            return Division.objects.none()
        if user.profile.role == Role.ADMIN or user.is_superuser:
            return Division.objects.all()
        elif user.profile.role == Role.MENTOR:
            return Division.objects.filter(mentor=user)
        elif user.profile.role == Role.STUDENT:
            if hasattr(user, 'division_assignment'):
                return Division.objects.filter(id=user.division_assignment.division.id)
            return Division.objects.none()
        return Division.objects.none()

class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'profile'):
            return Assignment.objects.none()
        if user.profile.role == Role.ADMIN or user.is_superuser:
            return Assignment.objects.all()
        elif user.profile.role == Role.MENTOR:
            return Assignment.objects.filter(division__mentor=user)
        elif user.profile.role == Role.STUDENT:
            return Assignment.objects.filter(student=user)
        return Assignment.objects.none()

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def bulk_assign(self, request):
        serializer = BulkAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            division_id = serializer.validated_data['division_id']
            student_ids = serializer.validated_data['student_ids']

            try:
                division = Division.objects.get(id=division_id)
            except Division.DoesNotExist:
                return Response({'error': 'Division not found'}, status=status.HTTP_404_NOT_FOUND)

            assignments = []
            for student_id in student_ids:
                try:
                    student = User.objects.get(id=student_id, profile__role=Role.STUDENT)
                    assignment, created = Assignment.objects.update_or_create(
                        student=student,
                        defaults={'division': division}
                    )
                    assignments.append(assignment)
                except User.DoesNotExist:
                    continue

            return Response({'status': 'assigned', 'count': len(assignments)})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer
    permission_classes = [StudentSubmissionPermission]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'profile'):
            return Feedback.objects.none()
        if user.profile.role == Role.ADMIN or user.is_superuser:
            return Feedback.objects.all()
        elif user.profile.role == Role.MENTOR:
            return Feedback.objects.filter(student__division_assignment__division__mentor=user)
        elif user.profile.role == Role.STUDENT:
            return Feedback.objects.filter(student=user)
        return Feedback.objects.none()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class SatisfactionSurveyViewSet(viewsets.ModelViewSet):
    serializer_class = SatisfactionSurveySerializer
    permission_classes = [StudentSubmissionPermission]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'profile'):
            return SatisfactionSurvey.objects.none()
        if user.profile.role == Role.ADMIN or user.is_superuser:
            return SatisfactionSurvey.objects.all()
        elif user.profile.role == Role.MENTOR:
            return SatisfactionSurvey.objects.filter(student__division_assignment__division__mentor=user)
        elif user.profile.role == Role.STUDENT:
            return SatisfactionSurvey.objects.filter(student=user)
        return SatisfactionSurvey.objects.none()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class IssueViewSet(viewsets.ModelViewSet):
    serializer_class = IssueSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        if self.action == 'create':
            return [IsStudentUser()]
        if self.action in ['update', 'partial_update']:
            return [IsAdminOrAssignedMentor()]
        if self.action == 'destroy':
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if not hasattr(user, 'profile'):
            return Issue.objects.none()

        if user.profile.role == Role.ADMIN or user.is_superuser:
            return Issue.objects.all()

        if user.profile.role == Role.MENTOR:
            return Issue.objects.filter(
                student__division_assignment__division__mentor=user
            )

        if user.profile.role == Role.STUDENT:
            return Issue.objects.filter(student=user)

        return Issue.objects.none()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class MentoringSessionViewSet(viewsets.ModelViewSet):
    serializer_class = MentoringSessionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        if self.action == 'create':
            return [IsMentorUser()]
        if self.action in ['update', 'partial_update']:
            return [CanManageMentoringSession()]
        if self.action == 'destroy':
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if not hasattr(user, 'profile'):
            return MentoringSession.objects.none()

        if user.profile.role == Role.ADMIN or user.is_superuser:
            return MentoringSession.objects.all()

        if user.profile.role == Role.MENTOR:
            return MentoringSession.objects.filter(mentor=user)

        if user.profile.role == Role.STUDENT:
            return MentoringSession.objects.filter(student=user)

        return MentoringSession.objects.none()

    def perform_create(self, serializer):
        serializer.save(mentor=self.request.user)


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = getattr(user.profile, 'role', None) if hasattr(user, 'profile') else None
        is_admin = user.is_superuser or role == Role.ADMIN

        if is_admin:
            total_students = User.objects.filter(profile__role=Role.STUDENT).count()
            total_mentors = User.objects.filter(profile__role=Role.MENTOR).count()
            total_divisions = Division.objects.count()
            open_issues = Issue.objects.filter(status=IssueStatus.OPEN).count()
            in_progress_issues = Issue.objects.filter(status=IssueStatus.IN_PROGRESS).count()
            resolved_issues = Issue.objects.filter(status=IssueStatus.RESOLVED).count()
            total_feedback = Feedback.objects.count()
            avg_satisfaction = SatisfactionSurvey.objects.aggregate(
                avg=Avg('mentor_satisfaction_rating')
            )['avg']
            avg_helpfulness = SatisfactionSurvey.objects.aggregate(
                avg=Avg('mentor_helpfulness_rating')
            )['avg']

            return Response({
                'role': Role.ADMIN,
                'total_students': total_students,
                'total_mentors': total_mentors,
                'total_divisions': total_divisions,
                'open_issues': open_issues,
                'in_progress_issues': in_progress_issues,
                'resolved_issues': resolved_issues,
                'total_feedback': total_feedback,
                'average_satisfaction': round(float(avg_satisfaction), 1) if avg_satisfaction is not None else None,
                'average_helpfulness': round(float(avg_helpfulness), 1) if avg_helpfulness is not None else None,
            })

        if role == Role.MENTOR:
            mentored_divisions = Division.objects.filter(mentor=user)
            mentored_division_ids = mentored_divisions.values_list('id', flat=True)

            assigned_mentees_count = Assignment.objects.filter(
                division_id__in=mentored_division_ids
            ).count()

            mentor_issues = Issue.objects.filter(
                student__division_assignment__division_id__in=mentored_division_ids
            )
            open_issues_count = mentor_issues.filter(status=IssueStatus.OPEN).count()
            in_progress_issues_count = mentor_issues.filter(status=IssueStatus.IN_PROGRESS).count()
            resolved_issues_count = mentor_issues.filter(status=IssueStatus.RESOLVED).count()

            pending_followups_count = mentor_issues.filter(
                status__in=[IssueStatus.OPEN, IssueStatus.IN_PROGRESS]
            ).filter(
                Q(mentor_action__isnull=True) | Q(mentor_action__exact='') |
                Q(mentor_response__isnull=True) | Q(mentor_response__exact='')
            ).count()

            mentor_sessions = MentoringSession.objects.filter(mentor=user)
            logged_sessions_count = mentor_sessions.count()

            recent_sessions = MentoringSessionSerializer(
                mentor_sessions.select_related('student', 'student__profile').order_by('-date', '-created_at')[:5],
                many=True,
                context={'request': request}
            ).data

            feedback_count = Feedback.objects.filter(
                student__division_assignment__division_id__in=mentored_division_ids
            ).count()

            return Response({
                'role': Role.MENTOR,
                'assigned_mentees_count': assigned_mentees_count,
                'open_issues_count': open_issues_count,
                'in_progress_issues_count': in_progress_issues_count,
                'resolved_issues_count': resolved_issues_count,
                'pending_followups_count': pending_followups_count,
                'logged_sessions_count': logged_sessions_count,
                'feedback_count': feedback_count,
                'recent_sessions': recent_sessions,
            })

        if role == Role.STUDENT:
            assignment = (
                Assignment.objects.filter(student=user)
                .select_related('division', 'division__mentor', 'division__mentor__profile')
                .first()
            )

            assigned_mentor = None
            if assignment and assignment.division and assignment.division.mentor:
                m = assignment.division.mentor
                m_profile = getattr(m, 'profile', None)
                assigned_mentor = {
                    'id': m.id,
                    'username': m.username,
                    'first_name': m.first_name,
                    'last_name': m.last_name,
                    'name': (m.get_full_name() or m.username),
                    'email': m.email,
                    'department': m_profile.department if m_profile else None,
                    'designation': m_profile.designation if m_profile else None,
                    'phone': m_profile.phone if m_profile else None,
                    'division_id': assignment.division.id,
                    'division_name': assignment.division.name,
                }

            student_issues = Issue.objects.filter(student=user)
            issue_count = student_issues.count()
            open_issues_count = student_issues.filter(status=IssueStatus.OPEN).count()
            in_progress_issues_count = student_issues.filter(status=IssueStatus.IN_PROGRESS).count()
            resolved_issues_count = student_issues.filter(status=IssueStatus.RESOLVED).count()

            feedback_count = Feedback.objects.filter(student=user).count()

            latest_survey = (
                SatisfactionSurvey.objects.filter(student=user)
                .order_by('-created_at')
                .first()
            )
            survey_completed = latest_survey is not None
            survey_rating = latest_survey.mentor_satisfaction_rating if latest_survey else None

            latest_session = (
                MentoringSession.objects.filter(student=user)
                .select_related('mentor', 'mentor__profile')
                .order_by('-date', '-created_at')
                .first()
            )
            recent_session = (
                MentoringSessionSerializer(latest_session, context={'request': request}).data
                if latest_session
                else None
            )

            return Response({
                'role': Role.STUDENT,
                'assigned_mentor': assigned_mentor,
                'division_name': assignment.division.name if assignment and assignment.division else None,
                'issue_count': issue_count,
                'open_issues_count': open_issues_count,
                'in_progress_issues_count': in_progress_issues_count,
                'resolved_issues_count': resolved_issues_count,
                'feedback_count': feedback_count,
                'survey_completed': survey_completed,
                'has_survey': survey_completed,
                'survey_rating': survey_rating,
                'recent_session': recent_session,
            })

        return Response(
            {'detail': 'User has no assigned role.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
