# Abreportales
Solicitudes automatizadas al Portal Nacional de Transparencia del INAI.

## Funciones implementadas
* Envía un mismo mensaje a todas las dependencias federales (más de 700)
* Separa en grupos de 33
* Almacena todos los PDF del resultado en una carpeta

## Funciones planificadas
* Producir un listado de las fechas para cada solicitud
* Indicar dependencias a omitir

## Instalación
* ```sudo apt install git nodejs npm```
* ```git clone ssh://git@gitlab.rindecuentas.org:2203/equipo-qqw/abreportales.git```
* ```cd abreportales```
* ```npm install```

## Configuración
* Modificar el archivo mensaje.txt con el texto de la solicitud

## Ejecución
```node app.js```
