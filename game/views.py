from django.shortcuts import render, redirect
from django.http import JsonResponse

from .forms import signupform
from django.contrib.auth import authenticate, login

import chess
import chess.engine
from stockfish import Stockfish

# Rutas hacia stockfish.exe
stockfish = Stockfish("../stockfish/stockfish_13_win_x64/stockfish_13_win_x64.exe")
engine = chess.engine.SimpleEngine.popen_uci("../stockfish/stockfish_13_win_x64/stockfish_13_win_x64.exe")

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

# Página principal
def index(request):
    return render(request, "index.html")

# Página sobre el proyecto
def about(request):
    return render(request, "about.html")

# Lobby de partidas
# def lobby(request):
#     return render(request, "play/lobby.html")

# Partida contra el ordenador
def computer(request):
    return render(request, "play/computer.html")

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
        'score': str(info["score"].white().score()),
        'pv': str(best_move),
        'nodes':str(best_move),
        'time': str(Tu_best_move)
    }
    
    return JsonResponse(data)
