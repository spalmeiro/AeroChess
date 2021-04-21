from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path('play/online/game/<int:game_id>', consumers.multiplayerConsumer.as_asgi()),
    # path('play/online/game/<int:game_id>/spectate', consumers.spectatorConsumer.as_asgi()),
]
