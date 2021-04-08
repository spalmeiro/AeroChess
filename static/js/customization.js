/*
    CÓDIGO NECESARIO PARA HABILITAR LA PERSONALIZACIÓN DE LA PÁGINA
*/

// Variables para la previsualización
var config = {
    pieceTheme: style,
    position: 'start',
}

var board_preview = Chessboard('BoardPreview', config)

// Variables de personalización
var $piece_style = $('#piece_style') // Estilo de las piezas


////////////////////////////////////////////////////////////////////////////////////////////////////


// Función que permite la personalización del estilo de las piezas
function style (piece) {
    opcion = $('#piece_style option:selected').val()
    return '/static/img/chesspieces/'+ opcion + '/'+ piece + '.png'
}


////////////////////////////////////////////////////////////////////////////////////////////////////


// Permite que el tablero sea responsive
$(window).resize(board_preview.resize)

// Se previsualizan los cambios
$('#piece_style').on('click', function(){
    board_preview.flip()    
    board_preview.flip()
})
