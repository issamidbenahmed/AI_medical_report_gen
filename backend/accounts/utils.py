from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags

def send_confirmation_email(user):
    """Send email confirmation to user"""
    subject = 'Confirmation de votre compte'
    confirmation_url = f"{settings.FRONTEND_URL}/verify-email/{user.email_verification_token}"
    
    html_message = render_to_string('email/confirmation_email.html', {
        'user': user,
        'confirmation_url': confirmation_url,
    })
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
        html_message=html_message,
    )

def send_password_reset_email(user):
    """Send password reset email to user"""
    subject = 'Réinitialisation de votre mot de passe'
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{user.password_reset_token}"
    
    html_message = render_to_string('email/reset_password_email.html', {
        'user': user,
        'reset_url': reset_url,
    })
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
        html_message=html_message,
    ) 