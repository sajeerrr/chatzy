from rest_framework import serializers
from accounts.models import ChatRoom, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatRoomSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        queryset = User.objects.all(),
        many=True
    )

    class Meta:
        model = ChatRoom
        fields = ['id','name','participants','is_group','created_at']
        read_only_fields = ['created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.ReadOnlyField(source = 'sender.username')

    class Meta:
        model = Message
        fields = ['id', 'room', 'sender', 'content', 'timestamp']
        read_only_fields = ['timestamp']