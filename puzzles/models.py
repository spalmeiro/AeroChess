from django.db import models

# Modelo para los puzzles
class Puzzle(models.Model):
    categories = (
        (1, "Checkmate in 2 moves"),
        (2, "Checkmate in 3 moves"),
        (3, "Checkmate in 4 moves")
    )
    category = models.IntegerField(choices=categories)
    citation = models.TextField()
    fen = models.CharField(max_length=92)
    solution = models.TextField()
