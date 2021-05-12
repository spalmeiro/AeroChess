from .models import Game
from django.forms import ModelForm

# Form para crear una partida privada
class creategameform(ModelForm):
    class Meta:
        model = Game
        fields = ['private', 'owner_side']
