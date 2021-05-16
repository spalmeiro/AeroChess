/* 
    CÓDIGO NECESARIO PARA EL FUNCIONAMIENTO DEL MODO MULTIJUGADOR
*/




// ---------------------------------- DECLARACIÓN DE VARIABLES ---------------------------------- //


// Variables del tablero y del estado de la partida
var $board = $('#multiplayerBoard')
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var squareToHighlight = null // Se usa para destacar el último movimiento realizado
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
    var audio = new Audio('/static/sounds/' + name);
    audio.play();
}

// Marca la casilla de la pieza seleccionada para mover
function showStart (square) {
    var $square = $('#multiplayerBoard .square-' + square)
    $square.addClass("showStart")
}

// Marca las casillas disponibles para mover sin capturar
function showMoves (square) {
    var $square = $('#multiplayerBoard .square-' + square)
    $square.addClass("showMoves")
}

// Marca las casillas disponibles para mover capturando
function showCapture (square) {
    var $square = $('#multiplayerBoard .square-' + square)
    $square.addClass("showCapture")
}

// Desmarca la casilla de la pieza seleccionada para mover
function removeshowStart () {
    $('#multiplayerBoard .square-55d63').removeClass('showStart')
}

// Desmarca las casillas disponibles para mover sin capturar
function removeshowMoves () {
    $('#multiplayerBoard .square-55d63').removeClass('showMoves')
}

// Desmarca las casillas disponibles para mover capturando
function removeshowCapture () {
    $('#multiplayerBoard .square-55d63').removeClass('showCapture')
}

// Marca los posibles movimientos cuando el ratón se sitúa sobre una pieza
function onMouseoverSquare (square, piece) {

    // Evita que se marquen movimientos en una partida acabada
    if (game.game_over() || game_over) return false

    // Controla que sólo se marquen las piezas del lado al que le toca mover
    if (!((orientation === 'white' && game.turn()==='w') || (orientation === 'black' && game.turn()==='b'))) return false

    // Consigue la lista de movimientos posibles para esa casilla
    var moves = game.moves({
        square: square,
        verbose: true
    })
    
    // Si no hay ningún movimiento posible, sale
    if (moves.length === 0) return
    
    // Destaca la casilla en la que se sitúa el ratón
    showStart(square)
    
    // Destaca las casillas donde se puede mover la pieza
    for (var i = 0; i < moves.length; i++) {
        if (moves[i].hasOwnProperty('captured')) {
            showCapture(moves[i].to)
        }
        else {
            showMoves(moves[i].to)
        }
    }
}

// Desmarca los posibles movimientos cuando el ratón ya no está situado sobre esa pieza
function onMouseoutSquare (square, piece) {
    removeshowStart()
    removeshowMoves()
    removeshowCapture()
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
            socket.send(JSON.stringify({"command": "game-over", "winner": "Negras", "details": "Jaque mate"}))
        }

        // Ganan blancas
        else {    
            status = "Fin de la partida, las blancas hacen jaque mate."
            socket.send(JSON.stringify({"command": "game-over", "winner": "Blancas", "details": "Jaque mate"}))
        }

        reproSon('mate.mp3')
    }

    // Comprueba si hay tablas
    else if (game.in_draw()) {

        status = "Fin de la partida, tablas"

        socket.send(JSON.stringify({"command": "game-over", "winner": "Tablas", "details": "Tablas forzadas"}))

        $('#statusModal_title').html("Tablas")
        $('#statusModal_body').html("La partida ha acabado en tablas. ¡Habéis empatado!")
        $('#statusModal').modal({
            keyboard: false,
            backdrop: 'static'
        })
    }

    // Comprueba si hay tablas por ahogado
    else if (game.in_stalemate()) {

        status = 'Fin de la partida, tablas por ahogado'

        socket.send(JSON.stringify({"command": "game-over", "winner": "Tablas", "details": "Tablas por ahogado"}))

        $('#statusModal_title').html("Tablas por ahogado.")
        $('#statusModal_body').html("La partida ha acabado en tablas por ahogado. ¡Habéis empatado!")
        $('#statusModal').modal({
            keyboard: false,
            backdrop: 'static'
        })
    }

    // Comprueba si hay tablas por repetición
    else if (game.in_threefold_repetition()) {

        status = 'Fin de la partida, tablas por repetición'

        socket.send(JSON.stringify({"command": "game-over", "winner": "Tablas", "details": "Tablas por repetición"}))

        $('#statusModal_title').html("Tablas")
        $('#statusModal_body').html("La partida ha acabado en tablas por repetición. ¡Habéis empatado!")
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

// Controla cuándo y qué piezas se pueden seleccionar para mover
function onDragStart (source, piece, position, orientation) {
    
    // Evita que se puedan mover fichas en una partida acabada
    if (game.game_over() || game_over) return false

    // Controla que sólo se puedan seleccionar las piezas del lado al que le toca mover
    if ((orientation === 'white' && piece.search(/^w/) === -1) || (orientation === 'black' && piece.search(/^b/) === -1)) return false
}

// Controla qué ocurre cuando soltamos una pieza
function onDrop (source, target) {

    // Comprueba si el movimiento es legal
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    })

    // Hace que la pieza vuelva a su posición original si el movimiento no está permitido
    if (move === null) return 'snapback'

    // Se destaca el movimiento realizado
    removeHighlights()
    $board.find('.square-' + source).addClass('highlight')
    $board.find('.square-' + target).addClass('highlight')

    // Se actualizan los datos
    updateStatus();

    reproSon("ficha.wav");

    // Al soltar la pieza se envía la información del movimiento en forma de JSON
    socket.send(JSON.stringify({"command": "new-move", "source": source, "target": target, "fen": game.fen(), "pgn": game.pgn()}));
}

