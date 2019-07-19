# Abreportales
Solicitudes automatizadas al Portal Nacional de Transparencia del INAI.

![Abreportales](abreportales.gif)

## Funciones implementadas
* Envía un mismo mensaje a todas las dependencias federales (más de 700)
* Separa en grupos
* Almacena todos los PDF del resultado en una carpeta
* Emite en pantalla las fechas de las solicitudes
* Permite omitir dependencias por patrones

## Funciones planificadas
* Automatizar el login y la cookie
* Generar iCal para las solicitudes

## Instalación
Desde la terminal de linux realizar los siguientes comandos:
* ```sudo apt install git nodejs npm```
* ```git clone ssh://git@gitlab.rindecuentas.org:2203/equipo-qqw/abreportales.git```
* ```cd abreportales```
* ```npm install```

## Configuración
* Dentro de la carpeta abreportales, abrri el archivo mensaje.txt y modificarlo con el texto de la solicitud. Esta se enviará a todas las dependencias federales que no se excluyan.
* En la terminal, copiar env.example a .env, comando: ```cp env.example .env```
* Cree su listado de exclusiones (opcional)
 * Copiar excluidos-example.json a excluidos.json ```cp excluidos-example.json exlucidos.json```
 * Editar el archivo con el listado de nombres que desee excluir. Para excluir todas las dependencias que incluyan un término, debe escribir ```"/.*termino.*/i",```. Por ejemplo ```.["CRE","/.*PORTUARIA*/i"]```. excluirá a la CRE y a cualquier adimistración portuaria.
* Editar el archivo .env y poner tu mail de PNT en el campo ABREPORTALES_PNT_USER.

Ya falta poco, recuerda que estás a punto de ahorrarte muchas horas de trabajo.

### Obtener la cookie
Para hacer automaticamente solicitudes realistas, necesitamos realizar este paso. Esperamos poder omitirlo en futuras versiones.

* Acceder a PNT
* Abrir consola F12
* Abrir solapa de RED o network
* Acceder a https://www.plataformadetransparencia.org.mx/group/guest/crear-solicitud
* Llenar el formulario, seleccione una entidad y como mensaje puede utilizar el mensaje genérico que está en mensaje.txt, selccione que ha leido los términos y condiciones y ponga enviar.
* En el panel de red, hacer click en el listado de solicitudes en la fila que dice POST y está dirigida a la URL ```crear-solicitud?p_p_id=infomexportlet_WAR_infomexportlet100SNAPSHOT&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=controllerEnviarSolicitud&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_pos=2&p_p_col_count=3```
* En la columna de Encabezados, buscar donde dice Cookies, hacer doble click y copiar el contenido
* Pegarlo en el archivo .env
* Debe verse similar a:
```ABREPORTALES_PNT_COOKIE = FACEBOOK_ACCESS_TOKEN_COOKIE=testing; JSESSIONID=ALGO; COOKIE_SUPPORT=true; GUEST_LANGUAGE_ID=es_ES; USER_UUID="ALGO/ALGO="; LFR_SESSION_STATE_5859536=ALGO; COMPANY_ID=ALGO; ID=ALGO```


## Ejecución
```node app.js```
