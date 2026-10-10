from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.db import connections
from django.db.utils import OperationalError
from .models import Division, Assignment, Feedback, SatisfactionSurvey
from .serializers import DivisionSerializer, AssignmentSerializer, BulkAssignmentSerializer, FeedbackSerializer, SatisfactionSurveySerializer
from .permissions import IsAdminUser
from django.contrib.auth.models import User
from accounts.models import Role

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
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.IsAuthenticated]

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
