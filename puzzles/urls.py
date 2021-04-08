from django.urls import path
from . import views

# Puzzles: puzzles/
urlpatterns = [
    path('lista', views.lista, name='lista'),
    path('lista2', views.lista2, name='lista2'),
]