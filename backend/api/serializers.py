
from rest_framework import serializers
from django.contrib.auth.models import User

from .models import (
    Division,
    Assignment,
    Feedback,
    SatisfactionSurvey,
    Issue,
    MentoringSession,
)
from accounts.serializers import UserSerializer
from accounts.models import Role


class DivisionSerializer(serializers.ModelSerializer):
    mentor_details = UserSerializer(source='mentor', read_only=True)
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Division
        fields = [
            'id',
            'name',
            'mentor',
            'mentor_details',
            'student_count',
            'created_at',
        ]

    def get_student_count(self, obj):
        return obj.students.count()


class AssignmentSerializer(serializers.ModelSerializer):
    student_details = UserSerializer(source='student', read_only=True)
    division_details = DivisionSerializer(source='division', read_only=True)

    class Meta:
        model = Assignment
        fields = [
            'id',
            'student',
            'division',
            'student_details',
            'division_details',
            'created_at',
        ]


class BulkAssignmentSerializer(serializers.Serializer):
    division_id = serializers.IntegerField()
    student_ids = serializers.ListField(
        child=serializers.IntegerField()
    )


class FeedbackSerializer(serializers.ModelSerializer):
    student_details = UserSerializer(source='student', read_only=True)

    class Meta:
        model = Feedback
        fields = [
            'id',
            'student',
            'student_details',
            'category',
            'rating',
            'comments',
            'created_at',
        ]
        read_only_fields = ['student']


class SatisfactionSurveySerializer(serializers.ModelSerializer):
    student_details = UserSerializer(source='student', read_only=True)

    class Meta:
        model = SatisfactionSurvey
        fields = [
            'id',
            'student',
            'student_details',
            'mentor_satisfaction_rating',
            'mentor_helpfulness_rating',
            'comments',
            'created_at',
        ]
        read_only_fields = ['student']


class IssueSerializer(serializers.ModelSerializer):
    student_details = UserSerializer(
        source='student',
        read_only=True,
    )

    class Meta:
        model = Issue
        fields = [
            'id',
            'student',
            'student_details',
            'title',
            'category',
            'description',
            'priority',
            'status',
            'mentor_action',
            'mentor_response',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
    'id',
    'student',
    'student_details',
    'created_at',
    'updated_at',
]

    def validate(self, attrs):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                'Authentication is required.'
            )

        user = request.user
        profile = getattr(user, 'profile', None)
        role = profile.role if profile else None

        # Students can create issues but cannot edit submitted issues.
        if role == Role.STUDENT:
            if self.instance is not None:
                raise serializers.ValidationError(
                    'Students cannot modify submitted issues.'
                )

        # Mentors can update only mentor-managed fields.
        elif role == Role.MENTOR:
            if self.instance is not None:
                allowed_fields = {
                    'status',
                    'mentor_action',
                    'mentor_response',
                }

                unexpected_fields = (
                    set(request.data.keys()) - allowed_fields
                )

                if unexpected_fields:
                    raise serializers.ValidationError({
                        field: 'Mentors cannot modify this field.'
                        for field in sorted(unexpected_fields)
                    })

        # Admins and superusers can manage issue details.
        elif role != Role.ADMIN and not user.is_superuser:
            raise serializers.ValidationError(
                'You do not have permission to modify issues.'
            )

        return attrs


class MentoringSessionSerializer(serializers.ModelSerializer):
    student_details = UserSerializer(
        source='student',
        read_only=True,
    )
    mentor_details = UserSerializer(
        source='mentor',
        read_only=True,
    )

    class Meta:
        model = MentoringSession
        fields = [
            'id',
            'student',
            'mentor',
            'student_details',
            'mentor_details',
            'date',
            'discussion',
            'observation',
            'action_follow_up',
            'created_at',
        ]
        read_only_fields = ['id', 'mentor', 'created_at']

    def validate_student(self, student):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                'Authentication is required.'
            )

        mentor = request.user
        profile = getattr(mentor, 'profile', None)

        if not profile or profile.role != Role.MENTOR:
            raise serializers.ValidationError(
                'Only mentors can create mentoring sessions.'
            )

        try:
            assigned_mentor_id = (
                student.division_assignment.division.mentor_id
            )
        except Assignment.DoesNotExist:
            raise serializers.ValidationError(
                'This student has no division assignment.'
            )

        if assigned_mentor_id != mentor.id:
            raise serializers.ValidationError(
                'You can only record sessions for students '
                'in your assigned divisions.'
            )

        return student
