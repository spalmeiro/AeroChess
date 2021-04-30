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

El archivo puede descargarse desde [Stockfish][Stockfish] lo que nos proporcionará un archivo .rar que debe ser descomprimido y colocado en la carpetea contenedora del proyecto.

[Stockfish]:https://stockfishchess.org/download/

## Descarga del código desde GitHub

Para poder contribuir de manera eficiente y de forma sencilla al proyecto, se recomienda instalar la aplicación de GitHub para escritorio desde [GitHub Desktop][GitHub Desktop].

[GitHub Desktop]:https://desktop.github.com/

Una vez descargada e instalada la aplicación debemos iniciar sesión con nuestra cuenta de GitHub y otorgarle los permisos que solicite.

Después, desde la página principal del programa, debemos seleccionar la opción de "*Clonar un repositorio desde internet...*", elegir el repositorio del proyecto, y escoger un lugar donde se guardará el repositorio en nuestro ordenador, en este caso el directorio que hemos creado en el apartado anterior.

De esta manera, GitHub Desktop se encargará de realizar una copia del repositorio online en nuestro ordenador en la que podremos realizar los cambios que queramos y cuando lo consideremos oportuno aplicar esos cambios de manera sencilla al repositorio online.

## Creación del entorno virtual

El siguiente paso será crear un entorno virtual donde se guardarán las librerías necesarias para el funcionamiento del sitio web. Para ello debemos abrir una consola de cmd y navegar hasta la carpeta contenedora del proyecto mediante el comando cd:

```
C:\Users\Usuario> cd C:\Users\Usuario\Desktop\PGAA
```

Una vez dentro, creamos el entorno virtual ejecutando:

```
C:\Users\Usuario\Desktop\PGAA> python -m venv AeroChess-venv
```

De esta manera, se crea el directorio "Aerochess-venv" en la carpeta contenedora y se instala una copia de la versión instalada de python en su interior.

A continuación, hay que activar el entorno virtual ejecutando el archivo "activate.bat" que se encuentra dentro de la carpeta scripts del entorno virtual. Para ello, basta con ejecutar en la consola lo siguiente:

```
C:\Users\Usuario\Desktop\PGAA> .\AeroChess-venv\scripts\activate.bat
```

Si se ha activado de manera correcta, aparecerá el nombre del entorno virtual entre paréntesis al principio de la línea de comandos en cmd, con un aspecto similar al siguiente:

```
(AeroChess-venv) C:\Users\Usuario\Desktop\PGAA>_
```

## Instalación de las dependencias necesarias

Para hacer este proceso más sencillo y minimizar las incoveniencias si las dependencias cambian a lo largo del proyecto, se va a hacer uso de la herramienta pipenv.

Para instalarla, basta con ejecutar el siguiente comando (con el entorno virtual activado):

```
(AeroChess-venv) C:\Users\Usuario\Desktop\PGAA> python -m pip install pipenv
```

Una vez instalada, debemos navegar hasta el directorio de la rama del proyecto, en este caso:

```
(AeroChess-venv) C:\Users\Usuario\Desktop\PGAA> cd AeroChess
```

Y una vez dentro, simplemente ejecutamos:

```
(AeroChess-venv) C:\Users\Usuario\Desktop\PGAA\AeroChess> pipenv install
```

Y pipenv se encarga de leer los archivos "Pipfile" y "Pipfile.lock" e instalar todas las librerías necesarias.

Por último, si hubiera que añadir más librerías al proyecto deben instalarse utilizando el comando:

```
pipenv install (nombre_del_paquete)
```

Y no:

```
python -m pip install (nombre_del_paquete)
```

Para garantizar que pipenv registra los cambios en "Pipfile" y "Pipfile.lock".

## Activación del servidor

Una vez hecho todo lo anterior, para conseguir que el servidor funcione en modo local basta con ejecutar el archivo runserver.bat que se encuentra dentro del repositorio, lo que abrirá una consola que cargará el servidor en el servidor local en el puerto por defecto, que es el 8000.

Para acceder al sitio web se debe teclear [127.0.0.1:8000][web] o [localhost:8000][web] en la barra de navegación del navegador web.

[web]:http://localhost:8000

Para cerrar el servidor basta con hacer "CTRL + C" en la consola que se ha abierto. Esto provocará que se nos pregunte: "¿Desea terminar el trabajo por lotes (S/N)?". Respondemos que sí ("s" y  "ENTER") y listo.

**NOTA:** también se puede cerrar el servidor cerrando directamente la consola, aunque es una manera un poco más brusca de hacerlo.

# Reseteo de la base de datos

Se hace necesario un reset de la base de datos cada vez que se haga un cambio en su estructura, a través de la modificación de los modelos de Django.

Para borrar todos los datos almacenados en la base de datos (dependiendo del cambio aplicado, ejecutar esto puede ser opcional):

```
(AeroChess-venv) C:\Users\Usuario\Desktop\PGAA\AeroChess> python manage.py reset_db
```

Crea las migraciones necesarias para aplicar los cambios realizados en los modelos de Django:

```
(AeroChess-venv) C:\Users\Usuario\Desktop\PGAA\AeroChess> python manage.py makemigrations
```

Sincroniza la base de datos para que sea coherente con los modelos actualizados utilizando las migraciones creadas con el comando anterior:

```
(AeroChess-venv) C:\Users\Usuario\Desktop\PGAA\AeroChess> python manage.py migrate
```

NOTA: si se quisiera además eliminar todo rastro de la estructura de la base de datos anterior, deberían borrarse a mano en cada una de las aplicaciones del servidor que utilizan la base de datos los archivos de las migraciones y sus caches (archivos del tipo "0001_initial.py" pero no los archivos que empiezan por "\_\_init__"), almacenados en la carpeta "migrations" dentro de cada aplicación del proyecto, pero esto no debería ser necesario (solo por cuestión de limpieza y orden).

Por último, para cargar en la base de datos la lista de puzzles, se ejecuta:

```
(AeroChess-venv) C:\Users\Usuario\Desktop\PGAA\AeroChess> python manage.py loaddata puzzle
```

# Cómo contribuir

Si estáis utilizando GitHub Desktop, él mismo detectará los cambios que se realicen en el repositorio y podréis llevar un registro de dichos cambios haciendo "commits" a vuestra copia local del repositorio a través de la aplicación.

**NOTA:** los cambios que hagáis de manera local son efectivos tan pronto guardáis el archivo editado desde el editor, pero son registrados por GitHub Desktop hasta que hacéis un "commmit". Es recomendable hacer un "commit" local cada vez que acabéis una sesión de trabajo.

Cuando queráis actualizar el repositorio online con los cambios que habéis hecho de forma local, basta con darle a publicar desde GitHub Desktop y la aplicación se encargará de sincronizar los archivos locales con los archivos online.

**NOTA:** es recomendable antes de hacer cambios en el repositorio online asegurarse de que habéis aplicado los cambios a la versión más actualizada del repositorio online y que funciona, para minimizar la posibilidad de que vuestros cambios rompan el proyecto.

**NOTA 2:** Los cambios se aplican a la rama del proyecto que tengáis seleccionada, si esa rama no existiera en el repositorio online pero sí en el repositorio local, sería creada cuando publicarais los cambios.