from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render

from django.contrib import messages
from django.contrib.auth.decorators import login_required

from .forms import creategameform
from .models import Game
from django.db.models import Q

import chess
import chess.engine
from stockfish import Stockfish

import random

# Rutas hacia stockfish.exe
stockfish = Stockfish("../stockfish/stockfish_13_win_x64/stockfish_13_win_x64.exe")
engine = chess.engine.SimpleEngine.popen_uci("../stockfish/stockfish_13_win_x64/stockfish_13_win_x64.exe")




## -- MULTIPLAYER -- ##

# Crear partida PvP
@login_required
def creategame(request):

    if request.method == "POST":

        form = creategameform(request.POST)

        if form.is_valid():

            game = form.save(commit=False)
            game.owner = request.user
            print(game.private)

            if game.owner_side == "random":
                game.owner_side = random.choice(("white", "black"))

            game.save()

            # Redirige al usuario a la sala creada
            return redirect(f"/play/online/game/{game.pk}")

    else:
        form = creategameform()

    return render(request, "play/online/create.html", {"form": form})


# Lobby de partidas
@login_required
def lobby(request):

    public_games = Game.objects.all().filter(status=1).exclude(Q(owner=request.user) | Q(private=True))
    ongoing_games = Game.objects.all().filter(status=2).exclude(Q(owner=request.user) | Q(adversary=request.user) | Q(private=True))

    public = []
    ongoing = []

    # Partidas esperando adversario
    for i in public_games:

        game = {}

        if i.owner_side == "white":
            game["side"] = "Negras"
        else:
            game["side"] = "Blancas"

        game["link"] = f"/play/online/game/{i.pk}"
        game["owner"] = i.owner

        public.append(game)

    # Partidas en juego
    for i in ongoing_games:

        game = {}

        game["owner"] = i.owner
        game["adversary"] = i.adversary
        game["link"] = f"/play/online/game/{i.pk}"

        ongoing.append(game)

    return render(request, "play/online/lobby.html", {"public": public, "ongoing": ongoing})


# Partida PvP
@login_required
def game(request, game_id):

    # Carga la información sobre la partida desde la base de datos
    game = get_object_or_404(Game, pk=game_id)

    # Si la partida ya ha empezado, entra como espectador
    if (game.owner_online and game.adversary_online):
        return render(request, "play/online/spectate.html", {"owner": game.owner.username , "opponent": game.adversary, "owner_side": game.owner_side})

    # Si la partida ya ha acabado, vuelve
    if game.status == 3:
        messages.add_message(request, messages.ERROR, "Esta partida ya ha terminado. ¡Empieza otra!")
        return HttpResponseRedirect(reverse("/play/online/lobby"))
    
    # Si el usuario no es el creador de la partida
    if request.user != game.owner:

        # Si no hay adversario, entra como adversario
        if game.adversary == None:

            game.adversary = request.user
            game.status = 2
            game.save()         
                       
    return render(request, "play/online/game.html", {"owner": game.owner.username , "opponent": game.adversary, "private": game.private})




## -- SINGLEPLAYER -- ##

# Partida contra el ordenador
def computer(request):
    return render(request, "play/computer.html")


# Para recibir los datos de la partida y generar la respuesta del motor de ajedrez
def make_move(request): 

    fen = request.POST["fen"] # Recoge el FEN de la partida
    
    move_time = request.POST["move_time"] # Recoge el tiempo de movimiento permitido para el ordenador

    level = request.POST["level"] # Recoge el nivel de dificultad seleccionado para el ordenador

    stockfish.set_skill_level(int(level)) # Carga el nivel de dificultad en stockfish
    
    sub_board = stockfish.set_fen_position(fen) # Crea un tablero en stockfish con el FEN recogido de la web
    
    board = chess.Board(fen)
    
    best_move = stockfish.get_best_move_time(int(move_time)) # Se busca el mejor movimiento en el tiempo permitido
    
    board.push_uci(str(best_move)) # Se ejecuta el mejor movimiento en el tablero creado en Stockfish

    info = engine.analyse(board, chess.engine.Limit(time=0.1)) # Devuelve la información de la partida tras un análisis de Stockfish 
    
    fen = board.fen() # Devuelve el nuevo FEN de la partida tras el movimiento de Stockfish

    stockfish.set_skill_level(20) # Carga el nivel de dificultad en stockfish
    
    sub_board = stockfish.set_fen_position(fen) # Crea un tablero en stockfish con el FEN recogido de la web

    Tu_best_move = stockfish.get_best_move_time(100) # Se busca el mejor movimiento en el tiempo permitido    
    
    # Se devuelven todas las variables que serán enviadas de nuevo a la web mediante un archivo json
    data = {
        "fen": fen,            
        "best_move": str(best_move),
        "score": str(info["score"].white().score()),
        "pv": str(best_move),
        "nodes":str(best_move),
        "time": str(Tu_best_move)
    }
    
    return JsonResponse(data)
