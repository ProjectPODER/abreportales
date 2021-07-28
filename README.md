# Abreportales (alpha)
Solicitudes automatizadas al Portal Nacional de Transparencia del INAI. Este proyecto está en versión alpha. Puede fallar.

![Abreportales](abreportales.gif)

## Funciones implementadas
* Envía un mismo mensaje a todas las dependencias federales y estatales (más de 6000)
* Permite seleccionar y omitir dependencias por patrones.
* Realiza múltiples solicitudes en simultáneo.
* Almacena todos los acuses de recibo en PDF en una carpeta.
* Menciona a qué institución pertenece cada acuse de recibo (impreciso).

## Funciones planificadas
* ~~Automatizar el login y la cookie~~ (hecho)
* Detectar las fechas de respuesta de acuerdo al formato del acuse de recibo de cada estado.
* Generar iCal para agregar al calendario las fechas de respuesta de las solicitudes
* Interfaz web

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
* Cree su configuración de filtros
  * Copiar filtros-example.json a filtros.json ```cp filtros-example.json filtros.json```
  * Evitar el archivo y poner true en los estados que se quieran seleccionar y false en los estados que no. "gof" es el gobierno federal.
  * Agregar en el listado de incluidos, un listado de térmios que se quieran incluir. ".*" coincide con todos. "Ayuntamiento" coincide sólo con las instituciones que tengan ese término en su nombre (nota: muchas instituciones que tienen un término no necesariamente son la institución)
  * Agregar en el listado de excluídos aquellos términos que no quiera incluir, por ejemplo "DIF". Si quiere excluir un término sólo al inicio del nombre puede hacerlo con un circunflejo "^DIF". Ambos campos aceptan expresiones regulares sin necesidad de incluir las barras.


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
