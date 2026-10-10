from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import health_check, DivisionViewSet, AssignmentViewSet, FeedbackViewSet, SatisfactionSurveyViewSet, IssueViewSet, MentoringSessionViewSet

router = DefaultRouter()
router.register(r'divisions', DivisionViewSet, basename='division')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'feedback', FeedbackViewSet, basename='feedback')
router.register(r'surveys', SatisfactionSurveyViewSet, basename='survey')
router.register(r'issues', IssueViewSet, basename='issue')
router.register(r'sessions', MentoringSessionViewSet, basename='session')

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('', include(router.urls)),
]
