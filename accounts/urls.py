from django.urls import path
from . import views

# Gestión de usuarios: accounts/
urlpatterns = [
    path('signup/', views.signup, name='signup'), 
]
