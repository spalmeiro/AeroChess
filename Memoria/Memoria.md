<p align="center">
        <img src="img/Imagen_portada.png" alt="drawing " width="drawing" >
    </a>
</p>

<h1 align="center" style="font-size:50px;">AeroChess</h1>

En este documento se recoge:
* La documentación empleada.
* Las ideas a implementar
* Nuestos objetivos durante el Proyecto
* La Pagina Final
* La Funcionalidad por Encima de todo
* Los bugs encontrados.
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
<div style="text-align: justify"> 
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

</div>

# Objetivos durante el Proyecto

<div style="text-align: justify">
<p>Con el paso de las semanas las ideas a implementar no hicieron más que crecer, pero los objetivos del proyecto cambiaron muy poco. Sin embargo, lo que comenzó siendo un objetivo primario como era la inclusión de un modo de "trampas", fue rápidamente descartado debido a que los sistemas anti-cheat de las páginas que se tenían como objetivo funcionan realmente bien. Esto es porque los motores de ajedrez siempre elijen el mejor movimiento desde el punto de vista estadístico y no como las personas que pueden planear estrategias y las intentan seguir mientras pueden, realizando en varias ocasiones movimientos que no serían el mejor posible según un motor de ajedrez. Esto provoca que las páginas webs puedan analizar si los movimientos son realizados por una máquina o por una persona. Descartada esta idea pronto se pensó en qué hacer con el proyecto y la decisión fue clara: se quiso ver como de funcional se podía hacer una página web sobre ajedrez. De ese modo, se fijó la funcionalidad como eje principal en el diseño de la web, consiguiendo que ésta pudiera ofrecer varios modos de juego a los usuarios. El objetivo último que se alcanzó fue servir la página de forma online y abierta para todo el mundo.</p>
 </div>
        

# La Pagina Final

<span></span>
<p align="center">
        <img src="img/Imagen_portada.png" alt="drawing " width="drawing" >
</p>

<div style="text-align: justify">

<p>Pensada para abarcar las distintas opciones de juego: modo contra el ordenador, puzzle y multijugador.
Personaliza las fichas y el tablero a tu gusto y desmuestra tu destreza.</p>  
<p>La zona de Lobby muestra las partidas activas y, además, permite a los usuarios unirse a las partidas disponibles. Si lo tuyo no es el ajedrez, o necesitas perfeccionar tu destreza en este deporte, no dudes en usar el modo espectador para visualizar partidas en vivo.</p>

</div>


## Modo contra el ordenador
<p align="center">
        <img src="img/f2.png" alt="drawing " width="drawing" >
</p>
<div style="text-align: justify">
<p>Nada mejor para aprender que practicar con los distintos niveles de dificultad del ordenador.</p>
<p>Dividida en dos partes, la carta de la derecha permite al jugador visualizar los movimientos realizados hasta el momento, así como usar los distintos botones típicos para realizar movimientos, retroceder, rotar tablero o crear una partida nueva.
La opción FEN permite crear una situación de partida.
El motor Stokfish será un verdadero quebradero de cabeza para ti. </p>

</div>


## Modo puzzle
<p align="center">
        <img src="img/f3.png" alt="drawing " width="drawing" >
</p>
<div style="text-align: justify">
<p>El modo puzzle permite poner en jaque situaciones reales de partida. Demuestra que eres capaz de vencer a la máquina en pocos movimientos. A pesar de todo, si te atrancas, ¡nunca viene mal echar un vistazo a la solución!</p>


</div>

# La Funcionalidad por encima de todo

<div style="text-align: justify">
<p>Respecto de cómo la página se adapta a distintos dispositivos como ordenadores, tablets o teléfonos móviles, o simplemente ante la reducción de la ventana del navegador en un ordenador, cabe destacar que ésta cuenta con un diseño que le permite ajustarse con éxito a todas estas variantes sin pérdida alguna de funcionalidad. Por ejemplo, la barra de navegación pasará a un modo desplegable cuando la ventana sea demasiado pequeña como para alojarla.</p>

<p align="center">
        <img src="img/Pantalla_juego_semicolapsada.png" alt="drawing " width="drawing" >
        <img src="img/Barra_nav_colapsada.png" alt="drawing " width="300" >
                <img src="img/f6.png" alt="drawing " 
        width="300" >
</p>

<div style="text-align: justify">

</div>

<div style="text-align: justify">
<p>La página también permite al usuario registrarse con una cuenta propia para mantener un registro de las partidas jugadas y su historial de victorias y derrotas. En este apartado de creación de cuentas de usuario cabe destacar que mediante django ésta es capaz de dictar sentencias sobre si las contraseñas escogidas son adecuadas desde el punto de vista de la seguridad. Dicho de otro modo, la página mostrará una alerta cuando la contraseña escogida tenga una longitud inferior a 8 caracteres y también asegurará que sea de carácter alfa-numérico, no siendo aceptable por ejemplo una contraseña compuesta sólo por números. En esta misma línea, en la pantalla de inicio de sesión también se muestran alertas cuando la contraseña o el usuario introducidos no coinciden con el correcto.</p>
<p align="center">
        <img src="img/Alerta_inicio_sesion.png" alt="drawing " 
        width="300" >
        <img src="img/Alertas_creacion_cuenta.png" alt="drawing " 
        width="300" >      
</p>
<div style="text-align: justify">
</div>


<div style="text-align: justify">

<p>
También se mencionó previamente que la página permite la personalización del tablero y de las fichas de juego dentro de la selección que se ofrece. En este sentido cabe destacar que dicha personalización se mantiene entre las diferentes pantallas de juego (modo individual, puzles, modo online) y sólo se perderá cuando el usuario cierre la ventana del navegador. Este fue uno de los objetivos que quedó por implementar, de manera que la información de personalización quedara guardada en la base de datos vinculada a la cuenta de usuario y la personalización quedaría registrada.
<p align="center">
        <img src="img/f4.png" alt="drawing " width="300" >
</p>
<div style="text-align: justify">
</p>

</div>


```

# Cómo contribuir

Si estáis utilizando GitHub Desktop, él mismo detectará los cambios que se realicen en el repositorio y podréis llevar un registro de dichos cambios haciendo "commits" a vuestra copia local del repositorio a través de la aplicación.

**NOTA:** los cambios que hagáis de manera local son efectivos tan pronto guardáis el archivo editado desde el editor, pero son registrados por GitHub Desktop hasta que hacéis un "commmit". Es recomendable hacer un "commit" local cada vez que acabéis una sesión de trabajo.

Cuando queráis actualizar el repositorio online con los cambios que habéis hecho de forma local, basta con darle a publicar desde GitHub Desktop y la aplicación se encargará de sincronizar los archivos locales con los archivos online.

**NOTA:** es recomendable antes de hacer cambios en el repositorio online asegurarse de que habéis aplicado los cambios a la versión más actualizada del repositorio online y que funciona, para minimizar la posibilidad de que vuestros cambios rompan el proyecto.

**NOTA 2:** Los cambios se aplican a la rama del proyecto que tengáis seleccionada, si esa rama no existiera en el repositorio online pero sí en el repositorio local, sería creada cuando publicarais los cambios.

 </div>