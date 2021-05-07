from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

from .models import Game
from django.contrib.auth.models import User

# Consumer para el modo multijugador online
class multiplayerConsumer(AsyncJsonWebsocketConsumer):


    ## -- CONEXIÓN -- ##

    # Se encarga del establecimiento de la conexión del WebSocket
    async def connect(self):

        # Si el usuario no está registrado, no conecta
        if self.scope["user"].is_anonymous:
            await self.close()
            return

        # Coge la id de la partida desde la ruta
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]

        # Convierte la id de la partida en un entero
        try: 
            self.game_id = int(self.game_id)
        except:
            await self.close()
            return

        # Conecta con la base de datos para averiguar cómo debe unirse el usario
        data = await self.connect_in_db(self.game_id)

        # Si algo falla, cierra la conexión
        if data == False:
            await self.close()
            return

        # Si todo va bien, abre la conexión
        await self.accept()

        # Se une a la sala
        await self.join_room(data)

        # Si su oponente está conectado, permite jugar
        if data[2]:
            await self.opponent_online()


    # Modifica la información de la partida en la base de datos al conectarse
    @database_sync_to_async
    def connect_in_db(self, game_id):
        
        # Carga los datos de la partida desde la base de datos
        game = Game.objects.all().filter(id=game_id)[0]

        # Comprueba que existe la partida en la base de datos
        if not game:
            return False

        # Carga el usuario
        user = self.scope["user"]

        # Recoge información sobre el usuario desde los datos de la partida, lo conecta y comprueba si su oponente está conectado
        opponent = False
        spectators = 0

        # Entra como dueño de la partida
        if user == game.owner:
            game.owner_online = True
            if game.owner_side == "white":
                side = "white"
            else:
                side = "black"
            if game.adversary_online == True:
                opponent = True
            print("Setting owner online...")

        # Entra como adversario
        elif user == game.adversary:
            game.adversary_online = True
            if game.owner_side == "white":
                side = "black"
            else:
                side = "white"
            if game.owner_online == True:
                opponent = True
            print("Setting adversary online...")

        # Entra como espectador
        else:
            side =  "white"
            spectators += 1
            print("Adding spectator...")
        
        # Guarda los cambios en la base de datos
        game.save()

        # Devuelve el lado, el PGN, si se puede jugar ya o no y el número de espectadores
        return [side, game.pgn, opponent, spectators]


    # Se encarga de gestionar la unión a la sala
    async def join_room(self, data):

        await self.channel_layer.group_add(
            str(self.game_id),
            self.channel_name,
        )

        # Si es un espectador
        if data[3]:
            await self.send_json({
                "command": "join_spectator",
                "orientation": data[0],
                "pgn": data[1],
                "spectators": data[3]
            })

        # Si es un jugador
        else:
            await self.send_json({
                "command": "join",
                "orientation": data[0],
                "pgn": data[1],
                "opponent_online": data[2],
            })


    # Si el oponente está conectado, permite jugar

    async def opponent_online(self):
        await self.channel_layer.group_send(
            str(self.game_id),
            {
                "type": "opponent.online.handler",
                "sender_channel_name": self.channel_name
            }
        )
    
    async def opponent_online_handler(self,event):
        if self.channel_name != event["sender_channel_name"]:
            await self.send_json({
                "command":"opponent-online",
            })

    


    ## -- DESCONEXIÓN -- ##

    # Se encarga de las desconexiones en la comunicación
    async def disconnect(self, code):

        spectator = await self.disconnect_in_db()
        
        # Si es un espectador pasa
        if spectator:
            pass

        # Si es un jugador, avisa de que se ha desconectado
        else:
            await self.opponent_offline()


    # Modifica la información de la partida en la base de datos al desconectarse
    @database_sync_to_async
    def disconnect_in_db(self):

        # Carga los datos de la partida desde la base de datos
        game = Game.objects.all().filter(id=self.game_id)[0]
        
        # Carga el usuario
        user = self.scope["user"]
        spectator = False

        # Desconecta al usuario en la base de datos
        if user == game.adversary:
            game.adversary_online = False
            print("Setting adversary offline")

        elif user == game.owner:
            game.owner_online = False
            print("Setting owner offline")
        
        # Si es un espectador
        else:
            spectator = True
            return spectator

        # Guarda los cambios
        game.save()

    
    # Si el oponente se desconecta, no se puede jugar

    async def opponent_offline(self):
        await self.channel_layer.group_send(
            str(self.game_id),
            {
                "type": "opponent.offline.handler",
                "sender_channel_name": self.channel_name
            }
        )
    
    async def opponent_offline_handler(self,event):
        if self.channel_name != event["sender_channel_name"]:
            await self.send_json({
                "command":"opponent-offline",
            })




    ## -- MENSAJES -- ##

    # Se encarga de recibir las actualizaciones del estado de la partida y activar las acciones necesarias en cada caso
    async def receive_json(self, content):
        
        # Carga el comando que se ha recibido
        command = content.get("command", None)

        # Y ejecuta distintas acciones en función del mismo
        try:

            # Nuevo movimiento
            if command == "new-move":
                await self.new_move(content["source"], content["target"], content["fen"], content["pgn"])

            # Fin de partida
            elif command == "game-over":
                await self.game_over(content["winner"])
                await self.game_over_in_db(content["winner"], content["details"])

            # Oferta de tablas
            elif command == "draw-offer":
                await self.draw_offer()

            # Acepta la oferta de tablas
            elif command == "draw-accept":
                await self.draw_accept()
                await self.game_over_in_db(content["winner"], content["details"])

            # Rechaza la oferta de tablas
            elif command == "draw-reject":
                await self.draw_reject()

            # Abandono
            elif command == "resign":
                await self.resign()
                await self.game_over_in_db(content["winner"], content["details"])

        except:
            pass   
    


    # Nuevo movimiento

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

    # Actualiza el estado de la partida en la base de datos-
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



    # Final de una partida

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



    # Oferta de tablas

    async def draw_offer(self):
        await self.channel_layer.group_send(
            str(self.game_id),
            {
                "type": "draw.offer.handler",
                "sender_channel_name": self.channel_name,
            }
        )
    
    async def draw_offer_handler(self, event):
        if self.channel_name != event["sender_channel_name"]:
            await self.send_json({
                "command": "opponent-offer-draw",
            })

    

    # Acepta la oferta de tablas

    async def draw_accept(self):
        await self.channel_layer.group_send(
            str(self.game_id),
            {
                "type": "draw.accept.handler",
                "sender_channel_name": self.channel_name,
            }
        )
    
    async def draw_accept_handler(self, event):
        if self.channel_name != event["sender_channel_name"]:
            await self.send_json({
                "command": "opponent-accept-draw",
            })


    
    # Rechaza la oferta de tablas

    async def draw_reject(self):
        await self.channel_layer.group_send(
            str(self.game_id),
            {
                "type": "draw.reject.handler",
                "sender_channel_name": self.channel_name,
            }
        )
    
    async def draw_reject_handler(self, event):
        if self.channel_name != event["sender_channel_name"]:
            await self.send_json({
                "command": "opponent-reject-draw",
            })



    # Abandono de una partida

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



    # Guarda la partida como finalizada en la base de datos
    @database_sync_to_async
    def game_over_in_db(self, winner, details):

        # Carga los datos de la partida desde la base de datos
        game = Game.objects.all().filter(id=self.game_id)[0]

        # Guarda los datos finales de la partida acabada
        if game.status == 3:
            return
        game.status = 3
        game.winner = winner
        game.details = details
        game.save()