"""aerochess URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include

urlpatterns = [

    # Administración
    path('admin/', admin.site.urls),

    # General: /
    re_path(r'^', include('base.urls')),

    # Gestión de usuarios: accounts/
    re_path(r'^accounts/', include('django.contrib.auth.urls')),
    re_path(r'^accounts/', include('accounts.urls')),

    # Jugar: play/
    re_path(r'^play/', include('play.urls')),

    # Puzzles: puzzles/
    re_path(r'^puzzles/', include('puzzles.urls'))
]
