from django.urls import path
from .views import (
    CreateRoomView,
    ListUserRoomsView,
    SendMessageView,
    RoomMessagesView
)

urlpatterns = [
    path('create-room/', CreateRoomView.as_view()),
    path('my-rooms/', ListUserRoomsView.as_view()),
    path('send-message/', SendMessageView.as_view()),
    path('room/<int:room_id>/messages/', RoomMessagesView.as_view()),
]