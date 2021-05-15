<p align="center">
        <img src="https://www.pngarts.com/files/4/Chess-PNG-Background-Image.png" alt="drawing " width="drawing" >
    </a>
</p>

<h1 align="center" style="font-size:50px;">AeroChess</h1>

En este documento se recoge:
* La documentación empleada.
* Las ideas a implementar
* Los bugs encontrados.
* Un tutorial de instalación.
* Un tutorial sobre cómo contribuir.

# Webs de consulta

* Desarrollo web de mozilla: https://developer.mozilla.org/en-US/docs/

* Libro de Python: https://greenteapress.com/wp/think-python/

* Documentación Python: https://docs.python.org/3/

* Documentación Django: https://docs.djangoproject.com/en/3.1/

* Documentación Bootstrap: https://getbootstrap.com/docs/4.6/

* Stockfish en Python: https://github.com/zhelyabuzhsky/stockfish.

* Tablero de ajedrez en JavaScript: https://chessboardjs.com/.

# Ideas a implementar

* Un modo de juego de un jugador contra la máquina, que será el mejor motor de ajedrez del mundo, Stockfish.

* Un sistema de autenticación para que los usuarios puedan registrarse y autenticarse.

* Un modo multijudador online mediante un sistema de creación de partidas a las que otro jugador se pueda unir:
    * Desde un  lobby  para partidas públicas.
    * Mediante una invitación para partidas privadas.

* Distintos tipos de partida multijugador en función por ejemplo del tiempo permitido para jugar.

* Un modo de puzzles donde el jugador tenga que conseguir determinado objetivo en un número limitado de movimientos.

* Un sistema de personalización de la interfaz que incluya cambios de estilo fichas y tablero y la opción de jugar con o sin sonido.

* Una barra de estado de la partida que muestre qué lado está en una posición más favorable.

* Un registro de partidas completadas (e incluso partidas en curso) al que se pueda acceder desde el perfil del usuario.

* Un modo de "trampas" de manera que se pueda utilizar nuestra página para calcular los mejores movimientos a realizar en partidas que se estén jugando en otras páginas de ajedrez (?).

* Un sistema de clasificación de usuarios registrados similar a los puntos ELO (?).

# Bugs conocidos

* Al cambiar el tamaño de la página el botón de navegación en modo colapsado deja de funcionar.

# Instalación y activación

El objetivo es crear un directorio que contenga todo lo necesario para el funcionamiento del servidor web de manera que se pueda ejecutar localmente.

## Creación de la carpeta contenedora del proyecto y sus dependencias

Esta carpeta almacenará en su interior el entorno virtual de python, los archivos ejecutables de Stockfish y la rama del proyecto que se desee.

En este ejemplo se va a crear en el escritorio, por lo que la ruta sería:
"`C:\Users\Usuario\Desktop\PGAA`"

La ruta puede ser evidentemente distinta y da absolutamente igual, lo único que es recomendable es que ninguno de los nombres de los directorios especificados en la ruta contenga caracteres especiales ni espacios para evitar posibles problemas (a veces también dan problemas los acentos).

## Descarga del archivo ejecutable de Stockfish


```

# Cómo contribuir

Si estáis utilizando GitHub Desktop, él mismo detectará los cambios que se realicen en el repositorio y podréis llevar un registro de dichos cambios haciendo "commits" a vuestra copia local del repositorio a través de la aplicación.

**NOTA:** los cambios que hagáis de manera local son efectivos tan pronto guardáis el archivo editado desde el editor, pero son registrados por GitHub Desktop hasta que hacéis un "commmit". Es recomendable hacer un "commit" local cada vez que acabéis una sesión de trabajo.

Cuando queráis actualizar el repositorio online con los cambios que habéis hecho de forma local, basta con darle a publicar desde GitHub Desktop y la aplicación se encargará de sincronizar los archivos locales con los archivos online.

**NOTA:** es recomendable antes de hacer cambios en el repositorio online asegurarse de que habéis aplicado los cambios a la versión más actualizada del repositorio online y que funciona, para minimizar la posibilidad de que vuestros cambios rompan el proyecto.

**NOTA 2:** Los cambios se aplican a la rama del proyecto que tengáis seleccionada, si esa rama no existiera en el repositorio online pero sí en el repositorio local, sería creada cuando publicarais los cambios.
