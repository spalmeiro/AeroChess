/* 
    CÓDIGO NECESARIO PARA EL FUNCIONAMIENTO DE LA PÁGINA DE JUEGO MULTIJUGADOR
*/

// FUNCIONES PARA EL FUNCIONAMIENTO DEL TABLERO Y EL JUEGO

    // Declaración de las variables del tablero y del estado de la partida
    var $board = $('#multiplayerBoard')
    var game = new Chess()
    var $status = $('#status') // Estado de la partida
    var $fen = $('#fen') // FEN
    var $pgn = $('#pgn') // PGN
    // var $score = $('#score')
    // var $time = $('#time')
    // var $nodes = $('#nodes')
    // var $knps = $('#knps')
    var squareClass = 'square-55d63' // Se usa para pintar los cuadros de los ultimos movimientos
    var squareToHighlight = null // Se usa para pintar los cuadros de los ultimos movimientos
    var whiteSquareGrey = '#a9a9a9' // Determina el color con el que se destaca una casilla blanca
    var blackSquareGrey = '#696969' // Determina el color con el que se destaca una casilla negra
    var orientation = null

    // Variables de personalización
    var $piece_style = $('#piece_style') // Estilo de las piezas
    
    // Variables que definen el título y contenido del modal sobre el estado de la partida
    var $statusModalTitle = $('#statusModal_title')
    var $statusModalBody = $('#statusModal_body')

    // Variables para la definición de la URL de comunicación del WebSocket
    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws"
    var ws_path = ws_scheme + '://' + window.location.host + window.location.pathname
    console.log("Connecting to " + ws_path)

    // WebSocket
    var socket = new WebSocket(ws_path)


    ////////////////////////////////////////////////////////////////////////////////////////////////////


    // Función que reproduce los sonidos que se le pasan como argumento
    function reproSon (name) {
        var audio = new Audio('/static/sounds/' + name);
        audio.play();
    }

    // Función que marca casillas
    function greySquare (square) {
        var $square = $('#multiplayerBoard .square-' + square)
        
        var background = whiteSquareGrey
        if ($square.hasClass('black-3c85d')) {
            background = blackSquareGrey
        }
        
        $square.css('background', background)
    }

    // Función que desmarca casillas
    function removeGreySquares () {
        $('#multiplayerBoard .square-55d63').css('background', '')
    }

    // Función que marca los posibles movimientos cuando el ratón se sitúa sobre una pieza
    function onMouseoverSquare (square, piece) {

        // Controla que sólo se puedan seleccionar las piezas del lado al que le toca mover
        // if ((orientation === 'white' && piece.search(/^w/) === -1) || (orientation === 'black' && piece.search(/^b/) === -1)) return false
        // if (!((orientation === 'white' && game.turn()==='w') || (orientation === 'black' && game.turn()==='b'))) return

        // Consigue la lista de movimientos posibles para esa casilla
        var moves = game.moves({
            square: square,
            verbose: true
        })
        
        // Si no hay ningún movimiento posible, sale
        if (moves.length === 0) return
        
        // Destaca la casilla en la que se sitúa el ratón
        greySquare(square)
        
        // Destaca las casillas donde se puede mover la pieza
        for (var i = 0; i < moves.length; i++) {
            greySquare(moves[i].to)
        }
    }
    
    // Función que desmarca los posibles movimientos cuando el ratón ya no está situado sobre esa pieza
    function onMouseoutSquare (square, piece) {
        removeGreySquares()
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////


    // Función que actualiza los datos sobre el estado de la partida
    function updateStatus () {
        
        var status = ''
        var moveColor = 'blancas'

        // Comprueba si mueven las negras
        if (game.turn() === 'b') {
            moveColor = 'negras'
        }

        // Comprueba si hay jaque mate
        if (game.in_checkmate()) {

            reproSon('mate.mp3')

            // Ganan negras
            if(moveColor === 'blancas') {
                status = "Fin de la partida, las negras hacen jaque mate."
                socket.send(JSON.stringify({"command": "game-over", "winner": "black", "result": "Black wins"}))
            }

            // Ganan blancas
            else {    
                status = "Fin de la partida, las blancas hacen jaque mate."
                socket.send(JSON.stringify({"command": "game-over", "winner": "white", "result": "White wins"}))
            }
        }

        // Comprueba si hay tablas
        else if (game.in_draw()) {

            status = 'Fin de la partida, tablas'

            socket.send(JSON.stringify({"command": "game-over", "result": "Game ended in drawn position"}))

            $statusModalTitle.html("Game Over")
            $statusModalBody.html(status)
            $('#statusModal').modal({
                keyboard: false,
                backdrop: 'static'
            })
        }

        // Comprueba si hay tablas por ahogado
        else if (game.in_stalemate()) {

            status = 'Fin de la partida, tablas por ahogado'

            socket.send(JSON.stringify({"command": "game-over", "result": "Game ended in stalemate"}))

            $statusModalTitle.html("Game Over")
            $statusModalBody.html(status)
            $('#statusModal').modal({
                keyboard: false,
                backdrop: 'static'
            })
        }

        // Si no se cumple lo anterior, la partida continúa
        else {

            status = ' Turno de ' + moveColor

            // Comprueba si hay jaque
            if (game.in_check()) {
                status += ', ' + moveColor + ' is in check'
            }
        }

        // Se actualiza el estado de la partida, el FEN y el PGN
        $status.html(status)
        $fen.html(game.fen())
        $pgn.html(game.pgn())
    }

    updateStatus()


    ////////////////////////////////////////////////////////////////////////////////////////////////////


    // Función que controla cuándo y qué piezas se pueden seleccionar para mover
    function onDragStart (source, piece, position, orientation) {
        
        // Evita que se puedan mover fichas en una partida acabada
        if (game.game_over()) return false

        // Controla que sólo se puedan seleccionar las piezas del lado al que le toca mover
        if ((orientation === 'white' && piece.search(/^w/) === -1) || (orientation === 'black' && piece.search(/^b/) === -1)) return false
    }

    // Función que controla qué ocurre cuando soltamos una pieza
    function onDrop (source, target) {

        // Comprueba si el movimiento es legal
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // siempre promociona a reina ¿podríamos hacer algo para elegir la pieza?
        })

        // Hace que la pieza vuelva a su posición original si el movimiento no está permitido
        if (move === null) return 'snapback'

        reproSon("ficha.wav");

        // Al soltar la pieza se envía la información del movimiento en forma de JSON
        socket.send(JSON.stringify({"command": "new-move", "source": source, "target": target, "fen": game.fen(), "pgn": game.pgn()}));

        // Se actualizan los datos
        updateStatus();
    }

    //
    function onMoveEnd () {
        $board.find('.square-' + squareToHighlight)
        .addClass('highlight-black')
    }

    //
    function onSnapEnd () {
        board.position(game.fen())
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////


    // Función que se encarga de manejar el inicio de la comunicación
    socket.onopen = function () {
        $('#statusModal').modal('hide');
        $('#statusModal').data('bs.modal', null);
    }
    
    // Función que se encarga de manejar una posible interrupción de la comunicación
    socket.onclose = function () {
        $statusModalTitle.html("Conexión interrumpida")
        $statusModalBody.html("La conexión se ha interrumpido inesperadamente, por favor espera mientras intentamos reconectar...")
        $('#statusModal').modal({
            keyboard: false,
            backdrop: 'static'
        })
    }

    // Función que asigna acciones a realizar en función de los distintos mensajes que se reciban
    socket.onmessage = function (message) {

        // Imprime en la consola el mensaje recibido
        console.log("Got websocket message " + message.data)

        // Convierte el archivo JSON recibido en un objeto
        var data = JSON.parse(message.data)

        // Se encarga de las acciones a realizar cuando te unes a la partida
        if (data.command == "join") {

            console.log("Uniéndose a la partida para jugar con " + data.orientation)

            // Carga la configuración del tablero
            var config = {
                draggable: true,
                pieceTheme: style,
                position: 'start',
                onDragStart: onDragStart,
                onDrop: onDrop,
                onMouseoutSquare: onMouseoutSquare,
                onMouseoverSquare: onMouseoverSquare,
                onMoveEnd: onMoveEnd,
                onSnapEnd: onSnapEnd,
                orientation: data.orientation
            }

            // Crea la instancia del tablero y la orientación
            board = Chessboard('multiplayerBoard', config)
            orientation = data.orientation

            // Carga el PGN si existiera
            if(data.pgn){
                game.load_pgn(data.pgn)
            }

            // Carga el tablero y actualiza el estado de la partida
            board.position(game.fen());
            updateStatus();

            // Si el oponente no está conectado, espera
            if (data.opp_online != true) {
                $statusModalTitle.html("Oponente desconectado")
                $statusModalBody.html("Por favor espera a que tu oponente se conecte a la partida...")
                $('#statusModal').modal({
                    backdrop: 'static',
                    keyboard: false
                })
            }
        }

        // Si el oponente está conectado, esconde la partida del lobby
        else if (data.command == "opponent-online"){
            $('#statusModal').modal('hide')
            $('#statusModal').data('bs.modal',null)
        }

        // Si el oponente se desconecta, espera
        else if (data.command == "opponent-offline"){
            $statusModalTitle.html("Oponente desconectado")
            $statusModalBody.html("Tu oponente se ha desconectado repentinamente. Por favor espera a que vuelva a conectarse a la partida...")
            $('#statusModal').modal({
                backdrop: 'static',
                keyboard: false
            })
        }

        // Ejecuta el movimiento que ha realizado el oponente
        else if (data.command == "new-move") {
            game.move({
                from: data.source,
                to: data.target,
                promotion: 'q'
                });
            board.position(game.fen())
            reproSon("ficha.wav")
            updateStatus()
        }

        // Si se acaba la partida
        else if (data.command == "gameisover") {

            if ((orientation === "white" && data.winner == "white") || (orientation === "black" && data.winner == "black")) {
                $statusModalTitle.html("Victoria")
                $statusModalBody.html("Has hecho jaque mate a tu oponente. ¡Has ganado!")
            }
            else {
                $statusModalTitle.html("Derrota");
                $statusModalBody.html("Tu oponente te ha hecho jaque mate. ¡Has perdido!");
            }

            // Hace aparecer el modal
            $('#statusModal').modal({
                backdrop: 'static',
                keyboard: false
            })
        }

        // Si se rinde el oponente, la partida se acaba
        else if (data.command == "opponent-resigned") {
            $statusModalTitle.html("Victoria")
            $statusModalBody.html("Tu oponente ha abandonado la partida. ¡Has ganado!")
            $('#statusModal').modal({
                backdrop: 'static',
                keyboard: false
            })
        }
    }

//





// FUNCIONES PARA LOS BOTONES QUE SE MUESTRAN EN LA INTERFAZ

    // Aplica los cambios de personalización al tablero
    $('#customization').on('click', function(){
        reproSon("click.wav")
        board.flip() 
        board.flip()
    })

    // Abrir el modal para abandonar partida
    $("#resign").on("click", function(){
        $("#resignModal").modal()
    })

    // Abandonar partida
    $("#resign_yes").on("click", function(){
        if(orientation === 'white')
            socket.send(JSON.stringify({"command": "resign", "result": "Black wins"}));
        else
            socket.send(JSON.stringify({"command": "resign", "result": "White wins"}));
        $statusModalTitle.html("Derrota")
        $statusModalBody.html("Has abandonado la partida. ¡Has perdido!")
        $('#statusModal').modal({
            keyboard: false,
            backdrop: 'static'
        })
    })
     
    // Abrir el modal para ofrecer tablas
    $("#draw_offer").on('click', function(){
        $("#drawOfferModal").modal()
    })

//