from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('about', views.about, name='about'),
    path('play/computer', views.computer, name='computer'),
    path('play/computer/make_move', views.make_move, name='make_move')
]