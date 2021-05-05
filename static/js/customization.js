/*
    CÓDIGO NECESARIO PARA HABILITAR LA PERSONALIZACIÓN DE LA PÁGINA
*/

//// PREVISUALIZACIÓN ////

// Configura el tablero
var config = {
    pieceTheme: style,
    position: 'start',
}

// Carga el tablero
var board_preview = Chessboard('BoardPreview', config)

// Permite que el tablero sea responsive
$(window).resize(board_preview.resize)



//// PERSONALIZACIÓN DE LAS PIEZAS ////

var $piece_style = $('#piece_style')

// Selecciona las imágenes de las piezas
function style (piece) {
    opcion = $('#piece_style option:selected').val()
    return '/static/img/chesspieces/'+ opcion + '/'+ piece + '.png'
}

// Se previsualizan los cambios
$('#piece_style').on('click', function() {
    board_preview.flip()    
    board_preview.flip()
})




//// PERSONALIZACIÓN DEL TABLERO ////

// Selecciona el tema del tablero
$("#board_theme").on('change',  function () {
    // Tablero predeterminado
    if (this.selectedIndex == 0) {
        CSS['black'] = 'boardtheme1black';
        CSS['white'] = 'boardtheme1white';
    } 
    // Tablero verde
    else if (this.selectedIndex == 1) {
        CSS['black'] = 'boardtheme2black';
        CSS['white'] = 'boardtheme2white';
    }
    // Tablero azul
    else if (this.selectedIndex == 2) {
        CSS['black'] = 'boardtheme3black';
        CSS['white'] = 'boardtheme3white';
    }
});

// Se previsualizan los cambios
$('#board_theme').on('click', function() {
    board_preview.flip()    
    board_preview.flip()
})




//// SE APLICAN LOS CAMBIOS ////

$('#customization').on('click', function(){
    reproSon("click.wav")
    board.flip()    
    board.flip()
})