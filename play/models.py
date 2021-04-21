from django.db import models
from django.contrib.auth.models import User

# Modelo para las partidas PvP
class Game(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owner")
    adversary = models.ForeignKey(User, on_delete=models.CASCADE, related_name="adversary", null=True, blank=True)
    owner_side = models.CharField(max_length=10, default="white")
    owner_online = models.BooleanField(default=False)
    adversary_online = models.BooleanField(default=False)
    fen = models.CharField(max_length=92, null=True, blank=True)
    pgn = models.TextField(null=True, blank=True)
    CHOICES=(
        (1,"Game Created. Waiting for adversary"),
        (2,"Game Started"),
        (3,"Game Ended"))
    status = models.IntegerField(default=1, choices=CHOICES)
    winner = models.TextField(null=True, blank=True)
    details = models.TextField(null=True, blank=True)
