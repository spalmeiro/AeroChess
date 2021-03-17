from django.shortcuts import render
from django.http import JsonResponse

import chess
import chess.engine
from stockfish import Stockfish

# Rutas hacia stockfish.exe
stockfish = Stockfish("C:/Users/Usuario/Desktop/Informatica/Programacion/Proyectos/PGAA/stockfish/stockfish_13_win_x64/stockfish_13_win_x64.exe")
engine = chess.engine.SimpleEngine.popen_uci("C:/Users/Usuario/Desktop/Informatica/Programacion/Proyectos/PGAA/stockfish/stockfish_13_win_x64/stockfish_13_win_x64.exe")

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

    print(nivel)
    stockfish.set_skill_level(int(nivel)) # Carga el nivel de dificultad en stockfish
    
    sub_board = stockfish.set_fen_position(fen) # Crea un tablero en stockfish con el FEN recogido de la web
    
    board = chess.Board(fen)
    
    best_move = stockfish.get_best_move_time(int(move_time)) # Se busca el mejor movimiento en el tiempo permitido
    
    board.push_uci(str(best_move)) # Se ejecuta el mejor movimiento en el tablero creado en Stockfish

    info = engine.analyse(board, chess.engine.Limit(time=0.1)) # Devuelve la información de la partida tras un análisis de Stockfish 
    
    fen = board.fen() # Devuelve el nuevo FEN de la partida tras el movimiento de Stockfish

    # Se devuelven todas las variables que serán enviadas de nuevo a la web mediante un archivo json
    data = {
        'fen': fen,            
        'best_move': str(best_move),
        'score': str(best_move),
        'pv': str(best_move),
        'nodes':str(best_move),
        'time': str(best_move)
    }
    
    return JsonResponse(data)
