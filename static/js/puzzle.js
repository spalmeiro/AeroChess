/* 
    CÓDIGO NECESARIO PARA EL FUNCIONAMIENTO DE LOS PUZZLES
*/




// ---------------------------------- DECLARACIÓN DE VARIABLES ---------------------------------- //


// Variables del tablero y del estado de la partida
var $board = $('#puzzleBoard')
var game = new Chess()
var game2 = new Chess()
var $status = $('#status') // Estado de la partida
var $fen = $('#fen')
var $pgn = $('#pgn')
var squareToHighlight = null // Se usa para destacar el último movimiento
var orientation = null


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

// Marca la casilla de la pieza seleccionada para mover
function showStart (square) {
    var $square = $('#puzzleBoard .square-' + square)
    $square.addClass("showStart")
}

// Marca las casillas disponibles para mover sin capturar
function showMoves (square) {
    var $square = $('#puzzleBoard .square-' + square)
    $square.addClass("showMoves")
}

// Marca las casillas disponibles para mover capturando
function showCapture (square) {
    var $square = $('#puzzleBoard .square-' + square)
    $square.addClass("showCapture")
}

// Desmarca la casilla de la pieza seleccionada para mover
function removeshowStart () {
    $('#puzzleBoard .square-55d63').removeClass('showStart')
}

// Desmarca las casillas disponibles para mover sin capturar
function removeshowMoves () {
    $('#puzzleBoard .square-55d63').removeClass('showMoves')
}

// Desmarca las casillas disponibles para mover capturando
function removeshowCapture () {
    $('#puzzleBoard .square-55d63').removeClass('showCapture')
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
    $pgn.html(new_pgn)
}

// Controla cuándo y qué piezas se pueden seleccionar para mover
function onDragStart (source, piece, position, orientation) {
    
    // Evita que se puedan mover fichas en una partida acabada
    if (game.game_over()) return false

    // Controla que sólo se puedan seleccionar las piezas del lado al que le toca mover
    if ((orientation === 'white' && piece.search(/^w/) === -1) || (orientation === 'black' && piece.search(/^b/) === -1)) return false
}

// Controla qué ocurre cuando soltamos una pieza
p=0; j=0;
function onDrop (source, target) {

    // Comprueba si el movimiento es legal
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    })

    // Hace que la pieza vuelva a su posición original si el movimiento no está permitido
    if (move === null) return 'snapback'

    reproSon("ficha.wav");

    if (game.fen()==fen_to_compare[j]) {}
    else{
        game.undo();
        reproSon("burla.mp3")
        // Actualiza el estado del tablero
        board.position(game.fen());
        // Actualiza el estado de la partida
        updateStatus();
        return
    }

    j=j+1

    if (game.turn() === 'w') {
        p=p+1
    }

    setTimeout(movsolution, 1000, 0);
    
    // Se desmarcan los indicadores de posibles movimientos
    removeshowStart()
    removeshowMoves()
    removeshowCapture()

    // Se destaca el movimiento realizado
    removeHighlights()
    $board.find('.square-' + source).addClass('highlight')
    $board.find('.square-' + target).addClass('highlight')

    // Se actualizan los datos
    updateStatus();
}

// Función que controla qué ocurre cuando se acaba un movimiento (en concreto lo destaca)
function onMoveEnd () {
    
    // Se desmarcan los indicadores de posibles movimientos
    removeshowStart()
    removeshowMoves()
    removeshowCapture()

    // Se destaca el movimiento realizado
    $board.find('.square-' + squareToHighlight).addClass('highlight')
}

//
function onSnapEnd () {
    board.position(game.fen())
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
    pieceTheme: piece_theme,
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




// --------------------- BLOQUE DE FUNCIONES PARA LA RESOLUCIÓN DEL PUZZLE ---------------------- //


function dividirCadena(cadenaADividir,separador) {
    Solucion = cadenaADividir.split(separador);
}

function movsolution(z){
    k = 1
    i = 2
    dividirCadena(puzzle_pgn," ")
    
    if (game.in_checkmate()) {
        return
    }
    else if (game.turn() === 'b') {
        n = i + 3*p
        p = p + 1
    }
    else {
        n = k + 3*p
    }
    
    j = j + z

    game.move(Solucion[n], {sloppy: true })
    board.position(game.fen());

    updateStatus();
}

// Movimiento valido
var fen_to_compare = [];
function arrayfen(){
    
    n=0

    dividirCadena(puzzle_pgn," ")
    
    if (game2.turn() === 'b') {
        i = 2
    }
    else {
        i = 1
    }

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
 



// ------------ BLOQUE DE FUNCIONES PARA LOS BOTONES QUE SE MUESTRAN EN LA INTERFAZ ------------- //


// Mostrar solución
$('#showSolution').on('click', function() {
    movsolution(0.5)
});

// Puzzle anterior
$('#previous_puzzle').on('click', function() {
    puzzle_pk = parseInt(puzzle_pk) - 1
    if (puzzle_pk == 0) puzzle_pk = 1169
    var path = window.location.protocol + "//" + window.location.host + "/puzzles/" + puzzle_pk
    window.location.href = path
})

// Puzzle aleatorio
$('#random_puzzle').on('click', function() {
    puzzle_pk = Math.floor(Math.random() * (1170 - 1)) + 1
    var path = window.location.protocol + "//" + window.location.host + "/puzzles/" + puzzle_pk
    window.location.href = path
})

// Siguiente puzzle
$('#next_puzzle').on('click', function() {
    puzzle_pk = parseInt(puzzle_pk) + 1
    if (puzzle_pk == 1170) puzzle_pk = 1
    var path = window.location.protocol + "//" + window.location.host + "/puzzles/" + puzzle_pk
    window.location.href = path
})

// Volver al lobby
$('#return').on('click', function() {
    var path = window.location.protocol + "//" + window.location.host + "/puzzles/list"
    window.location.href = path
})


////////////////////////////////////////////////////////////////////////////////////////////////////