from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path('puzzle', consumers.puzzleConsumer.as_asgi()),
]
