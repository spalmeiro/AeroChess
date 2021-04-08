from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

from .models import Game
from django.contrib.auth.models import User

# Consumer para el modo multijugador online
class multiplayerConsumer(AsyncJsonWebsocketConsumer):

    # Se encarga del establecimiento de la conexión del WebSocket
    async def connect(self):

        # Si el usuario no está registrado, no conecta
        if self.scope["user"].is_anonymous:
            await self.close()
            return

        # Coge la id de la partida desde la ruta
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]

        # Comprueba que la id de la partida es un entero
        try: 
            self.game_id = int(self.game_id)
        except:
            await self.close()
            return

        # 
        side = await self.connect_in_db(self.game_id)
        if side == False:
            await self.close()
            return
        await self.accept()
        await self.join_room(side)
        if side[2]:
            await self.opp_online()


    # Se encarga de la desconexión del WebSocket
    async def disconnect(self, code):
        await self.disconnect_in_db()
        await self.opp_offline()


    # Se encarga de gestionar la unión a la partida
    async def join_room(self, data):

        # 
        await self.channel_layer.group_add(
            str(self.game_id),
            self.channel_name,
        )

        # 
        await self.send_json({
            "command": "join",
            "orientation": data[0],
            "pgn": data[1],
            "opp_online": data[2]
        })


    # Se encarga de recibir las actualizaciones del estado de la partida y activar las acciones necesarias en cada caso
    async def receive_json(self, content):
        
        # Carga el comando que se ha recibido
        command = content.get("command", None)

        # Y ejecuta distintas acciones en función del mismo
        try:
            if command == "new-move":
                await self.new_move(content["source"], content["target"], content["fen"], content["pgn"])
            elif command == "game-over":
                await self.game_over(content["winner"])
                await self.game_over_in_db(content["result"])
            elif command == "resign":
                await self.resign()
                await self.game_over_in_db(content["result"])
        except:
            pass

    

    # Se encargan de

    async def opp_offline(self):
        await self.channel_layer.group_send(
            str(self.game_id),
            {
                "type": "opp.offline.handler",
                "sender_channel_name": self.channel_name
            }
        )
    
    async def opp_offline_handler(self,event):
        if self.channel_name != event["sender_channel_name"]:
            await self.send_json({
                "command":"opponent-offline",
            })
            print("sending offline")



    # Se encargan de

    async def opp_online(self):
        await self.channel_layer.group_send(
            str(self.game_id),
            {
                "type": "opp.online.handler",
                "sender_channel_name": self.channel_name
            }
        )
    
    async def opp_online_handler(self,event):
        if self.channel_name != event["sender_channel_name"]:
            await self.send_json({
                "command":"opponent-online",
            })
    
    

    # Se encargan de gestionar los nuevos movimientos

    async def new_move(self, source, target, fen, pgn):
        await self.channel_layer.group_send(
            str(self.game_id),
            {
                "type": "new.move.handler",
                "source": source,
                "target": target,
                "fen": fen,
                "pgn": pgn,
                "sender_channel_name": self.channel_name
            }
        )
        
    async def new_move_handler(self, event):
        if self.channel_name != event["sender_channel_name"]:
            await self.send_json({
                "command": "new-move",
                "source": event["source"],
                "target": event["target"],
                "fen": event["fen"],
                "pgn": event["pgn"],
            })
        await self.update_in_db(event["fen"], event["pgn"])



    # Se encargan de gestionar el final de una partida

    async def game_over(self, winner):
        await self.channel_layer.group_send(
            str(self.game_id),
            {
                "type": "game.over.handler",
                "winner": winner,
                "sender_channel_name": self.channel_name,
            }
        )

    async def game_over_handler(self, event):
        if self.channel_name != event["sender_channel_name"]:
            await self.send_json({
                "command": "gameisover",
                "winner": event["winner"],
            })



    # Se encargan de gestionar el abandono de una partida

    async def resign(self):
        await self.channel_layer.group_send(
            str(self.game_id),
            {
                "type": "resign.handler",
                "sender_channel_name": self.channel_name,
            }
        )
    
    async def resign_handler(self, event):
        if self.channel_name != event["sender_channel_name"]:
            await self.send_json({
                "command": "opponent-resigned",
            })
        


    ## COMUNICACIÓN CON LA BASE DE DATOS ##

    # Modifica la información de la partida en la base de datos al conectarse
    @database_sync_to_async
    def connect_in_db(self, game_id):
        
        # Carga los datos de la partida desde la base de datos
        game = Game.objects.all().filter(id=game_id)[0]

        # Comprueba que existe la entrada en la base de datos
        if not game:
            return False

        # Carga el usuario
        user = self.scope["user"]
        side = "white"
        opp = False

        # Conecta al usuario en la base de datos y le asigna su lado
        if game.opponent == user:
            game.opponent_online = True
            if game.owner_side == "white":
                side = "black"
            else:
                side = "white"
            if game.owner_online == True:
                opp = True
            print("Setting opponent online")
        elif game.owner == user:
            game.owner_online = True
            if game.owner_side == "white":
                side = "white"
            else:
                side = "black"
            if game.opponent_online == True:
                opp = True
            print("Setting owner online")
        else:
            return False
        
        # Guarda los cambios
        game.save()

        # Devuelve el lado, el PGN y si se puede jugar ya o no
        return [side, game.pgn, opp]


    # Modifica la información de la partida en la base de datos al desconectarse
    @database_sync_to_async
    def disconnect_in_db(self):

        # Carga los datos de la partida desde la base de datos
        game = Game.objects.all().filter(id=self.game_id)[0]
        
        # Carga el usuario
        user = self.scope["user"]

        # Desconecta al usuario en la base de datos
        if game.opponent == user:
            game.opponent_online = False
            print("Setting opponent offline")
        elif game.owner == user:
            game.owner_online = False
            print("Setting owner offline")

        # Guarda los cambios
        game.save()
    

    # Actualiza los datos sobre el estado de la partida en la base de datos
    @database_sync_to_async
    def update_in_db(self, fen, pgn):

        # Carga los datos de la partida desde la base de datos
        game = Game.objects.all().filter(id=self.game_id)[0]

        # Comprueba que la partida existe
        if not game:
            print("Game not found")
            return
        
        # Guarda los nuevos detalles de la partida
        game.fen = fen
        game.pgn = pgn
        game.save()
        print("Saving game details")


    # Guarda la partida como finalizada en la base de datos
    @database_sync_to_async
    def game_over_in_db(self, result):

        # Carga los datos de la partida desde la base de datos
        game = Game.objects.all().filter(id=self.game_id)[0]

        # Guarda los datos finales de la partida acabada
        if game.status == 3:
            return
        game.winner = result
        game.status = 3
        game.save()