from django.shortcuts import redirect, render

from django.contrib.auth import authenticate, login

from .forms import signupform

# Registro
def signup(request):
    if request.method == 'POST':
        form = signupform(request.POST)
        if form.is_valid():
            user = form.save()
            user.refresh_from_db() 

            # Carga la instancia del perfil creada por la señal
            user.save()
            raw_password = form.cleaned_data.get('password1')
 
            # Inicia sesión inmediatamente despúes de crear la cuenta
            user = authenticate(username=user.username, password=raw_password)
            login(request, user)
 
            # Redirige al usuario a la página principal
            return redirect('/')
    else:
        form = signupform()
    return render(request, 'registration/signup.html', {'form': form})
