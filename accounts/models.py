from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class ChatRoom(models.Model):
    name = models.CharField(max_length=255, blank=True)
    participants = models.ManyToManyField(Users, related_name="rooms")
    is_group = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name if self.name else "Private Chat"

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content[:30]    
