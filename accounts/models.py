from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class ChatRoom(models.Model):
    name = models.CharField(max_length=255, blank=True)
    participants = models.ManyToManyField(Users, related_name="rooms")
    is_group
