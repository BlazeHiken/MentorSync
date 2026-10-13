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


class UserAdminUpdateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=Role.choices,
        source='profile.role',
        required=False,
    )
    phone = serializers.CharField(
        source='profile.phone', required=False, allow_blank=True,
    )
    department = serializers.CharField(
        source='profile.department', required=False, allow_blank=True,
    )
    roll_number = serializers.CharField(
        source='profile.roll_number', required=False, allow_blank=True,
    )
    designation = serializers.CharField(
        source='profile.designation', required=False, allow_blank=True,
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'department', 'roll_number', 'designation',
        ]
        read_only_fields = ['id', 'username']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()

        profile, _ = UserProfile.objects.get_or_create(user=instance)
        for field, value in profile_data.items():
            setattr(profile, field, value)
        if profile_data:
            profile.save()
        return instance

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


class UserUpdateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=Role.choices, required=False)
    phone = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)
    roll_number = serializers.CharField(required=False, allow_blank=True)
    designation = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'department', 'roll_number', 'designation']
        read_only_fields = ['id', 'username']

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        phone = validated_data.pop('phone', None)
        department = validated_data.pop('department', None)
        roll_number = validated_data.pop('roll_number', None)
        designation = validated_data.pop('designation', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        profile, _ = UserProfile.objects.get_or_create(user=instance)
        if role is not None:
            profile.role = role
        if phone is not None:
            profile.phone = phone
        if department is not None:
            profile.department = department
        if roll_number is not None:
            profile.roll_number = roll_number
        if designation is not None:
            profile.designation = designation
        profile.save()

        return instance
