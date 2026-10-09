from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserProfile, Role

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'phone', 'department', 'roll_number', 'designation']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile']

    def get_role(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.role
        return Role.ADMIN if obj.is_superuser else Role.STUDENT

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        role = Role.ADMIN if user.is_superuser else Role.STUDENT
        if hasattr(user, 'profile'):
            role = user.profile.role
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        role = Role.ADMIN if user.is_superuser else Role.STUDENT
        department = ''
        roll_number = ''
        designation = ''
        phone = ''
        if hasattr(user, 'profile'):
            role = user.profile.role
            department = user.profile.department or ''
            roll_number = user.profile.roll_number or ''
            designation = user.profile.designation or ''
            phone = user.profile.phone or ''

        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': role,
            'department': department,
            'roll_number': roll_number,
            'designation': designation,
            'phone': phone,
        }
        return data

class UserCreateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=Role.choices, default=Role.STUDENT)
    phone = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)
    roll_number = serializers.CharField(required=False, allow_blank=True)
    designation = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone', 'department', 'roll_number', 'designation']

    def create(self, validated_data):
        role = validated_data.pop('role', Role.STUDENT)
        phone = validated_data.pop('phone', '')
        department = validated_data.pop('department', '')
        roll_number = validated_data.pop('roll_number', '')
        designation = validated_data.pop('designation', '')
        password = validated_data.pop('password')

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = role
        profile.phone = phone
        profile.department = department
        profile.roll_number = roll_number
        profile.designation = designation
        profile.save()

        return user
