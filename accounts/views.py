from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomObtainAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "user": UserSerializer(user).data,
            "token": token.key
        })

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Allow searching by username
        queryset = User.objects.all()
        q = self.request.query_params.get('q')
        if q:
            queryset = queryset.filter(username__icontains=q)
        return queryset.exclude(id=self.request.user.id) # Exclude self
