/* 
    CÓDIGO NECESARIO PARA EL FUNCIONAMIENTO DEL MODO CONTRA EL ORDENADOR
*/




// ---------------------------------- DECLARACIÓN DE VARIABLES ---------------------------------- //


// Variables del tablero y del estado de la partida
var $board = $('#computerBoard')
var game = new Chess()
var $status = $('#status') // Estado de la partida
var $fen = $('#fen')
var $pgn = $('#pgn')
var $score = $('#score')
var $time = $('#time')
var $nodes = $('#nodes')
var $knps = $('#knps')
var squareToHighlight = null // Se usa para destacar el último movimiento realizado
var orientation = "white" // Siempre se entra jugando con blancas


////////////////////////////////////////////////////////////////////////////////////////////////////




// ------------- BLOQUE DE FUNCIONES PARA EL FUNCIONAMIENTO DEL TABLERO Y EL JUEGO -------------- //
    

// Reproduce los sonidos que se le pasan como argumento
function reproSon (name) {
    var audio = new Audio('/static/sounds/' + name);
    audio.play();
}

// Marca la casilla de la pieza seleccionada para mover
function showStart (square) {
    var $square = $('#computerBoard .square-' + square)
    $square.addClass("showStart")
}

// Marca las casillas disponibles para mover sin capturar
function showMoves (square) {
    var $square = $('#computerBoard .square-' + square)
    $square.addClass("showMoves")
}

// Marca las casillas disponibles para mover capturando
function showCapture (square) {
    var $square = $('#computerBoard .square-' + square)
    $square.addClass("showCapture")
}

// Desmarca la casilla de la pieza seleccionada para mover
function removeshowStart () {
    $('#computerBoard .square-55d63').removeClass('showStart')
}

// Desmarca las casillas disponibles para mover sin capturar
function removeshowMoves () {
    $('#computerBoard .square-55d63').removeClass('showMoves')
}

// Desmarca las casillas disponibles para mover capturando
function removeshowCapture () {
    $('#computerBoard .square-55d63').removeClass('showCapture')
}

// Marca los posibles movimientos cuando el ratón se sitúa sobre una pieza
function onMouseoverSquare (square, piece) {

    // Evita que se marquen movimientos en una partida acabada
    if (game.game_over()) return false

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

// Elimina el header del pgn
function remove_pgn_header(pgn) {
    return pgn.split("<br />").slice(3,100).join("<br />")
} 

// Actualiza los datos sobre el estado de la partida
function updateStatus () {

    var status = ''
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
        status = 'Fin de la partida, tablas'
    }

    // Comprueba si hay tablas por ahogado
    else if (game.in_stalemate()) {
        status = 'Fin de la partida, tablas por ahogado'
    }

    // Comprueba si hay tablas por repetición
    else if (game.in_threefold_repetition()) {
        status = 'Fin de la partida, tablas por repetición'
    }

    // Si no se cumple lo anterior, la partida continúa
    else {

        status = 'Turno de ' + moveColor

        // Comprueba si hay jaque
        if (game.in_check()) {
            status += ', ' + moveColor + ' en jaque'
        }
    }

    // Se actualiza el estado de la partida, el FEN y el PGN
    $status.html(status)
    $fen.val(game.fen())
    new_pgn = remove_pgn_header(game.pgn({ max_width: 5, newline_char: "<br />"}))
    // $pgn.html(new_pgn)
    $pgn.html(game.pgn({ max_width: 5, newline_char: "<br />"}))
}

// Controla cuándo y qué piezas se pueden seleccionar para mover
function onDragStart (source, piece, position, orientation) {
    
    // Evita que se puedan mover fichas en una partida acabada
    if (game.game_over()) return false

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

    // Reproduce el sonido
    reproSon("ficha.wav");

    // Al soltar la pieza se activa la función que genera la respuesta del motor de ajedrez
    make_move();
}

// Controla qué ocurre cuando se acaba un movimiento (en concreto lo destaca)
function onMoveEnd () {
    $board.find('.square-' + squareToHighlight).addClass('highlight')
}

//
function onSnapEnd () {
    board.position(game.fen())
}

