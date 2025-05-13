from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import BaseUserManager
from django.utils.translation import gettext_lazy as _
import uuid
from django.utils import timezone
from datetime import timedelta


class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    def _create_user(self, email, password=None, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user model"""
    email = models.EmailField(unique=True)
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.UUIDField(default=uuid.uuid4, editable=False)
    email_verification_token_created_at = models.DateTimeField(auto_now_add=True)
    password_reset_token = models.UUIDField(null=True, blank=True, editable=False)
    password_reset_token_created_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.username
    
    def is_email_verification_token_valid(self):
        """Check if the email verification token is still valid (24 hours)"""
        if not self.email_verification_token_created_at:
            return False
        return timezone.now() - self.email_verification_token_created_at < timedelta(hours=24)
    
    def is_password_reset_token_valid(self):
        """Check if the password reset token is still valid (1 hour)"""
        if not self.password_reset_token_created_at:
            return False
        return timezone.now() - self.password_reset_token_created_at < timedelta(hours=1)
    
    def generate_password_reset_token(self):
        """Generate a new password reset token"""
        self.password_reset_token = uuid.uuid4()
        self.password_reset_token_created_at = timezone.now()
        self.save()
        return self.password_reset_token