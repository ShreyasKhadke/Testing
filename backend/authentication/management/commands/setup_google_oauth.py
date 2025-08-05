from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from django.conf import settings


class Command(BaseCommand):
    help = 'Setup Google OAuth social application'

    def handle(self, *args, **options):
        # Get or create the default site
        site, created = Site.objects.get_or_create(
            pk=1,
            defaults={
                'domain': 'localhost:8000',
                'name': 'localhost:8000'
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created site: {site.domain}')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Using existing site: {site.domain}')
            )

        # Get Google OAuth credentials from settings
        google_config = settings.SOCIALACCOUNT_PROVIDERS.get('google', {}).get('APP', {})
        client_id = google_config.get('client_id')
        secret = google_config.get('secret')

        if not client_id or not secret:
            self.stdout.write(
                self.style.ERROR('Google OAuth credentials not found in settings!')
            )
            return

        # Create or update Google social app
        social_app, created = SocialApp.objects.get_or_create(
            provider='google',
            defaults={
                'name': 'Google OAuth',
                'client_id': client_id,
                'secret': secret,
            }
        )

        if not created:
            # Update existing app
            social_app.client_id = client_id
            social_app.secret = secret
            social_app.save()
            self.stdout.write(
                self.style.SUCCESS('Updated existing Google OAuth app')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('Created new Google OAuth app')
            )

        # Add site to the social app
        social_app.sites.add(site)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Google OAuth setup complete!\n'
                f'Client ID: {client_id}\n'
                f'Site: {site.domain}'
            )
        )