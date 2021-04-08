from django.shortcuts import render

# Create your views here.
def lista(request):
    return render(request, "puzzles/lista.html")

# Create your views here.
def lista2(request):
    return render(request, "puzzles/lista2.html")