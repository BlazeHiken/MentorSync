from django.urls import path
from .views import health_check

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import health_check, DivisionViewSet, AssignmentViewSet

router = DefaultRouter()
router.register(r'divisions', DivisionViewSet, basename='division')
router.register(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('', include(router.urls)),
]
