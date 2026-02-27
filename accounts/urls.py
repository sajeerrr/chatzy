from django.urls import path
from .views import RegisterView, CustomObtainAuthToken, UserListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomObtainAuthToken.as_view(), name='login'),
    path('users/', UserListView.as_view(), name='user-list'),
]
