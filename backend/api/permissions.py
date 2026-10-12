from rest_framework.permissions import BasePermission
from accounts.models import Role
from .models import Assignment

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'profile') and request.user.profile.role == Role.ADMIN or request.user.is_superuser

class IsMentorUser(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'profile') and request.user.profile.role == Role.MENTOR

class IsStudentUser(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'profile') and request.user.profile.role == Role.STUDENT

class IsAdminOrAssignedMentor(BasePermission):
    """Allow admins or the assigned division mentor to manage an issue."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        user = request.user
        return (
            user.is_superuser
            or (
                hasattr(user, 'profile')
                and user.profile.role in [Role.ADMIN, Role.MENTOR]
            )
        )

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser:
            return True

        if not hasattr(user, 'profile'):
            return False

        if user.profile.role == Role.ADMIN:
            return True

        if user.profile.role == Role.MENTOR:
            try:
                return obj.student.division_assignment.division.mentor_id == user.id
            except Assignment.DoesNotExist:
                return False

        return False


class CanManageMentoringSession(BasePermission):
    """Allow admins or the mentor who recorded the session to manage it."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        user = request.user
        return (
            user.is_superuser
            or (
                hasattr(user, 'profile')
                and user.profile.role in [Role.ADMIN, Role.MENTOR]
            )
        )

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser:
            return True

        if not hasattr(user, 'profile'):
            return False

        if user.profile.role == Role.ADMIN:
            return True

        return (
            user.profile.role == Role.MENTOR
            and obj.mentor_id == user.id
        )

class StudentSubmissionPermission(BasePermission):
    """
    Allow authenticated users to read permitted submissions.
    Only students may create submissions.
    No user may update or delete submissions through this permission.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        if request.method == 'POST':
            profile = getattr(request.user, 'profile', None)
            return bool(
                profile and profile.role == Role.STUDENT
            )

        return False