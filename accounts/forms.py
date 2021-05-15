from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

# Form para registrar un usario nuevo
class signupform(UserCreationForm):
    
    # Meta datos para mostrar en la form
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']