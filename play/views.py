from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render

from django.contrib import messages
from django.contrib.auth.decorators import login_required

from .forms import privategameform
from .models import Game

import chess
import chess.engine
from stockfish import Stockfish

# Rutas hacia stockfish.exe
stockfish = Stockfish('../stockfish/stockfish_13_win_x64/stockfish_13_win_x64.exe')
engine = chess.engine.SimpleEngine.popen_uci('../stockfish/stockfish_13_win_x64/stockfish_13_win_x64.exe')


# Crear partida PvP
@login_required
def creategame(request):
    if request.method == 'POST':
        form = privategameform(request.POST)
        if form.is_valid():
            game = form.save(commit=False)
            game.owner = request.user
            game.save()
            # Redirige al usuario al lobby de partidas online
            return redirect(f'/play/online/game/{game.pk}')
    else:
        form = privategameform()
    return render(request, 'play/online/create.html', {'form': form})

# Lobby de partidas públicas
@login_required
def lobby(request):

    list_of_games = Game.objects.all().filter(status=1).exclude(owner=request.user)

    public = []

    for i in list_of_games:

        game = {}

        if i.owner_side == "white":
            game["side"] = "Black"
        else:
            game["side"] = "White"

        game["link"] = f"/play/online/game/{i.pk}"
        game["owner"] = i.owner
        public.append(game)

    return render(request, 'play/online/lobby.html', {'public': public})

# Lobby de partidas en juego para cada usuario
# @login_required
# def ongoing(request):

#     games = []
#     l = Game.objects.all().filter(owner=request.user).filter(status=1)
#     g = Game.objects.all().filter(Q(owner=request.user) | Q(opponent=request.user)).filter(status=2)
#     for i in g:
#         x = {}
#         if i.owner == request.user:
#             x["opponent"] = i.opponent
#             x["side"] = i.owner_side
#         else:
#             x["opponent"] = i.owner
#             if i.owner_side == "white":
#                 x["side"] = "black"
#             else:
#                 x["side"] = "white"
#         x["link"] = f"/game/{i.pk}"
#         games.append(x) 
#     return render(request, "game/ongoing.html", {"public":l, "ongoing": games})

# Partida PvP
@login_required
def game(request, game_id):

    # Carga la información sobre la partida desde la base de datos
    game = get_object_or_404(Game, pk=game_id)

    if game.status == 3:
        messages.add_message(request, messages.ERROR, "Esta partida ya ha terminado. ¡Empieza otra!")
        return HttpResponseRedirect(reverse("/play/online/lobby"))

    if request.user != game.owner:
        if game.opponent == None:
            game.opponent = request.user
            game.status = 2
            game.save()
            messages.add_message(request, messages.SUCCESS, "Te has unido a esta partida")
        elif game.opponent != request.user:
            messages.add_message(request, messages.ERROR, "This game already has enough participants. Try joining another")
            return HttpResponseRedirect(reverse("lobby"))
            
    return render(request, "play/online/game.html", {"game_id": game_id})

# Partida contra el ordenador
def computer(request):
    return render(request, 'play/computer.html')

# Para recibir los datos de la partida y generar la respuesta del motor de ajedrez
def make_move(request): 

    fen = request.POST['fen'] # Recoge el FEN de la partida
    
    move_time = request.POST['move_time'] # Recoge el tiempo de movimiento permitido para el ordenador

    nivel = request.POST['Nivel'] # Recoge el nivel de dificultad seleccionado para el ordenador

    stockfish.set_skill_level(int(nivel)) # Carga el nivel de dificultad en stockfish
    
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
        'fen': fen,            
        'best_move': str(best_move),
        'score': str(info['score'].white().score()),
        'pv': str(best_move),
        'nodes':str(best_move),
        'time': str(Tu_best_move)
    }
    
    return JsonResponse(data)
