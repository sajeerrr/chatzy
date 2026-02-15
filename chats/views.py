from django.shortcuts import render
from .models import chatroom, message
from .serializers import ChatRoomSerializer, MessageSerializer
from rest_framework import permissions, generics

class CreateRoomView(generics, CreateAPIView):
    