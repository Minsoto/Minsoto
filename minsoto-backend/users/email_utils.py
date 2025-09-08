from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_welcome_email(user):
    """
    Send welcome email to newly registered user
    """
    try:
        subject = f'Welcome to Minsoto, {user.first_name}!'
        
        # Create email context
        context = {
            'user': user,
            'site_name': 'Minsoto',
            'site_url': settings.FRONTEND_URL or 'http://localhost:3000',
        }
        
        # Render email templates
        text_content = render_to_string('emails/welcome_email.txt', context)
        html_content = render_to_string('emails/welcome_email.html', context)
        
        # Create email message
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        
        # Attach HTML version
        email.attach_alternative(html_content, "text/html")
        
        # Send email
        email.send()
        
        logger.info(f'Welcome email sent successfully to {user.email}')
        return True
        
    except Exception as e:
        logger.error(f'Failed to send welcome email to {user.email}: {str(e)}')
        return False

def send_username_setup_reminder(user):
    """
    Send reminder email to complete username setup
    """
    try:
        subject = 'Complete Your Minsoto Profile Setup'
        
        context = {
            'user': user,
            'site_name': 'Minsoto',
            'setup_url': f"{settings.FRONTEND_URL}/setup-username",
        }
        
        text_content = render_to_string('emails/setup_reminder.txt', context)
        html_content = render_to_string('emails/setup_reminder.html', context)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        logger.info(f'Setup reminder email sent to {user.email}')
        return True
        
    except Exception as e:
        logger.error(f'Failed to send setup reminder to {user.email}: {str(e)}')
        return False
