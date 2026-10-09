from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connections
from django.db.utils import OperationalError

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
