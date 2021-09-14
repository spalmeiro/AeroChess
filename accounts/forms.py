from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.forms import ModelForm

# Form para registrar un usario nuevo
class signupform(UserCreationForm):
    
    # Meta datos para mostrar en la form
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

# Form para cambiar los datos de usuario
class changeuserdataform(ModelForm):
    
    # Meta datos para mostrar en la form
    class Meta:
        model = User
        fields = ['username', 'email']