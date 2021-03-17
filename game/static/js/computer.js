/* 
    CÓDIGO NECESARIO PARA EL FUNCIONAMIENTO DE LA PÁGINA DE JUEGO CONTRA EL ORDENADOR
*/

// FUNCIONES PARA EL FUNCIONAMIENTO DEL TABLERO Y DEL JUEGO

    // Declaración de las variables del tablero y del estado de la partida
    var $board = $('#tablero')
    var game = new Chess()
    var $status = $('#status') // Estado de la partida
    var $apariencia = $('#apariencia') // Tema de las piezas
    var $fen = $('#fen') // FEN
    var $pgn = $('#pgn')
    var $score = $('#score')
    var $time = $('#time')
    var $nodes = $('#nodes')
    var $knps = $('#knps')
    var squareClass = 'square-55d63'// se usa para pintar los cuadros de los ultimos movimientos
    var squareToHighlight = null // se usa para pintar los cuadros de los ultimos movimientos
    var whiteSquareGrey = '#a9a9a9' // Determina el color con el que se destaca una casilla blanca
    var blackSquareGrey = '#696969' // Determina el color con el que se destaca una casilla negra

    // Función que permite la personalización de la apariencia de las piezas
    function tema (piece) {
        opcion = $('#apariencia option:selected').val()
        return '/static/img/chesspieces/'+ opcion + '/'+ piece + '.png'
    }

    // Función que reproduce los sonidos que se le pasan como argumento
    function reproSon (name) {
        var audio = new Audio('/static/sounds/' + name);
        audio.play();
    }

    // Función que actualiza los datos sobre el estado de la partida
    function actualizacion () {

        var status = ''
        var moveColor = 'Blancas'

        if (game.turn() === 'b') {
        moveColor = 'Negras'
        }

        // Comprueba si hay jaque mate
        if (game.in_checkmate()) {
            status = 'Fin del Juego, ' + moveColor + ' hacen jaque mate.'
            reproSon('mate.mp3')
        }

        // Comprueba si hay tablas
        else if (game.in_draw()) {
            status = 'Fin del juego, tablas'
        }

        // Si no se cumple lo anterior, la partida continúa
        else {
            status = ' Turno de ' + moveColor
            // Comprueba si hay jaque
            if (game.in_check()) {
                status += ', ' + moveColor + 'en jaque'
            }
        }

        // Se actualizan los elementos DOM (Document Object Model)
        $status.html(status)
        $fen.val(game.fen())
        $pgn.html(game.pgn())
    }

    // Función que controla las marcas de color al mover
    function removeHighlights (color) {
        $board.find('.' + squareClass)
        .removeClass('highlight-' + color)
    }

    // Función que marca casillas
    function greySquare (square) {
        var $square = $('#myBoard .square-' + square)
      
        var background = whiteSquareGrey
        if ($square.hasClass('black-3c85d')) {
          background = blackSquareGrey
        }
      
        $square.css('background', background)
    }

    // Función que desmarca casillas
    function removeGreySquares () {
        $('#myBoard .square-55d63').css('background', '')
    }

    // Función que marca los posibles movimientos cuando el ratón se sitúa sobre una pieza
    function onMouseoverSquare (square, piece) {

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

    // Comunicación entre la web y el servidor, para que Stockfish calcule el mejor movimiento
    
        // Con esta función cumplimos los protocolos de seguridad de CRFS
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

                    removeHighlights('black');

                    $board.find('.square-' + estoy).addClass('highlight-black');
                    $board.find('.square-' + voy).addClass('highlight-black')
                    squareToHighlight = data.best_move;

                    // Actualiza la información sobre la partida
                    $score.text(data.score);
                    $time.text(data.time);
                    $nodes.text(data.nodes);
                    $knps.text(Math.round(Number($nodes.text()) / parseFloat($time.text())) / 1000)

                    reproSon("ficha.wav");

                    // Actualiza el estado de la partida
                    actualizacion();

                    console.log(data)
                },
                error: function (error) {
                    console.log(error);
                }
            });
        }

    //

    // Función que controla cuándo y qué piezas se pueden seleccionar para mover
    function onDragStart (source, piece, position, orientation) {
        
        // Evita que se puedan mover fichas en una partida acabada
        if (game.game_over()) return false

        // Controla que sólo se puedan seleccionar las piezas del lado al que le toca mover
        if ((game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1)) return false
    }

    // Función que controla qué ocurre cuando soltamos una pieza
    function onDrop (source, target) {

        // Comprueba si el movimiento es legal
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // siempre promociona a reina ¿podríamos hacer algo para elegir la pieza?
        })

        removeHighlights('white')
        $board.find('.square-' + source).addClass('highlight-white')
        $board.find('.square-' + target).addClass('highlight-white')

        // Hace que la pieza vuelva a su posición original si el movimiento no está permitido
        if (move === null) return 'snapback'

        reproSon("ficha.wav");

        // Al soltar la pieza se activa la función que genera la respuesta del motor de ajedrez
        make_move();

        // Se actualizan los datos
        actualizacion();
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

    // Configuración del tablero
    var config = {
        draggable: true,
        pieceTheme: tema,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onMoveEnd: onMoveEnd,
        onSnapEnd: onSnapEnd
    }

    // Crea la instancia del tablero
    board = Chessboard('tablero', config)

    // Actualiza el estado de la partida
    actualizacion();

//

// FUNCIONES PARA LOS BOTONES QUE SE MUESTRAN EN LA INTERFAZ

    // Reiniciar la partida
    $('#new_game').on('click', function() {
        // Reinicia el estado del tablero
        game.reset();
        removeHighlights('white')
        removeHighlights('black')
        reproSon("click2.wav");
        // Establece la posición de inicio
        board.position('start');
    });

    // Hacer un movimiento
    $('#make_move').on('click', function() {
        // Pide que el movimiento lo haga el ordenador
        reproSon("click2.wav");
        removeHighlights('white');
        make_move();
    });

    // Deshacer movimientos
    $('#take_back').on('click', function() { 
        // Retrocede un movimiento
        game.undo();
        // Actualiza el estado del tablero
        board.position(game.fen());
        reproSon("click2.wav");
        removeHighlights('black');
        removeHighlights('white');
        // Actualiza el estado de la partida
        actualizacion();
    });

    // Rotar el tablero
    $('#flip_board').on('click', function() {  // rotar el tablero
        board.flip();
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
        actualizacion();
    });

    //
    $('#subboton').on('click', function(){
        reproSon("click.wav");
        board.flip();    
        board.flip();
    })

//