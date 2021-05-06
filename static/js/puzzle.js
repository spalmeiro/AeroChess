/* 
    CÓDIGO NECESARIO PARA EL FUNCIONAMIENTO DE LA PÁGINA DE JUEGO CONTRA EL ORDENADOR
*/




//----------------------------------- DECLARACIÓN DE VARIABLES -----------------------------------//


// Variables del tablero y del estado de la partida
var $board = $('#puzzleBoard')
var game = new Chess()
var game2 = new Chess()
var $status = $('#status') // Estado de la partida
var $fen = $('#fen') // FEN
var $pgn = $('#pgn') // PGN
var $score = $('#score')
var $time = $('#time')
var $nodes = $('#nodes')
var $knps = $('#knps')
var squareClass = 'square-55d63' // Se usa para destacar el último movimiento
var squareToHighlight = null // Se usa para destacar el último movimiento
var whiteSquareGrey = '#a9a9a9' // Determina el color con el que se destaca una casilla blanca
var blackSquareGrey = '#696969' // Determina el color con el que se destaca una casilla negra
var orientation = null


////////////////////////////////////////////////////////////////////////////////////////////////////




//-------------- BLOQUE DE FUNCIONES PARA EL FUNCIONAMIENTO DEL TABLERO Y EL JUEGO ---------------//
    

// Función que reproduce los sonidos que se le pasan como argumento
function reproSon (name) {
    var audio = new Audio('/static/sounds/' + name);
    audio.play();
}

// Función que marca las casillas disponibles para mover
function greySquare (square) {
    var $square = $('#puzzleBoard .square-' + square)
    
    var background = whiteSquareGrey
    if ($square.hasClass('black-3c85d')) {
        background = blackSquareGrey
    }
    
    $square.css('background', background)
}

// Función que desmarca las casillas disponibles para mover
function removeGreySquares () {
    $('#puzzleBoard .square-55d63').css('background', '')
}

// Función que marca los posibles movimientos cuando el ratón se sitúa sobre una pieza
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

// Función que desmarca el último movimiento realizado
function removeHighlights () {
    $board.find('.' + squareClass).removeClass('highlight')
}

// Función que controla cuándo y qué piezas se pueden seleccionar para mover
function onDragStart (source, piece, position, orientation) {
    
    // Evita que se puedan mover fichas en una partida acabada
    if (game.game_over()) return false

    // Controla que sólo se puedan seleccionar las piezas del lado al que le toca mover
    if ((orientation === 'white' && piece.search(/^w/) === -1) || (orientation === 'black' && piece.search(/^b/) === -1)) return false
}
p=0
j=0
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

   if (game.fen()==fen_to_compare[j]){}
   else{
    game.undo();
    // Actualiza el estado del tablero
    board.position(game.fen());
    // Actualiza el estado de la partida
    updateStatus();
return
   }
 j=j+1
p=p+1
    // Al soltar la pieza se activa la función que genera la respuesta del motor de ajedrez
    movsolution()

    // Se destaca el movimiento realizado
    removeHighlights()
    $board.find('.square-' + source).addClass('highlight')
    $board.find('.square-' + target).addClass('highlight')

    // Se actualizan los datos
    updateStatus();
}

// Función que controla qué ocurre cuando se acaba un movmiento (en concreto lo destaca)
function onMoveEnd () {
    $board.find('.square-' + squareToHighlight).addClass('highlight')
}

//
function onSnapEnd () {
    board.position(game.fen())
}

// Elimina el header del pgn
function remove_pgn_header(pgn) {

    return pgn.split("<br />").slice(3,100).join("<br />")
} 

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
        status = 'Fin de la partida, ' + moveColor + ' hacen jaque mate.'
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
    $pgn.html(new_pgn)
}

// Carga el FEN del puzzle
game.load(puzzle_fen)
game2.load(puzzle_fen)

// Determina el lado del jugador
if (game.turn() === 'b') {
    orientation = "black"
}
else if (game.turn() === 'w') {
    orientation = "white"
}

// Configuración del tablero
var config = {
    draggable: true,
    pieceTheme: style,
    position: puzzle_fen,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onMoveEnd: onMoveEnd,
    onSnapEnd: onSnapEnd,
    orientation: orientation
}

// Crea la instancia del tablero
board = Chessboard('puzzleBoard', config)
$(window).resize(board.resize)

// Actualiza el estado de la partida
updateStatus();


////////////////////////////////////////////////////////////////////////////////////////////////////




//---------------------- BLOQUE DE FUNCIONES PARA LA RESOLUCIÓN DEL PUZZLE -----------------------//





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
        url: '/puzzles/make_move',
        type: "POST",
        data: {
            'fen': game.fen(),
            'move_time': 1000,
            'Nivel': 20,
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

            current_progress=($score.text()/20)+50
            $("#dynamic")
            .css("width", current_progress + "%")
            //.attr("aria-valuenow", current_progress)
            .text((current_progress) + "% Probabilidad de victoria");                    

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

function dividirCadena(cadenaADividir,separador) {
    Solucion = cadenaADividir.split(separador);
 }

////////////////////////////////////////////////////////////////////////////////////////////////////




//------------- BLOQUE DE FUNCIONES PARA LOS BOTONES QUE SE MUESTRAN EN LA INTERFAZ --------------//

// Mostrar solución

$('#showSolution').on('click', function() {
movsolution()
});

function movsolution(){

    k=1
    i=2
    dividirCadena(puzzle_pgn," ")
    
     
    if (game.turn() === 'b') {
        n=i+3*p
        p=p+1
    }
    
    
     else{
           
        n=k+3*p
    
    }
    
    
        game.move(Solucion[n], {sloppy: true })
        board.position(game.fen());
    
         updateStatus();



}

// Moviemiento valido
var fen_to_compare = [];
function arrayfen(){
    
    n=0


    dividirCadena(puzzle_pgn," ")
    
 
 
        if (game2.turn() === 'b') { i=2}
        
        
         else{i=1}


         while (n < 8) {
            
            x=n*3+i;
         
        game2.move(Solucion[x], {sloppy: true })
        fen_to_compare[n]=game2.fen()
        x=x+i
        game2.move(Solucion[x], {sloppy: true })
        n++;
    } 
}

window.onload = arrayfen
////////////////////////////////////////////////////////////////////////////////////////////////////