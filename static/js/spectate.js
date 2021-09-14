/* 
    CÓDIGO NECESARIO PARA EL FUNCIONAMIENTO DEL MODO ESPECTADOR
*/



//----------------------------------- DECLARACIÓN DE VARIABLES -----------------------------------//


// Variables del tablero y del estado de la partida
var $board = $('#spectatorBoard')
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var squareToHighlight = null // Se usa para pintar los cuadros de los ultimos movimientos
var orientation = null
var game_over = false // Se usa para marcar que la partida se ha acabado mediante acuerdo de los jugadores

// Variables para la definición de la URL de comunicación del WebSocket
var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws"
var ws_path = ws_scheme + '://' + window.location.host + window.location.pathname
console.log("Connecting to " + ws_path)

// WebSocket
var socket = new WebSocket(ws_path)


////////////////////////////////////////////////////////////////////////////////////////////////////




// ------------- BLOQUE DE FUNCIONES PARA EL FUNCIONAMIENTO DEL TABLERO Y EL JUEGO -------------- //


// Reproduce los sonidos que se le pasan como argumento
function reproSon (name) {
    if (sound == 1) {
        var audio = new Audio('/static/sounds/' + name)
        audio.play()
    } else {
        return
    }
}

// Desmarca el último movimiento realizado
function removeHighlights () {
    $board.find('.square-55d63').removeClass('highlight')
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

        // Ganan negras
        if(moveColor === 'blancas') {
            status = "Fin de la partida, las negras hacen jaque mate."
        }

        // Ganan blancas
        else {    
            status = "Fin de la partida, las blancas hacen jaque mate."
        }

        reproSon('mate.mp3')
    }

    // Comprueba si hay tablas
    else if (game.in_draw()) {

        status = "Fin de la partida, tablas"

        $('#statusModal_title').html("Tablas")
        $('#statusModal_body').html("La partida ha acabado en tablas. ¡Han empatado!")
        $('#statusModal').modal({
            keyboard: false,
            backdrop: 'static'
        })
    }

    // Comprueba si hay tablas por ahogado
    else if (game.in_stalemate()) {

        status = 'Fin de la partida, tablas por ahogado'

        $('#statusModal_title').html("Tablas por ahogado.")
        $('#statusModal_body').html("La partida ha acabado en tablas por ahogado. ¡Han empatado!")
        $('#statusModal').modal({
            keyboard: false,
            backdrop: 'static'
        })
    }

    // Comprueba si hay tablas por repetición
    else if (game.in_threefold_repetition()) {

        status = 'Fin de la partida, tablas por repetición'

        $('#statusModal_title').html("Tablas")
        $('#statusModal_body').html("La partida ha acabado en tablas por repetición. ¡Han empatado!")
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




// --------------- BLOQUE DE FUNCIONES PARA LA COMUNICACIÓN MEDIANTE EL WEBSOCKET --------------- //


// Maneja el inicio de la comunicación
socket.onopen = function () {
    $('#connectionModal').modal('hide');
    $('#connectionModal').data('bs.modal', null);
}

// Maneja una posible interrupción de la comunicación
socket.onclose = function () {
    $('#connectionModal_title').html("Conexión interrumpida")
    $('#connectionModal_body').html("La conexión se ha interrumpido inesperadamente, por favor espera mientras intentamos reconectar...")
    $('#connectionModal').modal({
        keyboard: false,
        backdrop: 'static'
    })
}

// Asigna acciones a realizar en función de los distintos mensajes que se reciban
socket.onmessage = function (message) {

    // Imprime en la consola el mensaje recibido
    console.log("Got websocket message " + message.data)

    // Convierte el archivo JSON recibido en un objeto
    var data = JSON.parse(message.data)

    // Se encarga de las acciones a realizar cuando te unes a la partida
    if (data.command == "join_spectator") {

        console.log("Joining room as spectator")

        // Carga la configuración del tablero
        var config = {
            draggable: false,
            pieceTheme: piece_theme,
            position: 'start',
            orientation: data.orientation
        }

        // Crea la instancia del tablero y la orientación
        board = Chessboard('spectatorBoard', config)
        orientation = data.orientation

        // Permite que el tablero sea responsive
        $(window).resize(board.resize)

        // Carga el PGN si existiera
        if(data.pgn){
            game.load_pgn(data.pgn)
        }

        // Carga el tablero y actualiza el estado de la partida
        board.position(game.fen());
        updateStatus();
    }

    // Cuando ambos jugadores se conectan, hace desaparecer el modal
    else if (data.command == "opponent-online"){
        $('#connectionModal').modal('hide')
        $('#connectionModal').data('bs.modal', null)
        $("#opponent_name").load(location.href + " #opponent_name")
    }

    // Si un jugador se desconecta
    else if (data.command == "opponent-offline"){

        // Si la partida ha acabado, desactiva la funcionalidad
        if (game.game_over() || game_over) return false

        // Activa el modal
        $('#disconnectionModal_title').html("Uno de los jugadores ha abandonado la sala")
        $('#disconnectionModal_body').html("<p>Esperando a que regrese...<div id='countdown'></div></p>" +
        "<p>Si no lo hace, la partida le contará como una derrota.</p>")
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

        // Se destaca el movimiento realizado
        removeHighlights()
        $board.find('.square-' + data.source).addClass('highlight')
        $board.find('.square-' + data.target).addClass('highlight')
        
        // Se actualiza el estado de la partida
        updateStatus()

        reproSon("ficha.wav")
    }

    // Si se acaba la partida
    else if (data.command == "gameisover") {

        if (data.winner == "Blancas") {
            $('#statusModal_title').html("Fin de la partida")
            $('#statusModal_body').html("Las blancas han hecho jaque mate a su oponente.")
        }
        else if (data.winner == "Negras") {
            $('#statusModal_title').html("Fin de la partida");
            $('#statusModal_body').html("Las negras han hecho jaque mate a su oponente.d");
        }

        $('#statusModal').modal({
            backdrop: 'static',
            keyboard: false
        })
    }

    // Si se ofrecen tablas
    else if (data.command == "opponent-offer-draw") {
        $('#statusModal_title').html("Oferta de tablas")
        $('#statusModal_body').html("Se ha hecho una oferta de tablas. Esperando respuesta...")
        $('#statusModal').modal({
            backdrop: 'static',
            keyboard: false
        })
    }

    // Si se aceptan las tablas
    else if (data.command == "opponent-accept-draw") {
        
        $('#statusModal').modal('hide')
        $('#statusModal').data('bs.modal', null)

        var status = "Fin de la partida, tablas voluntarias"

        $status.html(status)

        $('#statusModal_title').html("Fin de la partida")
        $('#statusModal_body').html("Se ha aceptado la oferta de tablas. La partida acaba en empate.")
        $('#statusModal').modal({
            backdrop: 'static',
            keyboard: false
        })    }

    // Si se rechazan las tablas esconde el modal de espera y continúa la partida
    else if (data.command == "opponent-reject-draw") {

        $('#statusModal').modal('hide')
        $('#statusModal').data('bs.modal', null)

        $('#statusModal_title').html("Tablas rechazadas")
        $('#statusModal_body').html("Se ha rechazado la oferta de tablas. La partida continúa.")
        $("#statusModal").modal()
    }

    // Si un jugador, la partida se acaba
    else if (data.command == "opponent-resigned") {

        var status = ""

        if (data.winner == "Blancas") {
            $('#statusModal_title').html("Fin de la partida")
            $('#statusModal_body').html("Las negras han abandonado la partida. Victoria de blancas.")
            status = "Fin de la partida, abandono de negras"
        }
        else if (data.winner == "Negras") {
            $('#statusModal_title').html("Fin de la partida")
            $('#statusModal_body').html("Las blancas han abandonado la partida. Victoria de negras.")
            status = "Fin de la partida, abandono de blancas"
        }

        $status.html(status)
        
        $('#statusModal').modal({
            backdrop: 'static',
            keyboard: false
        })
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////




// ------------ BLOQUE DE FUNCIONES PARA LOS BOTONES QUE SE MUESTRAN EN LA INTERFAZ ------------- //


// Aplica los cambios de personalización al tablero
$('#customization').on('click', function() {

    reproSon("click.wav")

    board.flip() 
    board.flip()
})

// Volver al lobby
$('#return').on('click', function() {
    var path = window.location.protocol + "//" + window.location.host + "/play/online"
    window.location.href = path
})


////////////////////////////////////////////////////////////////////////////////////////////////////