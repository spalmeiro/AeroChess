from django.shortcuts import redirect, render

from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User

from .forms import signupform, changeuserdataform
from play.models import Game
from django.db.models import Q

# Registro
def signup(request):

    if request.method == "POST":

        form = signupform(request.POST)

        # Si la form es válida
        if form.is_valid():

            user = form.save()
            user.refresh_from_db() 

            # Carga la instancia del perfil creada por la señal
            user.save()
            raw_password = form.cleaned_data.get("password1")
 
            # Inicia sesión inmediatamente despúes de crear la cuenta
            user = authenticate(username=user.username, password=raw_password)
            login(request, user)
 
            # Redirige al usuario a la página principal
            return redirect("/")

        # Si la form no es válida
        else:

            # Redirige al usuario a la form y muestra los errores
            return render(request, "registration/signup.html", {"form": form})

    else:
        form = signupform()

    return render(request, "registration/signup.html", {"form": form})


# Perfil
@login_required
def profile(request):

    # Lista de partidas completadas
    completed_games = Game.objects.all().filter(status=3).filter(Q(owner=request.user) | Q(adversary=request.user))
    completed = []

    for i in completed_games:

        game = {}

        if request.user == i.owner:

            game["opponent"] = i.adversary

            if i.owner_side == "black":
                game["side"] = "Negras"
            elif i.owner_side == "white":
                game["side"] = "Blancas"

            if i.winner == "Tablas":
                game["result"] = "Tablas"           
            elif i.winner == game["side"]:
                game["result"] = "Victoria"
            else:
                game["result"] = "Derrota"

            game["details"] = i.details
            
        elif request.user == i.adversary:

            game["opponent"] = i.owner
            
            if i.owner_side == "black":
                game["side"] = "Blancas"
            elif i.owner_side == "white":
                game["side"] = "Negras"

            if i.winner == "Tablas":
                game["result"] = "Tablas"           
            elif i.winner == game["side"]:
                game["result"] = "Victoria"
            else:
                game["result"] = "Derrota"

            game["details"] = i.details


        completed.append(game)


    # Modificar datos de usuario
    if request.method == "POST":

        form = changeuserdataform(request.POST)

        # Si la form es válida
        if form.is_valid():

            new = {}
            user = User.objects.get(username = request.user.username)

            new['username'] = form.cleaned_data['username']
            new['email'] = form.cleaned_data['email']

            user.username = new['username']
            user.email = new['email']
            user.save()
 
            # Redirige al usuario a la página del perfil
            return render(request, "accounts/profile.html", {"form": form, "success": True, "new": new, "completed": completed})

        # Si la form no es válida
        else:

            # Redirige al usuario a la form y muestra los errores
            return render(request, "accounts/profile.html", {"form": form, "success": False, "completed": completed})

    else:
        form = changeuserdataform()

    return render(request, "accounts/profile.html", {"form": form, "success": False, "completed": completed})