// Actualiza la barra de estado de la partida
function status_bar(x) {
        
    if (x>1000) {
        points=1000
    }            
    else if(x<-1000) {
        points=-1000
    } 
    else if(isNaN(x)) {
        return
    }
    else {
        points=x
    }

    current_progress=(points/20)+50

    $("#white-progress").css("height", current_progress + "%");    
}

// Configuración del tablero
var config = {
    draggable: true,
    pieceTheme: piece_theme,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onMoveEnd: onMoveEnd,
    onSnapEnd: onSnapEnd
}

// Crea la instancia del tablero
board = Chessboard('computerBoard', config)

// Permite que el tablero sea responsive
$(window).resize(board.resize)

// Actualiza el estado de la partida
updateStatus();


////////////////////////////////////////////////////////////////////////////////////////////////////




// ------------ BLOQUE DE FUNCIONES PARA LA COMUNICACIÓN CON STOCKFISH MEDIANTE AJAX ------------ //


// Garantiza que se cumplen los protocolos de seguridad de CRFS
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// Envia información sobre la partida al servidor y devuelve el mejor movimiento calculado por Stockfish
r = 1
var scores = [];
scores[0] = 0

function make_move() {

    // Se envian los datos mediante AJAX
    $.ajax({
        url: '/play/computer/make_move',
        type: "POST",
        data: {
            'fen': game.fen(),
            'move_time': $('#move_time option:selected').val(),
            'level': $('#level option:selected').val(),
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        },
        success: function (data) {

            // Carga el nuevo FEN en el tablero
            game.move(data.best_move, { sloppy: true })

            // Actualiza el tablero
            board.position(game.fen());

            estoy=data.best_move.substring(0,2);
            voy=data.best_move.substring(2,4);

            removeHighlights()
            $board.find('.square-' + estoy).addClass('highlight');
            $board.find('.square-' + voy).addClass('highlight')
            squareToHighlight = data.best_move;

            // Actualiza la información sobre la partida
            $score.text(data.score);
            $time.text(data.time);
            $nodes.text(data.nodes);
            $knps.text(data.time);

            // Actualiza la barra de estado de la partida
            status_bar(data.score);                
            scores[r]=data.score;
            r=r+1;

            // Actualiza el estado de la partida
            updateStatus();
            
            // Reproduce el sonido
            reproSon("ficha.wav");

            console.log(data)
        },
        error: function (error) {
            console.log(error);
        }
    });
}


////////////////////////////////////////////////////////////////////////////////////////////////////




// ------------ BLOQUE DE FUNCIONES PARA LOS BOTONES QUE SE MUESTRAN EN LA INTERFAZ ------------- //


// Reiniciar la partida
$('#new_game').on('click', function() {

    // Reproduce el sonido
    reproSon("boton.mp3")

    // Reinicia el estado del tablero
    game.reset()

    // Establece la posición de inicio
    board.position('start')

    // Actualiza el estado de la partida y de la barra
    status_bar(0)
    updateStatus()
})

// Rota el tablero
$('#flip_board').on('click', function() {

    // Reproduce el sonido
    reproSon("boton.mp3")

    // Rota el tablero
    board.flip();

    // Actualiza la orientación
    if (orientation === "white") {
        orientation = "black"
    }
    else if (orientation === "black") {
        orientation = "white"
    }
});

// Hacer un movimiento
$('#make_move').on('click', function() {

    // Reproduce el sonido
    reproSon("click2.wav")

    // Pide que el movimiento lo haga el ordenador
    make_move()
})

// Deshacer movimientos
$('#take_back').on('click', function() {

    // Reproduce el sonido
    reproSon("click2.wav")

    // Retrocede un movimiento
    game.undo()
    game.undo()

    // Actualiza el estado del tablero
    board.position(game.fen())

    // Actualiza el estado de la partida y de la barra
    r=r-2
    status_bar(scores[r])
    updateStatus()
})

// Introduce un FEN determinado
$('#set_fen').on('click', function() {

    // Reproduce el sonido
    reproSon("click.wav")

    // Si el FEN es válido lo carga
    if (game.load($('#fen').val())) {
        board.position(game.fen())
    }
    // Si no es válido avisa
    else
        alert('¡Este FEN no es válido!')

    // Actualiza el estado de la partida
    updateStatus();
})


////////////////////////////////////////////////////////////////////////////////////////////////////