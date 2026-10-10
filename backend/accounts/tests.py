
from django.test import TestCase, override_settings
from django.core.management import call_command
from django.core.management.base import CommandError
from django.contrib.auth.models import User


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
