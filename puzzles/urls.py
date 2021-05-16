from django.urls import path
from . import views

# Puzzles: puzzles/
urlpatterns = [
    path('list', views.lista, name='lista'),
    path('<int:puzzle_id>', views.puzzle, name='puzzle'),
    path('random', views.random_puzzle, name='random_puzzle'),
]