
from django.test import TestCase, override_settings
from django.core.management import call_command
from django.core.management.base import CommandError
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory, force_authenticate

from accounts.models import Role
from accounts.permissions import IsAdminRole

class SeedDemoUsersTest(TestCase):
    @override_settings(DEBUG=False)
    def test_seed_demo_users_blocked_in_production(self):
        initial_user_count = User.objects.count()

        with self.assertRaisesMessage(
            CommandError,
            "This command can only be run when DEBUG is True.",
        ):
            call_command("seed_demo_users")

        self.assertEqual(User.objects.count(), initial_user_count)
class IsAdminRolePermissionTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.permission = IsAdminRole()
        self.view = object()

        self.admin = self.create_user("admin", Role.ADMIN)
        self.mentor = self.create_user("mentor", Role.MENTOR)
        self.student = self.create_user("student", Role.STUDENT)

        self.staff = self.create_user("staff", Role.STUDENT)
        self.staff.is_staff = True
        self.staff.save()

        self.superuser = User.objects.create_superuser(
            username="superuser",
            email="superuser@example.com",
            password="test-password",
        )

    @staticmethod
    def create_user(username, role):
        user = User.objects.create_user(
            username=username,
            password="test-password",
        )
        user.profile.role = role
        user.profile.save()
        return user

    def has_permission(self, user=None):
        from rest_framework.request import Request
        from rest_framework.test import force_authenticate

        request = self.factory.get("/api/users/")

        if user is not None:
            force_authenticate(request, user=user)

        request = Request(request)

        if user is not None:
            request._user = user

        return self.permission.has_permission(request, self.view)

    def test_application_admin_is_allowed(self):
        self.assertTrue(self.has_permission(self.admin))

    def test_superuser_is_allowed(self):
        self.assertTrue(self.has_permission(self.superuser))

    def test_staff_without_admin_role_is_denied(self):
        self.assertFalse(self.has_permission(self.staff))

    def test_mentor_is_denied(self):
        self.assertFalse(self.has_permission(self.mentor))

    def test_student_is_denied(self):
        self.assertFalse(self.has_permission(self.student))

    def test_unauthenticated_user_is_denied(self):
        self.assertFalse(self.has_permission())

