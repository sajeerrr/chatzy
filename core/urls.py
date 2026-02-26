from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render

def index_view(request):
    return render(request, 'index.html')

def auth_view(request):
    return render(request, 'auth.html')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/chats/', include('chats.urls')),
    path('', index_view, name='index'),
    path('auth/', auth_view, name='auth'),
]
