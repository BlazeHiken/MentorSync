from rest_framework import serializers
from .models import Division, Assignment, Feedback, SatisfactionSurvey
from django.contrib.auth.models import User
from accounts.serializers import UserSerializer

class DivisionSerializer(serializers.ModelSerializer):
    mentor_details = UserSerializer(source='mentor', read_only=True)
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Division
        fields = ['id', 'name', 'mentor', 'mentor_details', 'student_count', 'created_at']

    def get_student_count(self, obj):
        return obj.students.count()

class AssignmentSerializer(serializers.ModelSerializer):
    student_details = UserSerializer(source='student', read_only=True)
    division_details = DivisionSerializer(source='division', read_only=True)

    class Meta:
        model = Assignment
        fields = ['id', 'student', 'division', 'student_details', 'division_details', 'created_at']

class BulkAssignmentSerializer(serializers.Serializer):
    division_id = serializers.IntegerField()
    student_ids = serializers.ListField(
        child=serializers.IntegerField()
    )

class FeedbackSerializer(serializers.ModelSerializer):
    student_details = UserSerializer(source='student', read_only=True)
    
    class Meta:
        model = Feedback
        fields = ['id', 'student', 'student_details', 'category', 'rating', 'comments', 'created_at']
        read_only_fields = ['student']
        
class SatisfactionSurveySerializer(serializers.ModelSerializer):
    student_details = UserSerializer(source='student', read_only=True)
    
    class Meta:
        model = SatisfactionSurvey
        fields = ['id', 'student', 'student_details', 'mentor_satisfaction_rating', 'mentor_helpfulness_rating', 'comments', 'created_at']
        read_only_fields = ['student']