// Controla qué ocurre cuando se acaba un movimiento (en concreto lo destaca)
function onMoveEnd () {
    $board.find('.square-' + squareToHighlight).addClass('highlight')
}

//
function onSnapEnd () {
    board.position(game.fen())
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
    if (data.command == "join") {

        console.log("Joining room as " + data.orientation)

        // Carga la configuración del tablero
        var config = {
            draggable: true,
            pieceTheme: piece_theme,
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

        // Permite que el tablero sea responsive
        $(window).resize(board.resize)

        // Carga el PGN si existiera
        if(data.pgn){
            game.load_pgn(data.pgn)
        }

        // Carga el tablero y actualiza el estado de la partida
        board.position(game.fen());
        updateStatus();

        // Si el oponente no está conectado, espera
        if (data.opponent_online != true) {

            // Distinto modal en función de si la partida es privada o pública
            if (private == "True") {
                $('#privateModal_title').html("Partida privada creada")
                $('#privateModal_body').html("<p>Jugarás contra el primer oponente que se conecte al siguiente enlace:</p>" +
                "<div class='game-link' id='game_link'>" + window.location.href + "</div>")
                $('#privateModal').modal({
                    backdrop: 'static',
                    keyboard: false
                })
            }
            else {
                $("#connectionModal_title").html("Oponente desconectado")
                $('#connectionModal_body').html("Por favor espera a que tu oponente se conecte a la partida...")
                $('#connectionModal').modal({
                    backdrop: 'static',
                    keyboard: false
                })
            }

            opponent_online = false
        }
    }

    // Si el oponente está conectado, permite jugar haciendo desaparecer el modal
    else if (data.command == "opponent-online"){
        $('#connectionModal').modal('hide')
        $('#connectionModal').data('bs.modal', null)
        $("#opponent_name").load(location.href + " #opponent_name")
        opponent_online = true
    }

    // Si el oponente se desconecta
    else if (data.command == "opponent-offline"){

        // Si la partida ha acabado, desactiva la funcionalidad
        if (game.game_over() || game_over) return false

        opponent_online = false

        // Activa el modal
        $('#disconnectionModal_title').html("Tu oponente ha abandonado la sala")
        $('#disconnectionModal_body').html("<p>Esperando a que regrese...<div id='countdown'></div></p>" +
        "<p>Si no lo hace, la partida contará como una victoria.</p>")
        $('#disconnectionModal').modal({
            backdrop: 'static',
            keyboard: false
        })

        var time = 10
        var time_remaining = time
        var countdown = null
        
        // Para actualizar el contador
        function updateCountdown() {
            $("#countdown").html(time_remaining)
        }

        // Realiza la cuenta atrás
        countdown = setInterval( function() {

            updateCountdown(time_remaining);
            time_remaining--

            // Si el oponente se reconecta, permite jugar de nuevo
            if(opponent_online == true) {
                clearInterval(countdown)
                $('#disconnectionModal').modal('hide')
                $('#disconnectionModal').data('bs.modal', null)
            }

            if(time_remaining < 0) {
                
                // Detiene la cuenta atrás y quita el modal
                clearInterval(countdown)
                $('#disconnectionModal').modal('hide')
                $('#disconnectionModal').data('bs.modal', null)

                var status = ""

                if(orientation === 'white') {
                    socket.send(JSON.stringify({"command": "resign", "winner": "Blancas", "details": "Abandono de negras"}))
                    status = "Fin de la partida, abandono de negras"
                }
                else {
                    socket.send(JSON.stringify({"command": "resign", "winner": "Negras", "details": "Abandono de blancas"}))
                    status = "Fin de la partida, abandono de blancas"
                }

                game_over = true
                $status.html(status)

                $('#statusModal_title').html("Victoria")
                $('#statusModal_body').html("Tu oponente ha abandonado la sala. ¡Has ganado!")
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

        // Se destaca el movimiento realizado
        removeHighlights()
        $board.find('.square-' + data.source).addClass('highlight')
        $board.find('.square-' + data.target).addClass('highlight')
        
        // Se actualiza el estado de la partida
        updateStatus();

        reproSon("ficha.wav");
    }

    // Si se acaba la partida
    else if (data.command == "gameisover") {

        if ((orientation === "white" && data.winner == "Blancas") || (orientation === "black" && data.winner == "Negras")) {
            $('#statusModal_title').html("Victoria")
            $('#statusModal_body').html("Has hecho jaque mate a tu oponente. ¡Has ganado!")
        }
        else {
            $('#statusModal_title').html("Derrota");
            $('#statusModal_body').html("Tu oponente te ha hecho jaque mate. ¡Has perdido!");
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

        $('#statusModal_title').html("Tablas")
        $('#statusModal_body').html("Tu oponente ha aceptado tu oferta de tablas. ¡Habéis empatado!")
        $('#statusModal').modal({
            backdrop: 'static',
            keyboard: false
        })
    }

    // Si el oponente rechaza las tablas esconde el modal de espera y continúa la partida
    else if (data.command == "opponent-reject-draw") {

        $('#drawWaitModal').modal('hide')
        $('#drawWaitModal').data('bs.modal', null)

        $('#statusModal_title').html("Tablas rechazadas")
        $('#statusModal_body').html("Tu oponente ha rechazado tu oferta de tablas. La partida continúa.")
        $("#statusModal").modal()
    }

    // Si el oponente abandona, la partida se acaba
    else if (data.command == "opponent-resigned") {

        var status = ""

        if (data.winner == "Blancas") {
            status = "Fin de la partida, abandono de negras"
        }
        else if (data.winner == "Negras") {
            status = "Fin de la partida, abandono de blancas"
        }

        game_over = true
        $status.html(status)

        $('#statusModal_title').html("Victoria")
        $('#statusModal_body').html("Tu oponente ha abandonado la sala. ¡Has ganado!")
        $('#statusModal').modal({
            backdrop: 'static',
            keyboard: false
        })
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////




// ------------ BLOQUE DE FUNCIONES PARA LOS BOTONES QUE SE MUESTRAN EN LA INTERFAZ ------------- //

// Copia el link de la partida privada al portapapeles
$('#copy_link').on('click', function() {

    reproSon("boton.mp3")

    // Selecciona el contenido y lo copia
    if (document.selection) {
        var range = document.body.createTextRange()
        range.moveToElementText(document.getElementById('game_link'))
        range.select().createTextRange()
        document.execCommand("copy")
    } else if (window.getSelection) {
        var range = document.createRange()
        range.selectNode(document.getElementById('game_link'))
        window.getSelection().addRange(range)
        document.execCommand("copy")
    }

    // Proporciona feedback
    $('#copy_link').html('<i class="fas fa-check" style="color: #ffffff;"></i>')
})

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

    $('#statusModal_title').html("Tablas")
    $('#statusModal_body').html("Has aceptado la oferta de tablas de tu oponente. ¡Habéis empatado!")
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
        socket.send(JSON.stringify({"command": "resign", "winner": "Negras", "details": "Abandono de blancas"}))
        status = "Fin de la partida, abandono de blancas"
    }
    else {
        socket.send(JSON.stringify({"command": "resign", "winner": "Blancas", "details": "Abandono de negras"}))
        status = "Fin de la partida, abandono de negras"
    }

    game_over = true
    $status.html(status)

    $('#statusModal_title').html("Derrota")
    $('#statusModal_body').html("Has abandonado la partida. ¡Has perdido!")
    $('#statusModal').modal({
        backdrop: "static",
        keyboard: false
    })
})

// Activa el botón de regreso al lobby si se acaba la partida
$('#status_accept').on('click', function() {
    if (game.game_over() || game_over) {
        $('#multiplayer-options').html('<button class="btn game-btn" id="return">Volver al lobby</button>')
    }
})

// Volver al lobby
$('#return').on('click', function() {
    var path = window.location.protocol + "//" + window.location.host + "/play/online"
    window.location.href = path
})


////////////////////////////////////////////////////////////////////////////////////////////////////