from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

from .models import Puzzle
from django.contrib.auth.models import User

class puzzleConsumer(AsyncJsonWebsocketConsumer):
    
    pass