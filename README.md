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
* ```sudo apt install git nodejs npm```
* ```git clone ssh://git@gitlab.rindecuentas.org:2203/equipo-qqw/abreportales.git```
* ```cd abreportales```
* ```npm install```

## Configuración
* Modificar el archivo mensaje.txt con el texto de la solicitud
* Copiar env.example a .env ```cp env.example .env```
* Editar el archivo .env y cambiar usuario, clave y cookie
* Copiar excluidos-example.json a excluidos.json ```cp excluidos-example.json exlucidos.json```
* Editar el archivo con el listado de nombres o patrones regexp que desee excluir. Para excluir todas las dependencias que incluyan un término, debe escribir ```"/.*termino.*/i",```

### Obtener la cookie
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
