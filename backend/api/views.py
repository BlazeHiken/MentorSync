from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connections
from django.db.utils import OperationalError

@api_view(['GET'])
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
