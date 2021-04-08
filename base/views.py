from django.shortcuts import render

# Página principal
def index(request):
    return render(request, 'index.html')

# Página sobre el proyecto
def about(request):
    return render(request, 'about.html')