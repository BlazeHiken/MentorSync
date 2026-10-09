from rest_framework.permissions import BasePermission
from .models import Role

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        return hasattr(request.user, 'profile') and request.user.profile.role == Role.ADMIN

class IsMentorRole(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser:
            return True
        return hasattr(request.user, 'profile') and request.user.profile.role == Role.MENTOR

class IsStudentRole(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return hasattr(request.user, 'profile') and request.user.profile.role == Role.STUDENT
