<p align="center">
        <img src="https://www.pngarts.com/files/4/Chess-PNG-Background-Image.png" alt="drawing " width="drawing" >
</p>

<h1 align="center" style="font-size:50px;">AeroChess</h1>

Servidor ASGI de Django para jugar al ajedrez creado por Paco, Quintín, Sergio y Valeriano como proyecto para la asignatura de Programación Gráfica en Python y JavaScript.

Esta rama corresponde a la versión de producción desplegada en Heroku que puede probarse [aquí](https://aerochess.herokuapp.com/).

Esta rama está preparada para ser desplegada en un servidor UNIX, de manera que funcionaría perfectamente si se ejecutara de manera local en un ordenador cuyo sistema operativo sea Linux.

# <a name="installation"></a> Instalación y activación

Basta con clonar el repositorio (concretamente esta rama) en el directorio deseado:

```
usuario@linux:~/Desktop/PGAA$ git clone -b production https://github.com/spalmeiro/AeroChess
```

Crear un entorno virtual donde instalar las dependencias:

```
usuario@linux:~/Desktop/PGAA$ python3 -m venv AeroChess-venv
```

Activarlo:

```
usuario@linux:~/Desktop/PGAA$ source ./AeroChess-venv/bin/activate
```

E instalar las librerías necesarias para el proyecto a partir del archivo "requirements.txt":

```
(AeroChess-venv) usuario@linux:~/Desktop/PGAA$ cd AeroChess
(AeroChess-venv) usuario@linux:~/Desktop/PGAA/AeroChess$ pip3 install -r requirements.txt
```

Una vez hecho esto para iniciar el servidor en modo local basta con ejecutar el siguiente comando (para más información consultar la [documentación de Django](https://docs.djangoproject.com/en/3.1/))

```
(AeroChess-venv) usuario@linux:~/Desktop/PGAA/AeroChess$ python3 manage.py runserver
```
