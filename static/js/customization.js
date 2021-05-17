/*
    CÓDIGO NECESARIO PARA HABILITAR LA PERSONALIZACIÓN DE LA PÁGINA
*/



// Activa el modal de personalización
$('#customization').on('click', function() {
    $('#customizationModal').modal()
})


// --------------- Personalización del sonido ----------------- //

var sound = sessionStorage.getItem("sound")

if (sound == null) {
    sound = 1;
}

$('#sound_select').on('click', function() {
    if ($('#sound_select').is(":checked")) {
        sound = 1
    } else {
        sound = 0
    }
    sessionStorage.setItem("sound", sound)
})

// Sincroniza la opción guardada con la que se muestra en el menú
if (sound == 1) {
    $('#sound_select').prop('checked', true)
} else {
    $('#sound_select').prop('checked', false)
}

//////////////////////////////////////////////////////////////////



// -------------- Personalización de las piezas --------------- //

var custom_piece_theme = sessionStorage.getItem("piece_theme")

if (custom_piece_theme == null) {
    custom_piece_theme = "cburnett";
}

// Permite cambiar el tema seleccionado
$("#piece_theme").on('change',  function () {
    custom_piece_theme = $('#piece_theme option:selected').val()
})

// Permite previsualizar el tema seleccionado
function piece_theme_preview (piece) {
    theme = $('#piece_theme option:selected').val()
    return '/static/img/chesspieces/'+ theme + '/'+ piece + '.svg'
}

// Se previsualizan los cambios
$('#piece_theme').on('click', function() {
    previewBoard.flip()    
    previewBoard.flip()
})

// Sincroniza el tema activo con el tema mostrado en el modal
$("#piece_theme").val(custom_piece_theme);

//////////////////////////////////////////////////////////////////




// --------------- Personalización del tablero ---------------- //

// Obtiene el tema seleccionado por el usuario
var custom_board_theme = sessionStorage.getItem("board_theme")

// Si no hay ninguno, usa el predeterminado
if (custom_board_theme == null) {
  custom_board_theme = "default"
}

// Permite cambiar el tema seleccionado
$("#board_theme").on('change',  function () {

    custom_board_theme = $('#board_theme option:selected').val()

    if (custom_board_theme == "default") {
        CSS['black'] = 'boardtheme1black';
        CSS['white'] = 'boardtheme1white';
    } 
    // Tablero verde
    else if (custom_board_theme == "green") {
        CSS['black'] = 'boardtheme2black';
        CSS['white'] = 'boardtheme2white';
    }
    // Tablero azul
    else if (custom_board_theme == "blue") {
        CSS['black'] = 'boardtheme3black';
        CSS['white'] = 'boardtheme3white';
    }
    
    else if (custom_board_theme == "ocher") {
        CSS['black'] = 'boardtheme4black';
        CSS['white'] = 'boardtheme4white';
    }
    
    else if (custom_board_theme == "green-yellow") {
        CSS['black'] = 'boardtheme5black';
        CSS['white'] = 'boardtheme5white';
    }
})

// Se previsualizan los cambios
$('#board_theme').on('click', function() {
    previewBoard.flip()    
    previewBoard.flip()
})

// Sincroniza el tema activo con el tema mostrado en el modal
$("#board_theme").val(custom_board_theme);

//////////////////////////////////////////////////////////////////




// ------------------ Se aplican los cambios ------------------ //

$('#customization').on('click', function(){
    sessionStorage.setItem("piece_theme", custom_piece_theme)
    sessionStorage.setItem("board_theme", custom_board_theme)
    reproSon("click.wav")
    board.flip()    
    board.flip()
})

//////////////////////////////////////////////////////////////////




// --------------------- Previsualización --------------------- //

// Configura el tablero
var config = {
    pieceTheme: piece_theme_preview,
    position: 'start',
}

// Carga el tablero
var previewBoard = Chessboard('previewBoard', config)

// Permite que el tablero sea responsive
$(window).resize(previewBoard.resize)

//////////////////////////////////////////////////////////////////