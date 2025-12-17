"""
Management command to fix users with complete profiles but is_setup_complete=False.

Usage:
    python manage.py fix_user_setup --dry-run  # Preview changes
    python manage.py fix_user_setup            # Apply changes
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from social.models import Profile

User = get_user_model()


class Command(BaseCommand):
    help = 'Fix users with complete profiles but is_setup_complete=False'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview changes without applying them',
        )
        parser.add_argument(
            '--username',
            type=str,
            help='Fix specific user by username',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        username = options.get('username')

        self.stdout.write(self.style.NOTICE(
            f"{'[DRY RUN] ' if dry_run else ''}Checking for users needing setup fix..."
        ))

        # Find users where is_setup_complete=False but they have a valid profile
        queryset = User.objects.filter(is_setup_complete=False)
        
        if username:
            queryset = queryset.filter(username=username)

        users_to_fix = []
        
        for user in queryset.select_related('profile'):
            # Check if user has indicators of a "complete" profile:
            # 1. Has a username that's not their email
            # 2. Has a profile with layout widgets
            has_custom_username = user.username and user.username != user.email
            has_profile = hasattr(user, 'profile') and user.profile is not None
            has_widgets = (
                has_profile and 
                user.profile.layout and 
                user.profile.layout.get('widgets')
            )
            
            if has_custom_username and has_widgets:
                users_to_fix.append(user)
                self.stdout.write(
                    f"  - {user.username} ({user.email}): "
                    f"username='{user.username}', widgets={len(user.profile.layout.get('widgets', []))}"
                )

        if not users_to_fix:
            self.stdout.write(self.style.SUCCESS("No users need fixing."))
            return

        self.stdout.write(f"\nFound {len(users_to_fix)} user(s) to fix.")

        if dry_run:
            self.stdout.write(self.style.WARNING(
                "\n[DRY RUN] No changes made. Remove --dry-run to apply fixes."
            ))
        else:
            # Apply the fix
            fixed_count = User.objects.filter(
                id__in=[u.id for u in users_to_fix]
            ).update(is_setup_complete=True)
            
            self.stdout.write(self.style.SUCCESS(
                f"\n✓ Fixed {fixed_count} user(s). is_setup_complete set to True."
            ))
