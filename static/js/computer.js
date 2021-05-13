/* 
    CÓDIGO NECESARIO PARA EL FUNCIONAMIENTO DE LA PÁGINA DE JUEGO CONTRA EL ORDENADOR
*/




//----------------------------------- DECLARACIÓN DE VARIABLES -----------------------------------//


// Variables del tablero y del estado de la partida
var $board = $('#computerBoard')
var game = new Chess()
var $status = $('#status') // Estado de la partida
var $fen = $('#fen') // FEN
var $pgn = $('#pgn') // PGN
var $score = $('#score')
var $time = $('#time')
var $nodes = $('#nodes')
var $knps = $('#knps')
var squareClass = 'square-55d63' // Se usa para destacar el último movimiento
var squareToHighlight = null // Se usa para destacar el último movimiento
var micolor=CSS['black']
var whiteSquareGrey = '#a9a9a9' // Determina el color con el que se destaca una casilla blanca
var blackSquareGrey = '#696969' // Determina el color con el que se destaca una casilla negra
var orientation = "white" // Siempre se entra jugando con blancas


////////////////////////////////////////////////////////////////////////////////////////////////////




//-------------- BLOQUE DE FUNCIONES PARA EL FUNCIONAMIENTO DEL TABLERO Y EL JUEGO ---------------//
$("#board_theme").on('change',  function () {
    // Tablero predeterminado
    if (this.selectedIndex == 0) {
        micolor = 'boardtheme1black';
      
    } 
    // Tablero verde
    else if (this.selectedIndex == 1) {
        micolor = 'boardtheme2black';
        
    }
    // Tablero azul
    else if (this.selectedIndex == 2) {
        micolor = 'boardtheme3black';
        
    }

    else if (this.selectedIndex == 3) {
        micolor= 'boardtheme4black';
        
    }

    else if (this.selectedIndex == 4) {
        micolor = 'boardtheme5black';
        
    }

}); 

// Reproduce los sonidos que se le pasan como argumento
function reproSon (name) {
    var audio = new Audio('/static/sounds/' + name);
    audio.play();
}

// Marca las casillas disponibles para mover
function greySquare (square,Codecolor) {
    var $square = $('#computerBoard .square-' + square)
    
    var background = whiteSquareGrey
    if ($square.hasClass(Codecolor)) {
        background = blackSquareGrey
    }
    
    $square.css('background', background)
}

// Desmarca las casillas disponibles para mover
function removeGreySquares () {
    $('#computerBoard .square-55d63').css('background', '')
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
    greySquare(square,micolor)
    
    // Destaca las casillas donde se puede mover la pieza
    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to,micolor)
    }
}

// Desmarca los posibles movimientos cuando el ratón ya no está situado sobre esa pieza
function onMouseoutSquare (square, piece) {
    removeGreySquares()
}

// Desmarca el último movimiento realizado
function removeHighlights () {
    $board.find('.' + squareClass).removeClass('highlight')
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
        promotion: 'q' // siempre promociona a reina ¿podríamos hacer algo para elegir la pieza?
    })

    // Hace que la pieza vuelva a su posición original si el movimiento no está permitido
    if (move === null) return 'snapback'

    reproSon("ficha.wav");

    // Al soltar la pieza se activa la función que genera la respuesta del motor de ajedrez
    make_move();

    // Se destaca el movimiento realizado
    removeHighlights()
    $board.find('.square-' + source).addClass('highlight')
    $board.find('.square-' + target).addClass('highlight')

    // Se actualizan los datos
    updateStatus();
}

// Cntrola qué ocurre cuando se acaba un movmiento (en concreto lo destaca)
function onMoveEnd () {
    $board.find('.square-' + squareToHighlight).addClass('highlight')
}

//
function onSnapEnd () {
    board.position(game.fen())
}

