/* 
    CÓDIGO NECESARIO PARA EL FUNCIONAMIENTO DEL MODO ESPECTADOR
*/



//----------------------------------- DECLARACIÓN DE VARIABLES -----------------------------------//


// Variables del tablero y del estado de la partida
var $board = $('#spectatorBoard')
var game = new Chess()
var $status = $('#status') // Estado de la partida
var game_over = false // Se usa para marcar que la partida se ha acabado mediante acuerdo de los jugadores
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

// Variables para la personalización
var $piece_style = $('#piece_style') // Estilo de las piezas

// Variables que definen el título y contenido de los modales
var $connectionModalTitle = $("#connectionModal_title")
var $connectionModalBody = $("#connectionModal_body")
var $statusModalTitle = $('#statusModal_title')
var $statusModalBody = $('#statusModal_body')

// Variables para la definición de la URL de comunicación del WebSocket
var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws"
var ws_path = ws_scheme + '://' + window.location.host + window.location.pathname
console.log("Connecting to " + ws_path)

// WebSocket
var socket = new WebSocket(ws_path)


////////////////////////////////////////////////////////////////////////////////////////////////////




//-------------- BLOQUE DE FUNCIONES PARA EL FUNCIONAMIENTO DEL TABLERO Y EL JUEGO ---------------//


// Reproduce los sonidos que se le pasan como argumento
function reproSon (name) {
    var audio = new Audio('/static/sounds/' + name);
    audio.play();
}

// Desmarca el último movimiento realizado
function removeHighlights () {
    $board.find('.' + squareClass).removeClass('highlight')
}




// Actualiza los datos sobre el estado de la partida
function updateStatus () {

    var status = ""
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
            socket.send(JSON.stringify({"command": "game-over", "winner": "Negras", "details": "Jaque mate"}))
        }

        // Ganan blancas
        else {    
            status = "Fin de la partida, las blancas hacen jaque mate."
            socket.send(JSON.stringify({"command": "game-over", "winner": "Blancas", "details": "Jaque mate"}))
        }
    }

    // Comprueba si hay tablas
    else if (game.in_draw()) {

        status = "Fin de la partida, tablas"

        socket.send(JSON.stringify({"command": "game-over", "winner": "Tablas", "details": "Tablas forzadas"}))

        $statusModalTitle.html("Tablas")
        $statusModalBody.html("La partida ha acabado en tablas. ¡Han empatado!")
        $('#statusModal').modal({
            keyboard: false,
            backdrop: 'static'
        })
    }

    // Comprueba si hay tablas por ahogado
    else if (game.in_stalemate()) {

        status = 'Fin de la partida, tablas por ahogado'

        socket.send(JSON.stringify({"command": "game-over", "winner": "Tablas", "details": "Tablas por ahogado"}))

        $statusModalTitle.html("Tablas por ahogado.")
        $statusModalBody.html("La partida ha acabado en tablas por ahogado. ¡Han empatado!")
        $('#statusModal').modal({
            keyboard: false,
            backdrop: 'static'
        })
    }

    // Comprueba si hay tablas por repetición
    else if (game.in_threefold_repetition()) {

        status = 'Fin de la partida, tablas por repetición'

        socket.send(JSON.stringify({"command": "game-over", "winner": "Tablas", "details": "Tablas por repetición"}))

        $statusModalTitle.html("Tablas")
        $statusModalBody.html("La partida ha acabado en tablas por repetición. ¡Han empatado!")
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
            status += ', ' + moveColor + ' en jaque'
        }
    }

    // Se actualiza el estado de la partida, el FEN y el PGN
    $status.html(status)
    $fen.html(game.fen())
    $pgn.html(game.pgn({ max_width: 5, newline_char: "<br />"}))
}

// Si la partida no está acabada por acuerdo de los jugadores, analiza su estado
if (game_over === false) {
    updateStatus()
}


////////////////////////////////////////////////////////////////////////////////////////////////////




//---------------- BLOQUE DE FUNCIONES PARA LA COMUNICACIÓN MEDIANTE EL WEBSOCKET ----------------//


// Función que se encarga de manejar el inicio de la comunicación
socket.onopen = function () {
    $('#connectionModal').modal('hide');
    $('#connectionModal').data('bs.modal', null);
}

