# backend/users/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

# A CustomUser model allows us to add fields like 'date_of_birth' in the future.
class CustomUser(AbstractUser):
    # We'll use email as the unique identifier instead of username.
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] # Still require username for django-admin compatibility

    def __str__(self):
        return self.email

# The Interest model will be used for connections and feeds later.
class Interest(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

# The Profile model holds all non-auth related user information.
class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    profile_picture_url = models.URLField(max_length=500, blank=True, null=True)
    interests = models.ManyToManyField(Interest, blank=True)
    # We will add layout and theme fields here in a later phase.

    def __str__(self):
        return f"{self.user.username}'s Profile"

# This is a Django signal. It ensures that every time a CustomUser is created,
# a corresponding Profile object is automatically created alongside it.
@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()