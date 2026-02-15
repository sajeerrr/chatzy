from django.shortcuts import render
from .models import chatroom, message
from .serializers import ChatRoomSerializer, MessageSerializer
from rest_framework import permissions, generics

class CreateRoomView(generics, CreateAPIView):
    queryset = chatroom.object.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissons.IsAuthenticated]