// Función que se encarga de manejar una posible interrupción de la comunicación
socket.onclose = function () {
    $connectionModalTitle.html("Conexión interrumpida")
    $connectionModalBody.html("La conexión se ha interrumpido inesperadamente, por favor espera mientras intentamos reconectar...")
    $('#connectionModal').modal({
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

        console.log("Joining room as spectator")

        // Carga la configuración del tablero
        var config = {
            draggable: false,
            pieceTheme: style,
            position: 'start',
            orientation: data.orientation
        }

        // Crea la instancia del tablero y la orientación
        board = Chessboard('spectatorBoard', config)
        orientation = data.orientation

        // Carga el PGN si existiera
        if(data.pgn){
            game.load_pgn(data.pgn)
        }

        // Carga el tablero y actualiza el estado de la partida
        board.position(game.fen());
        updateStatus();

        // Si alguno de los jugadores no está conectado, espera
        // if (data.opponent_online != true) {
        //     $connectionModalTitle.html("Jugador desconectado")
        //     $connectionModalBody.html("Uno de los jugadores está desconectado, esperando a que se conecte...")
        //     $('#connectionModal').modal({
        //         backdrop: 'static',
        //         keyboard: false
        //     })
        // }
    }

    // Cuando ambos jugadores se conectan, hace desaparecer el modal
    else if (data.command == "opponent-online"){
        $('#connectionModal').modal('hide')
        $('#connectionModal').data('bs.modal', null)
        $("#opponent_name").load(location.href + " #opponent_name")
    }

    // Si el oponente se desconecta
    else if (data.command == "opponent-offline"){

        // Si la partida ha acabado, desactiva la funcionalidad
        if (game.game_over() || game_over) return false

        $('#disconnectionModal').modal({
            backdrop: 'static',
            keyboard: false
        })

        var time = 10
        var time_remaining = time
        var interval = null
        
        // Para actualizar el contador
        function updateCountdown() {
            $("#countdown").html(time_remaining)
        }

        // Realiza la cuenta atrás
        interval = setInterval( function() {

            updateCountdown(time_remaining);
            time_remaining--

            if(time_remaining < 0) {
                
                // Detiene la cuenta atrás
                clearInterval(interval)

                $('#disconnectionModal').modal('hide')
                $('#disconnectionModal').data('bs.modal', null)

                var status = ""

                if(orientation === 'black') {
                    socket.send(JSON.stringify({"command": "resign", "winner": "Negras", "details": "Abandono de blancas"}))
                    status = "Fin de la partida, abandono de blancas"
                }
                else {
                    socket.send(JSON.stringify({"command": "resign", "winner": "Blancas", "details": "Abandono de negras"}))
                    status = "Fin de la partida, abandono de negras"
                }

                var status = "Fin de la partida, tablas voluntarias"

                game_over = true
                $status.html(status)

                $statusModalTitle.html("Victoria")
                $statusModalBody.html("Tu oponente ha abandonado la sala. ¡Has ganado!")
                $('#statusModal').modal({
                    backdrop: 'static',
                    keyboard: false
                })
            }

        }, 1000)
    }

    // Ejecuta el movimiento que ha realizado el oponente
    else if (data.command == "new-move") {

        // Se realiza el movimiento
        game.move({
            from: data.source,
            to: data.target,
            promotion: 'q'
            });
        board.position(game.fen())

        // Reproduce el sonido
        reproSon("ficha.wav")

        // Se destaca el movimiento realizado
        removeHighlights()
        $board.find('.square-' + data.source).addClass('highlight')
        $board.find('.square-' + data.target).addClass('highlight')
        
        updateStatus()
    }

    // Si se acaba la partida
    else if (data.command == "gameisover") {

        if ((orientation === "white" && data.winner == "Blancas") || (orientation === "black" && data.winner == "Negras")) {
            $statusModalTitle.html("Victoria")
            $statusModalBody.html("Has hecho jaque mate a tu oponente. ¡Has ganado!")
        }
        else {
            $statusModalTitle.html("Derrota");
            $statusModalBody.html("Tu oponente te ha hecho jaque mate. ¡Has perdido!");
        }

        $('#statusModal').modal({
            backdrop: 'static',
            keyboard: false
        })
    }

    // Si el oponente ofrece tablas abre el modal para responder
    else if (data.command == "opponent-offer-draw") {
        $("#drawAcceptModal").modal({
            backdrop: "static",
            keyboard: false
        })
    }

    // Si el oponente acepta las tablas esconde el modal de espera y acaba la partida
    else if (data.command == "opponent-accept-draw") {
        
        $('#drawWaitModal').modal('hide')
        $('#drawWaitModal').data('bs.modal', null)

        var status = "Fin de la partida, tablas voluntarias"

        game_over = true
        $status.html(status)

        $statusModalTitle.html("Tablas")
        $statusModalBody.html("Tu oponente ha aceptado tu oferta de tablas. ¡Habéis empatado!")
        $('#statusModal').modal({
            backdrop: 'static',
            keyboard: false
        })
    }

    // Si el oponente rechaza las tablas esconde el modal de espera y continúa la partida
    else if (data.command == "opponent-reject-draw") {

        $('#drawWaitModal').modal('hide')
        $('#drawWaitModal').data('bs.modal', null)

        $statusModalTitle.html("Tablas rechazadas")
        $statusModalBody.html("Tu oponente ha rechazado tu oferta de tablas. La partida continúa.")
        $("#statusModal").modal()
    }

    // Si se rinde el oponente, la partida se acaba
    else if (data.command == "opponent-resigned") {

        var status = ""

        if(orientation === 'black') {
            status = "Fin de la partida, abandono de blancas"
        }
        else {
            status = "Fin de la partida, abandono de negras"
        }

        game_over = true
        $status.html(status)

        $statusModalTitle.html("Victoria")
        $statusModalBody.html("Tu oponente ha abandonado la partida. ¡Has ganado!")
        $('#statusModal').modal({
            backdrop: 'static',
            keyboard: false
        })
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////




//------------- BLOQUE DE FUNCIONES PARA LOS BOTONES QUE SE MUESTRAN EN LA INTERFAZ --------------//


// Aplica los cambios de personalización al tablero
$('#customization').on('click', function() {
    reproSon("click.wav")
    board.flip() 
    board.flip()
})

// Abre el modal para ofrecer tablas
$("#drawOffer").on("click", function() {

    // Si la partida ha acabado, desactiva el botón
    if (game.game_over() || game_over) return false

    $("#drawOfferModal").modal()
})

// Envia la oferta de tablas y abre el modal para esperar la respuesta
$("#drawOffer_send").on("click", function() {

    socket.send(JSON.stringify({"command": "draw-offer"}));

    $("#drawWaitModal").modal({
        backdrop: "static",
        keyboard: false
    })
})

// Acepta la oferta de tablas
$("#drawAccept_yes").on("click", function() {

    socket.send(JSON.stringify({"command": "draw-accept", "winner": "Tablas", "details": "Tablas voluntarias"}))

    var status = "Fin de la partida, tablas voluntarias"

    game_over = true
    $status.html(status)

    $statusModalTitle.html("Tablas")
    $statusModalBody.html("Has aceptado la oferta de tablas de tu oponente. ¡Habéis empatado!")
    $('#statusModal').modal({
        keyboard: false,
        backdrop: 'static'
    })
})

// Rechaza la oferta de tablas
$("#drawAccept_no").on("click", function() {
    socket.send(JSON.stringify({"command": "draw-reject"}))
})

// Abre el modal para abandonar partida
$("#resign").on("click", function() {

    // Si la partida ha acabado, desactiva el botón
    if (game.game_over() || game_over) return false

    $("#resignModal").modal()
})

// Abandona la partida
$("#resign_yes").on("click", function() {

    var status = ""

    if(orientation === 'white') {
        socket.send(JSON.stringify({"command": "resign", "winner": "Negras", "details": "Abandono de blancas"}));
        status = "Fin de la partida, abandono de blancas"
    }
    else {
        socket.send(JSON.stringify({"command": "resign", "winner": "Blancas", "details": "Abandono de negras"}));
        status = "Fin de la partida, abandono de negras"
    }

    game_over = true
    $status.html(status)

    $statusModalTitle.html("Derrota")
    $statusModalBody.html("Has abandonado la partida. ¡Has perdido!")
    $('#statusModal').modal({
        backdrop: "static",
        keyboard: false
    })
})

// Al intentar salir de la página, muestra un mensaje de confirmación
// $(window).bind("beforeunload", function() {
//     return true;
// })


////////////////////////////////////////////////////////////////////////////////////////////////////