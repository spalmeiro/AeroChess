/* 
    CÓDIGO NECESARIO PARA EL FUNCIONAMIENTO DE LA PÁGINA PRINCIPAL
*/

// Declaración de variables para cada tablero
var posicion1 = 'rnbq1bnr/pppk1ppp/4Q3/3p4/4P3/8/PPPP1PPP/RNB1KBNR b KQ - 2 4'
var posicion2 = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3'
var posicion3 = 'r1k4r/p2nb1p1/2b4p/1p1n1p2/2PP4/3Q1NB1/1P3PPP/R5K1 w Qkq - 0 1'
var posicion4 = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
var posicion5 = '4k3/8/8/8/8/8/PPPPPPPP/RNBQKBNR w KQ - 0 1'
var posicion6 = 'r1bqkb1r/p1pppp1p/2n2n2/1p4p1/1P4P1/2N2N2/P1PPPP1P/R1BQKB1R w KQkq - 2 5'

var game1 = new Chess(posicion1)
var game2 = new Chess(posicion2)
var game3 = new Chess(posicion3)
var game4 = new Chess(posicion4)
var game5 = new Chess(posicion5)
var game6 = new Chess(posicion6)

// Funciones de movimiento aleatorio para cada tablero
function makeRandomMove1() {
    var possibleMoves1 = game1.moves()
    if (game1.game_over()) return
    var randomIdx = Math.floor(Math.random() * possibleMoves1.length)
    game1.move(possibleMoves1[randomIdx])
    board1.position(game1.fen())
}

function makeRandomMove2() {
    var possibleMoves2 = game2.moves()
    if (game2.game_over()) return
    var randomIdx = Math.floor(Math.random() * possibleMoves2.length)
    game2.move(possibleMoves2[randomIdx])
    board2.position(game2.fen())
} 

function makeRandomMove3() {
    var possibleMoves3 = game3.moves()
    if (game3.game_over()) return
    var randomIdx = Math.floor(Math.random() * possibleMoves3.length)
    game3.move(possibleMoves3[randomIdx])
    board3.position(game3.fen())
}

function makeRandomMove4() {
    var possibleMoves4 = game4.moves()
    if (game4.game_over()) return
    var randomIdx = Math.floor(Math.random() * possibleMoves4.length)
    game4.move(possibleMoves4[randomIdx])
    board4.position(game4.fen())
}

function makeRandomMove5() {
    var possibleMoves5 = game5.moves()
    if (game5.game_over()) return
    var randomIdx = Math.floor(Math.random() * possibleMoves5.length)
    game5.move(possibleMoves5[randomIdx])
    board5.position(game5.fen())
}

function makeRandomMove6() {
    var possibleMoves6 = game6.moves()
    if (game6.game_over()) return
    var randomIdx = Math.floor(Math.random() * possibleMoves6.length)
    game6.move(possibleMoves6[randomIdx])
    board6.position(game6.fen())
}

// Funciones de partida para cada tablero
function partida1() { 
    tiempo1 =Math.round(Math.random() * (8000 - 5000) + 5000)
    window.setTimeout(partida1,tiempo1+100)
    window.setTimeout(makeRandomMove1, tiempo1)
}

function partida2() {   
    tiempo2 = Math.round(Math.random() * (5000 - 2000) + 2000)
    window.setTimeout(partida2,tiempo2+100)
    window.setTimeout(makeRandomMove2, tiempo2)
}

function partida3() { 
    tiempo3 = Math.round(Math.random() * (15000 - 8000) + 8000)
    window.setTimeout(partida3,tiempo3+100)
    window.setTimeout(makeRandomMove3, tiempo3)
}

function partida4() { 
    tiempo4 =Math.round(Math.random() * (9000 - 4000) + 3000)
    window.setTimeout(partida4,tiempo4+100)
    window.setTimeout(makeRandomMove4, tiempo4)
}

function partida5() { 
    tiempo5 =Math.round(Math.random() * (10000 - 3000) + 1000)
    window.setTimeout(partida5,tiempo5+100)
    window.setTimeout(makeRandomMove5, tiempo5)
}

function partida6() { 
    tiempo6 =Math.round(Math.random() * (8000 - 2000) + 4000)
    window.setTimeout(partida6,tiempo6+100)
    window.setTimeout(makeRandomMove6, tiempo6)
}

// Se crean las instancias de los tableros
board1 = Chessboard('tablero1', posicion1)
board2 = Chessboard('tablero2', posicion2)
board3 = Chessboard('tablero3', posicion3)
board4 = Chessboard('tablero4', posicion4)
board5 = Chessboard('tablero5', posicion5)
board6 = Chessboard('tablero6', posicion6)

//
window.setTimeout(partida1, 500)
window.setTimeout(partida2, 2000)
window.setTimeout(partida3, 1000)
window.setTimeout(partida4, 750)
window.setTimeout(partida5, 3000)
window.setTimeout(partida6, 1500)