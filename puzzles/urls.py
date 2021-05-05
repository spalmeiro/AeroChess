from django.urls import path
from . import views

# Puzzles: puzzles/
urlpatterns = [
    path('make_move', views.make_move, name='make_move'),
    path('lista', views.lista, name='lista'),
    path('<int:puzzle_id>', views.puzzle, name='puzzle'),
]