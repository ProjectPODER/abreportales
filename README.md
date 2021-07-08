# Abreportales (alpha)
Solicitudes automatizadas al Portal Nacional de Transparencia del INAI. Este proyecto está en versión alpha. Puede fallar.

![Abreportales](abreportales.gif)

## Funciones implementadas
* Envía un mismo mensaje a todas las dependencias federales (más de 700)
* Separa en grupos
* Almacena todos los PDF del resultado en una carpeta
* Emite en pantalla las fechas de las solicitudes
* Permite omitir dependencias por patrones

## Funciones planificadas
* ~~Automatizar el login y la cookie~~ (hecho)
* Generar iCal para las solicitudes
* Interfaz web
* Mejorar capacidad de filtrar destinatarios

## Instalación
Desde la terminal de linux realizar los siguientes comandos:
* ```sudo apt install git nodejs npm```
* ```git clone https://github.com/ProjectPODER/abreportales.git```
* ```cd abreportales```
* ```npm install```

## Configuración
* Dentro de la carpeta abreportales, abrri el archivo mensaje.txt y modificarlo con el texto de la solicitud. Esta se enviará a todas las dependencias federales que no se excluyan.
* En la terminal, copiar env.example a .env, comando: ```cp env.example .env```
* Editar el archivo .env y modificar:
  * Poner tu mail de PNT en el campo ABREPORTALES_PNT_USER.
  * Poner tu contraseña de PNT en el campo ABREPORTALES_PNT_PASSWORD.
* Poner en el campo ABREPORTALES_DEPENDENCIAS_FILES los nombres de los estados a los que quiera consultar. "gof" es el gobierno federal.
* (opcional) Cree su listado de exclusiones
  * Copiar excluidos-example.json a excluidos.json ```cp excluidos-example.json exlucidos.json```
  * Editar el archivo con el listado de nombres que desee excluir. Para excluir todas las dependencias que incluyan un término, debe escribir ```"/.*termino.*/i",```. Por ejemplo ```.["CRE","/.*PORTUARIA*/i"]```. excluirá a la CRE y a cualquier adimistración portuaria.


## Actualizar destinatarios

Abreportales incluye un listado de dependencias por estado en la carpeta dependencias. Es posible que la PNT modifique el listado de dependencias ocasionalmente, para poder enviar a todas las nuevas dependencias desde Abreportales debe ejecutar:

```node update_dependencias.json```

Ocasionalmente algunas dependencias pueden fallar en el servidor de la PNT, esto será evidente al iniciar abreportales por el mensaje:

```
No se pudo leer archivo de destinatarios ./dependencias/agu.json Unexpected token < in JSON at position 0
```

## Ejecución

Una vez que haya realizado los pasos de configuración, ejecute en la terminal el siguiente comando:

```node app.js```

Se realizarán todas las solicitudes que coincidan con los parámetros y con el mensaje indicado. Aparecerá como resultado el folio para cada dependencia.


# Colaboración

Este proyecto es una prueba de concepto, desarrollada por el área de tecnología de PODER como servicio para la sociedad civil mexicana. Tiene aun mucho por mejorar. Se invita a reportar errores y dificultades y enviar pull requests con mejoras.
