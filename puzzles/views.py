from django.shortcuts import get_object_or_404, render

from .models import Puzzle

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