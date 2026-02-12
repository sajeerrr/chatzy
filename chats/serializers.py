from rest_framework import serializers
from accounts.models import ChatRoom, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatRoomSerializer(serializers, ModelSerializer):
    partipants = serializers.PrimaryKeyRelatedField(
        queryset = User.objects.all(),
        many=True
    )
