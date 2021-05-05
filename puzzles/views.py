from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render

from .models import Puzzle

import chess
import chess.engine
from stockfish import Stockfish

# Rutas hacia stockfish.exe
stockfish = Stockfish("../stockfish/stockfish_13_win_x64/stockfish_13_win_x64.exe")
engine = chess.engine.SimpleEngine.popen_uci("../stockfish/stockfish_13_win_x64/stockfish_13_win_x64.exe")



# Lista de puzzles
def lista(request):

    puzzle_list = Puzzle.objects.all()

    m8n2list = []
    m8n3list = []
    m8n4list = []

    for i in puzzle_list:

        puzzle = {}

        puzzle["link"] = f"/puzzles/{i.pk}"
        puzzle["citation"] = i.citation
        puzzle["fen"] = i.fen
        puzzle["solution"] = i.solution

        if i.category == 1:
            m8n2list.append(puzzle)

        elif i.category == 2:
            m8n3list.append(puzzle)

        elif i.category == 3:
            m8n4list.append(puzzle)


    return render(request, "puzzles/list.html", {"m8n2list": m8n2list, "m8n3list": m8n3list, "m8n4list": m8n4list})

# Puzzle
def puzzle(request, puzzle_id):

    # Carga la información del puzzle desde la base de datos
    puzzle = get_object_or_404(Puzzle, pk=puzzle_id)

    return render(request, "puzzles/puzzle.html", {"puzzle": puzzle})

# Para recibir los datos de la partida y generar la respuesta del motor de ajedrez
def make_move(request): 

    fen = request.POST["fen"] # Recoge el FEN de la partida
    
    move_time = request.POST["move_time"] # Recoge el tiempo de movimiento permitido para el ordenador

    nivel = request.POST["Nivel"] # Recoge el nivel de dificultad seleccionado para el ordenador

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
        "fen": fen,            
        "best_move": str(best_move),
        "score": str(info["score"].white().score()),
        "pv": str(best_move),
        "nodes":str(best_move),
        "time": str(Tu_best_move)
    }
    
    return JsonResponse(data)