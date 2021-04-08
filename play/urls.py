from django.urls import path
from . import views

# Jugar: play/
urlpatterns = [
    path('computer', views.computer, name='computer'),
    path('computer/make_move', views.make_move, name='make_move'),
    path('online/', views.lobby, name='lobby'),
    path('online/create', views.creategame, name='creategame'),
    path('online/game/<int:game_id>', views.game, name='game')
]