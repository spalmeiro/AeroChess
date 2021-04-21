from .models import Game
from django.forms import ModelForm

# Form para crear una partida privada
class privategameform(ModelForm):
    class Meta:
        model = Game
        fields = ['adversary', 'owner_side']
