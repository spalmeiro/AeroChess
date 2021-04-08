from django.urls import path
from . import views

# General: /
urlpatterns = [
    path('', views.index, name='index'),
    path('about', views.about, name='about'),    
]