function marcador(x) {
        
    if (x>1000)
            puntuacion=1000
            
        else if(x<-1000)
            puntuacion=-1000
        
        else if(isNaN(x))

        return

        else
            puntuacion=x


        current_progress=(puntuacion/20)+50

        $("#dynamic")
        .css("width", current_progress + "%")
        //.attr("aria-valuenow", current_progress)
        .text((current_progress) + "% Victoria de Blancas" );          

        current_progress2=(100-current_progress)

        $("#dynamic2")
        .css("width", current_progress2 + "%")
        //.attr("aria-valuenow", current_progress)
        .text((current_progress2) + "% Victoria de Negras");   
    
}


// Actualiza los datos sobre el estado de la partida
function updateStatus () {

    var status = ''
    var moveColor = 'blancas'
    var moveColor2 = 'negras'
    // Comprueba si mueven las negras
    if (game.turn() === 'b') {
        moveColor = 'negras'
        moveColor2 = 'blancas'
    }

    // Comprueba si hay jaque mate
    if (game.in_checkmate()) {
        reproSon('mate.mp3')
        status = 'Fin de la partida, ' + moveColor2 + ' hacen jaque mate.'
        if (game.turn() === 'b') {
             marcador(1000)
        }
        else{
            marcador(-1000)
        }
        
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
    $pgn.html(game.pgn({ max_width: 5, newline_char: "<br />"}))
}

// Configuración del tablero
var config = {
    draggable: true,
    pieceTheme: style,
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
$(window).resize(board.resize)

// Actualiza el estado de la partida
updateStatus();


////////////////////////////////////////////////////////////////////////////////////////////////////




//------------- BLOQUE DE FUNCIONES PARA LA COMUNICACIÓN CON STOCKFISH MEDIANTE AJAX -------------//


// Garantiza que se cumplen los protocolos de seguridad de CRFS
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
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
function make_move() {

    $.ajax({
        url: '/play/computer/make_move',
        type: "POST",
        data: {
            'fen': game.fen(),
            'move_time': $('#move_time option:selected').val(),
            'Nivel': $('#Nivel option:selected').val(),
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
            $knps.text(data.time)

            marcador(data.score)


            reproSon("ficha.wav");

            // Actualiza el estado de la partida
            updateStatus();

            console.log(data)
        },
        error: function (error) {
            console.log(error);
        }
    });
}


////////////////////////////////////////////////////////////////////////////////////////////////////




//------------- BLOQUE DE FUNCIONES PARA LOS BOTONES QUE SE MUESTRAN EN LA INTERFAZ --------------//


// Reiniciar la partida
$('#new_game').on('click', function() {
    // Reinicia el estado del tablero
    game.reset();
    reproSon("click2.wav");
    // Establece la posición de inicio
    board.position('start');
    marcador(0)
});

// Hacer un movimiento
$('#make_move').on('click', function() {
    // Pide que el movimiento lo haga el ordenador
    reproSon("click2.wav");
    make_move();
});

// Deshacer movimientos
$('#take_back').on('click', function() { 
    // Retrocede un movimiento
    game.undo();
    game.undo();
    // Actualiza el estado del tablero
    board.position(game.fen());
    reproSon("click2.wav");
    // Actualiza el estado de la partida
    updateStatus();
});

// Rota el tablero
$('#flip_board').on('click', function() {

    board.flip();

    if (orientation === "white") {
        orientation = "black"
    }
    else if (orientation === "black") {
        orientation = "white"
    }

    reproSon("boton.mp3");
});

// Introducir un FEN determinado
$('#set_fen').on('click', function() {
    reproSon("click.wav");
    // FEN válido
    if (game.load($('#fen').val()))
    // Carga el FEN en el tablero
    board.position(game.fen());
    // FEN no válido
    else
    alert('¡Este FEN no es válido!');
    // Actualiza el estado de la partida
    updateStatus();
});


////////////////////////////////////////////////////////////////////////////////////////////////////