class UserManagementEndpointSecurityTests(TestCase):
    def setUp(self):
        from rest_framework.test import APIClient

        self.client = APIClient()
        self.admin = self.create_user("endpoint_admin", Role.ADMIN)
        self.mentor = self.create_user("endpoint_mentor", Role.MENTOR)
        self.student = self.create_user("endpoint_student", Role.STUDENT)
        self.staff = self.create_user("endpoint_staff", Role.STUDENT)
        self.staff.is_staff = True
        self.staff.save()
        self.superuser = User.objects.create_superuser(
            username="endpoint_superuser",
            email="endpoint_superuser@example.com",
            password="test-password",
        )

    @staticmethod
    def create_user(username, role):
        user = User.objects.create_user(
            username=username,
            password="test-password",
        )
        user.profile.role = role
        user.profile.save()
        return user

    def test_admin_can_list_users(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, 200)

    def test_superuser_can_list_users(self):
        self.client.force_authenticate(user=self.superuser)
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, 200)

    def test_mentor_cannot_list_users(self):
        self.client.force_authenticate(user=self.mentor)
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, 403)

    def test_student_cannot_list_users(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, 403)

    def test_staff_without_admin_role_cannot_list_users(self):
        self.client.force_authenticate(user=self.staff)
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, 403)

    def test_unauthenticated_user_cannot_list_users(self):
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, 401)

    def test_mentor_cannot_retrieve_user_details(self):
        self.client.force_authenticate(user=self.mentor)
        response = self.client.get(f"/api/users/{self.student.id}/")
        self.assertEqual(response.status_code, 403)

    def test_student_cannot_create_users(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            "/api/users/",
            {
                "username": "unauthorized_user",
                "password": "test-password",
                "email": "unauthorized@example.com",
                "role": Role.STUDENT,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_mentor_cannot_update_users(self):
        self.client.force_authenticate(user=self.mentor)
        response = self.client.patch(
            f"/api/users/{self.student.id}/",
            {"email": "changed@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_student_cannot_delete_users(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.delete(f"/api/users/{self.mentor.id}/")
        self.assertEqual(response.status_code, 403)

    def test_admin_can_retrieve_user_details(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/users/{self.student.id}/")
        self.assertEqual(response.status_code, 200)

    def test_admin_can_create_users(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            "/api/users/",
            {
                "username": "created_by_admin",
                "password": "test-password",
                "email": "created@example.com",
                "role": Role.STUDENT,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            User.objects.filter(username="created_by_admin").exists()
        )


class UserManagementAPITestCase(TestCase):
    def setUp(self):
        from rest_framework.test import APIClient
        from accounts.models import Role

        self.client = APIClient()

        self.admin = User.objects.create_user(
            username='admin_user',
            password='password123',
            email='admin@test.edu',
            first_name='Admin',
            last_name='User',
        )
        self.admin.profile.role = Role.ADMIN
        self.admin.profile.save()

        self.mentor = User.objects.create_user(
            username='mentor_user',
            password='password123',
            email='mentor@test.edu',
            first_name='Mentor',
            last_name='User',
        )
        self.mentor.profile.role = Role.MENTOR
        self.mentor.profile.department = 'Computer Science'
        self.mentor.profile.designation = 'Assistant Professor'
        self.mentor.profile.save()

        self.student = User.objects.create_user(
            username='student_user',
            password='password123',
            email='student@test.edu',
            first_name='Student',
            last_name='User',
        )
        self.student.profile.role = Role.STUDENT
        self.student.profile.roll_number = 'CS2026-001'
        self.student.profile.department = 'Computer Science'
        self.student.profile.save()

    def test_admin_can_list_users(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/users/')

        self.assertEqual(response.status_code, 200)
        usernames = [u['username'] for u in response.data]
        self.assertIn('admin_user', usernames)
        self.assertIn('mentor_user', usernames)
        self.assertIn('student_user', usernames)

    def test_admin_can_filter_users_by_role(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/users/?role=STUDENT')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'student_user')
        self.assertEqual(response.data[0]['role'], 'STUDENT')

    def test_admin_can_search_users(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/users/?search=CS2026-001')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'student_user')

    def test_admin_can_create_student_with_profile(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'username': 'new_student',
            'password': 'password123',
            'email': 'new_student@test.edu',
            'first_name': 'New',
            'last_name': 'Student',
            'role': 'STUDENT',
            'roll_number': 'CS2026-099',
            'department': 'Information Technology',
            'phone': '9876543210',
        }
        response = self.client.post('/api/users/', payload, format='json')

        self.assertEqual(response.status_code, 201)
        created_user = User.objects.get(username='new_student')
        self.assertEqual(created_user.profile.role, 'STUDENT')
        self.assertEqual(created_user.profile.roll_number, 'CS2026-099')
        self.assertEqual(created_user.profile.department, 'Information Technology')
        self.assertEqual(created_user.profile.phone, '9876543210')

    def test_admin_can_create_mentor_with_profile(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'username': 'new_mentor',
            'password': 'password123',
            'email': 'new_mentor@test.edu',
            'first_name': 'Faculty',
            'last_name': 'Mentor',
            'role': 'MENTOR',
            'designation': 'Associate Professor',
            'department': 'Electronics',
        }
        response = self.client.post('/api/users/', payload, format='json')

        self.assertEqual(response.status_code, 201)
        created_user = User.objects.get(username='new_mentor')
        self.assertEqual(created_user.profile.role, 'MENTOR')
        self.assertEqual(created_user.profile.designation, 'Associate Professor')

    def test_admin_can_update_user_profile(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'department': 'Data Science',
            'phone': '1122334455',
        }
        response = self.client.patch(f'/api/users/{self.student.id}/', payload, format='json')

        self.assertEqual(response.status_code, 200)
        self.student.profile.refresh_from_db()
        self.assertEqual(self.student.profile.department, 'Data Science')
        self.assertEqual(self.student.profile.phone, '1122334455')

    def test_admin_can_delete_user(self):
        self.client.force_authenticate(user=self.admin)
        target_user = User.objects.create_user(username='to_delete', password='password123')
        response = self.client.delete(f'/api/users/{target_user.id}/')

        self.assertEqual(response.status_code, 204)
        self.assertFalse(User.objects.filter(username='to_delete').exists())

    def test_admin_cannot_delete_self(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(f'/api/users/{self.admin.id}/')

        self.assertEqual(response.status_code, 400)
        self.assertTrue(User.objects.filter(id=self.admin.id).exists())

    def test_mentor_cannot_list_or_create_users(self):
        self.client.force_authenticate(user=self.mentor)
        list_response = self.client.get('/api/users/')
        self.assertEqual(list_response.status_code, 403)

        create_response = self.client.post('/api/users/', {'username': 'hacker', 'password': '123'}, format='json')
        self.assertEqual(create_response.status_code, 403)

    def test_student_cannot_list_or_create_users(self):
        self.client.force_authenticate(user=self.student)
        list_response = self.client.get('/api/users/')
        self.assertEqual(list_response.status_code, 403)

        create_response = self.client.post('/api/users/', {'username': 'hacker', 'password': '123'}, format='json')
        self.assertEqual(create_response.status_code, 403)

    def test_unauthenticated_cannot_access_users(self):
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, 401)

    def test_duplicate_username_fails(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'username': 'student_user',
            'password': 'password123',
            'role': 'STUDENT',
        }
        response = self.client.post('/api/users/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('username', response.data)
