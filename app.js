#!/bin/node
fetch = require("node-fetch");
fs = require("fs");
var dotenv = require('dotenv')
dotenv.config();
PDFParser = require("pdf2json");


//Config
const user = process.env.ABREPORTALES_PNT_USER; //"user@name.com";
const password = process.env.ABREPORTALES_PNT_PASSWORD; //"password";

const mensaje_file = process.env.ABREPORTALES_MENSAJE ||"./mensaje.txt";
const destinatarios_path = process.env.ABREPORTALES_DEPENDENCIAS_PATH ||"./dependencias/";
const exclusion_patterns_file = process.env.ABREPORTALES_FILTROS || "./filtros.json"

const batch_size = process.env.ABREPORTALES_BATCH_SIZE || 5;
const pdf_path = process.env.ABREPORTALES_PDF_PATH || './pdf/';
const json_path = process.env.ABREPORTALES_JSON_PATH || "./json/";


prepareConsole()

//Read files
const mensaje = fs.readFileSync(mensaje_file, 'utf8');
const filters = JSON.parse(fs.readFileSync(exclusion_patterns_file, 'utf8'));
const destinatarios = getDestinatarios(filters.estados); //example: "gof_9171_ADMINISTRACI%C3%93N+PORTUARIA+INTEGRAL+DE+MAZATL%C3%81N%2C+S.A.+DE+C.V.%7C";


//This starts the process
const destinatarios_filtrados = filterDestinatarios(destinatarios);
// showDestinatarios(destinatarios_filtrados);


const destinatarios_totales = destinatarios.length
const destinatarios_filtrados_count = destinatarios_filtrados.length;
// console.log(JSON.stringify(filters));
const estados_count = getEstados(filters.estados).length;

const batches = getBatches(destinatarios_filtrados);

login(batches,runBatches);


function getDestinatarios(estados) {
  let destinatarios = [];
  let estados_filtrados = getEstados(estados);
  // console.log(estados_filtrados)
  for (let file in estados_filtrados) {
    if (estados_filtrados[file].length == 0) {
      continue;
    }
    let estado = estados_filtrados[file];
    let destinatarios_file_path = destinatarios_path+estado+".json";

    try {
      let destinatarios_json = JSON.parse(fs.readFileSync(destinatarios_file_path, 'utf8'));
      // console.log("Leyendo",destinatarios_json.catalogo.length,"destinatarios de",estado)
      let destinatarios_estado = destinatarios_json.catalogo.map(o => { o.estado = estado; return o } );
      // console.log("destinatarios_estado",estado,destinatarios_estado.length)
      destinatarios = destinatarios.concat(destinatarios_estado);
    }
    catch (e) {
      console.error("No se pudo leer archivo de destinatarios",destinatarios_file_path,e.message)
    }

  }
  return destinatarios;
}


function getEstados(allEstados) {
  let estados_filtrados = [];
  // console.log(typeof allEstados);
  let estados_nombres = Object.keys(allEstados)

  for (k in estados_nombres) {
    if (allEstados[estados_nombres[k]]) {
      estados_filtrados.push(estados_nombres[k])
    }
  }

  return estados_filtrados;
}


//Login to PNT and run callback
function login(batches,callback,first=0) {

  console.log("Inicio de sesión en PNT",user);

  fetch("https://www.plataformadetransparencia.org.mx/web/guest/inicio", {
    "headers": {
      "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:68.0) Gecko/20100101 Firefox/68.0",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/x-www-form-urlencoded",
      "Upgrade-Insecure-Requests": "1"
    },
    "referrer": "https://www.plataformadetransparencia.org.mx/"
  }).then(res => {
    let headers = res.headers

    res.text().then(text => { return {
      "headers": headers,
      "text": text
    }})
    .then(resdata => {
      const text = resdata.text;

      // const login_cookie = 'FACEBOOK_ACCESS_TOKEN_COOKIE=testing; JSESSIONID=4+hjesVbu+GO8JEXt+-S-4gU; COOKIE_SUPPORT=true; GUEST_LANGUAGE_ID=es_ES; USER_UUID="MqYe4rI5lDA2thSEChFP8wYTxLCd7JoDN18Lu27jDZc="; LFR_SESSION_STATE_5859536=1563559809683'

      first_position = text.indexOf("_58_formDate")+35;
      second_position = text.indexOf("_58_saveLastPath") - first_position - 31;
      form_date = text.substr(first_position,second_position);
      // console.log("Login 1",form_date, resdata.headers);
      //login
      fetch("https://www.plataformadetransparencia.org.mx/web/guest/inicio?p_p_id=58&p_p_lifecycle=1&p_p_state=maximized&p_p_mode=view&_58_struts_action=%2Flogin%2Flogin", {
        "credentials": "include",
        "headers": {
          "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:68.0) Gecko/20100101 Firefox/68.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/x-www-form-urlencoded",
          "Upgrade-Insecure-Requests": "1",
          "Cookie": headersToCookieString(resdata.headers)
        },

        "referrer": "https://www.plataformadetransparencia.org.mx/web/guest/inicio?p_p_id=58&p_p_lifecycle=1&p_p_state=maximized&p_p_mode=view&_58_struts_action=%2Flogin%2Fcreate_account",
        "body": "_58_formDate="+form_date+"&_58_saveLastPath=false&_58_redirect=&_58_doActionAfterLogin=false&_58_login="+encodeURIComponent(user)+"&_58_password="+encodeURIComponent(password),
        "method": "POST",
        "mode": "cors",
        "redirect": "manual"
      }).then(res => {
        let headers = res.headers;

        res.text().then(text => { return {
          "headers": headers,
          "text": text
        }}).then(resdata => {
          // console.log("Login 2 - headers",resdata.headers);
          const login_cookie = headersToCookieString(resdata.headers)
          //'JSESSIONID=4+hjesVbu+GO8JEXt+-S-4gU; COOKIE_SUPPORT=true; GUEST_LANGUAGE_ID=es_ES; USER_UUID="mxGK7V90NNpzFqBv4LOXBTW4Gi4Lmnz+M6ioMTp5Op8="; COMPANY_ID=10154; ID=335350674553336d4934647647445a4b4e45776a39773d3d';
          fetch("https://www.plataformadetransparencia.org.mx/c",  {
            "headers": {
              "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:68.0) Gecko/20100101 Firefox/68.0",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
              "Content-Type": "application/x-www-form-urlencoded",
              "Upgrade-Insecure-Requests": "1",
              "Cookie": login_cookie
            },
            "referrer": "https://www.plataformadetransparencia.org.mx/"
          }
        ).then(res => {
          let headers = res.headers;
          res.text().then(text => { return {
            "headers": headers,
            "text": text
          }}).then(res => {
            const cookie = headersToCookieString(resdata.headers);
            console.log("Login cookie",cookie);
            //'FACEBOOK_ACCESS_TOKEN_COOKIE=testing; JSESSIONID=4+hjesVbu+GO8JEXt+-S-4gU; COOKIE_SUPPORT=true; GUEST_LANGUAGE_ID=es_ES; USER_UUID="MqYe4rI5lDA2thSEChFP8wYTxLCd7JoDN18Lu27jDZc="; LFR_SESSION_STATE_5859536=1563559801574; COMPANY_ID=10154; ID=335350674553336d4934647647445a4b4e45776a39773d3d';

            if (cookie == "FACEBOOK_ACCESS_TOKEN_COOKIE=testing") {
              console.error("No se pudo inciar sesion. Verifique usuario y contraseña. Terminando.")
            }
            else {
              callback(batches,first,cookie);
            }
          })
        });
      })
    })
  })
})
};

function headersToCookieString(headers) {
  let cookieHeader = headers.get("set-cookie");
  cookieArray = cookieHeader.split("; Path=/")
  cookieValues = cookieArray.map(c => {
    return c.replace("HttpOnly",", ")
    .replace(/Expires=.*/,"")
    .replace("; ","").replace(", ","")
    .replace("Version=1","").replace("Domain=.plataformadetransparencia.org.mx","")
    .split(", ").map(e => { return e.replace("; ","") })
  });
  // console.log("cookieValues",cookieValues)
  let joined = cookieValues.map(c => { return c.join("; ") });
  let rejoined = joined.join("; ").replace(/; ;/g,";")
  // console.log("headersToCookieString",rejoined)
  return rejoined;
}

//Filter excluded
function filterDestinatarios(destinatarios) {
  console.log("Destinatarios seleccionados:")
  let destinatarios_filtered = [];
  for (d in destinatarios) {
    // console.log(d,destinatarios[d],isExcluded(exclusion_patterns,destinatarios[d].nombre));
    if (isIncluded(filters,destinatarios[d].nombre) && !isExcluded(filters,destinatarios[d].nombre)) {
      console.log(destinatarios[d].nombre)
      destinatarios_filtered.push(destinatarios[d])
    }
    else {
      // console.log(",\"",destinatarios[d].nombre.replace("\"","").replace("\"",""),"\",\"\"")
    }
  }

  return destinatarios_filtered
}


//Test if the name is on the exclussion patterns regular expression list
function isExcluded(filters,name) {
  return filters.excluidos.some(pattern => {
    regex = new RegExp(pattern);
    return regex.test(name)
  })
}

//Test if the name is on the inclussion patterns regular expression list
function isIncluded(filters,name) {
  return filters.incluidos.some(pattern => {
    regex = new RegExp(pattern);
    return regex.test(name)
  })
}

//Create batches of destinatarios for each request, filter excluded
function getBatches(destinatarios) {
  let batches = [];
  let destinatario_number = 0;
  for (d in destinatarios) {
    // console.log(d,destinatarios[d],isExcluded(exclusion_patterns,destinatarios[d].nombre));
    batch_number = Math.floor(destinatario_number/batch_size);
    if (!batches[batch_number]) { batches[batch_number] = "" }
    batches[batch_number] +=destinatarios[d].estado+"_"+destinatarios[d].id+"_"+destinatarios[d].nombre+"|";
    destinatario_number++;
  }

  // console.log(batches);
  return batches
}


function runBatches(batches,first,cookie) {
  if (first == 0) {
    console.log("Cantidad de destinatarios seleccionados:",destinatarios_filtrados_count,"(de un total de", destinatarios_totales, ") en",estados_count,"estados. Se realizarán",(batches.length),"solicitudes de",batch_size,"destinatarios cada una.");
  }
  else {
    console.log("Continuando con solicitudes a:",destinatarios_filtrados_count," destinatarios selecionados (de un total de", destinatarios_totales, ") en",estados_count,"estados. Restan",(batches.length-first),"solicitudes de",batch_size,"destinatarios cada una.");
  }

  nextBatch(batches,first,cookie);
}

function nextBatch(batches,b,cookie) {
    const destinatarios_batch = batches[b];
    if (!destinatarios_batch) {
      console.error("Solicitud sin destinatarios. Terminando.");
      return false;
    }

    const options = {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:68.0) Gecko/20100101 Firefox/68.0",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Cookie": cookie
        },
        "referrer": "https://www.plataformadetransparencia.org.mx/group/guest/crear-solicitud",
        "body": "destinatarios="+encodeURIComponent(destinatarios_batch)+"&informacionSolicitada="+encodeURIComponent(mensaje)+"&idTipoSolicitante=1&nombre=a&apellidoPaterno=&apellidoMaterno=&archivo=&contentType=&idModalidadEntrega=1&pais=131&tipoSolicitud=2&sexo=M&fechaNacimiento=&estadoExtranjero=&ciudadExtranjero=&codigoPostalExtranjero=&coloniaExtranjero=&calleExtranjero=&numeroExtExtranjero=&numeroIntExtranjero=&estado=&municipio=&codigoPostal=&colonia=&calle=&numeroExt=&numeroInt=&paisNombre=M%C3%A9xico&estadoNombre=&municipioNombre=&coloniaNombre=&datosComprobatorios=&idTipoDerecho=&idRecibirNotificacion=1&repLegalPersona=&breveDescripcion=&lenguaIndigena=&entidadIndigena=&municipioIndigena=&idFormatoAccesible=&accesibilidad=&otraAccesibilidad=&puebloIndigena=0&puebloIndigenaTxt=&nacionalidad=&idOcupacion=0&otrosAmbitos=&tipoSolicitudCAS=&foliomanualCAS=&curpCAS=&telefonoCAS=&correoCAS=&correoNotificacion="+encodeURIComponent(user),
        "method": "POST",
        "mode": "cors"
    };
    console.log("Realizando solicitud número",(b+1),"de",batches.length," para ",(destinatarios_batch.split("|").length -1), "destinatarios.")
    console.log("Por favor tenga paciencia...")

    fetch("https://www.plataformadetransparencia.org.mx/group/guest/crear-solicitud?p_p_id=infomexportlet_WAR_infomexportlet100SNAPSHOT&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=controllerEnviarSolicitud&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_pos=2&p_p_col_count=3", options)
    .then(res => {
      // console.log(text);
      try {
        return res.json()
      }
      catch(e) {
        console.error("Error al crear solicitud - Por favor renueve la cookie o disminuya la cantidad de destinatarios por debajo de 25. Error de JSON.",e);
        console.error("Detalles de soliciutd",res.text())
        return { errors: ["Error al crear solicitud - Se debe renovar la sesión"]}
      }
    } ).catch(e => {
      console.error("Error al crear solicitud - Se debe renovar la sesión",e);
      // console.log("res:",res,res.text())

      console.log("Iiniciando sesión nuevamente...")
      login(batches,runBatches,b);

      return { errors: ["Error al crear solicitud - Se debe renovar la sesión"]}

    })
    .then(json => {
      if (json.errors && json.errors.length > 0) {
        console.error("Error remoto al crear solicitud.",b,destinatarios_batch,json.errorEdosDep);
        console.log(JSON.stringify(json));
      }
      else {
        // console.log("Solicitud creada número",b,"de",batches.length);

        //parse json
        for (r in json.result) {
          let folio = json.result[r].folio; //0917100005619;
          let token = json.result[r].token; //F240907BC6D503F1E477D3B026826B303DD6D589;
          let estado = json.result[r].identificador; //cam
          //e30.eyJleHAiOiIxNjI1ODY3OTc4IiwiZ3VpZHVzdWFyaW8iOiI1ODU5NTM2In0.8PvQMWVwJoOBdl5Ov7747Q73R1J7f8S4J60Y2pSku30
          let pdf_filename = estado+"-"+folio+'-'+token;

          getPDF(folio,token,estado,pdf_filename,cookie,destinatarios_batch,r);


        }

        if (batches.length == (b+1)) {
          console.log("Terminadas todas las solicitudes. Abreportales ha finalizado.")
        }
        else {
          let waitMs= 1000*30;
          console.log("Esperando",waitMs,"milisegundos");
          setTimeout(function () {
            nextBatch(batches,b+1,cookie);
          },waitMs)
        }

        // nextBatch(batches,b+1,cookie);
      }

    });
    // console.log("Fin tanda: ",b);



};
// console.log("Fin todas las tandas.");


function getPDF(folio,token,estado,pdf_filename,cookie,destinatarios_batch,r) {
  // console.log("Solicitando acuse PDF...",folio,token);

  let alldesties = [];
  destinatarios_batch.split("|").map((d,i) => {
    let dest_components = d.split("_");
    let dest_state = dest_components[0]
    let dest_name = dest_components[(dest_components.length-1)]
    alldesties.push(dest_name+" ("+dest_state+", "+(i+1)+")");
  })

  //SAVE pdf
  const pdfurl = "https://www.plataformadetransparencia.org.mx/group/guest/crear-solicitud?p_p_id=infomexportlet_WAR_infomexportlet100SNAPSHOT&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=urlDescargaAcuse&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_pos=2&p_p_col_count=3&_infomexportlet_WAR_infomexportlet100SNAPSHOT_idInfomex="+estado+"&_infomexportlet_WAR_infomexportlet100SNAPSHOT_folio="+folio+"&_infomexportlet_WAR_infomexportlet100SNAPSHOT_token="+token+"&_infomexportlet_WAR_infomexportlet100SNAPSHOT_idTipo=100";

  fetch(pdfurl,{
    "credentials": "include",
    "headers": {
      "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:68.0) Gecko/20100101 Firefox/68.0",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      "Cookie": cookie

    },
    "referrer": "https://www.plataformadetransparencia.org.mx/group/guest/crear-solicitud"
  })
  .then(res => {
    const dest = fs.createWriteStream(pdf_path+pdf_filename+'.pdf');
    const destJson = fs.createWriteStream(json_path+pdf_filename+'.json');

    let pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", errData => console.error("pdfParser_dataError",errData.parserError) );
    pdfParser.on("pdfParser_dataReady", pdfData => {
      // getPDFText(pdfData,[15,35,36,39,40,41,44,46,47,50,54,53])

      console.log("Acuse folio", folio," para ",alldesties[r], ". Guardado en",pdf_path+pdf_filename+'.pdf')

      fs.writeFile(json_path+pdf_filename+".json", JSON.stringify(pdfData),(err) => {
       if (err) throw err;
       // console.log('Creado',json_path+pdf_filename+".json");
     })
    });

    //Write PDF
    res.body.pipe(dest);
    //Write JSON
    res.body.pipe(pdfParser);
  })
}

function getPDFText(pdfData,indices) {
  for (i in indices) {
    return (indices[i],decodeURIComponent(pdfData.formImage.Pages[0].Texts[indices[i]].R[0].T));
  }
}

function showDestinatarios(destinatarios) {
  for(d in destinatarios) {
    de = destinatarios[d];
    console.log(de.nombre,de.estado)
  }
}


function prepareConsole() {
  fixConsole("log");
  fixConsole("error");

}

function fixConsole(method) {

  var log = console[method];

  console[method] = function () {
      var first_parameter = arguments[0];
      var other_parameters = Array.prototype.slice.call(arguments, 1);

      function formatConsoleDate (date) {
          var hour = date.getHours();
          var minutes = date.getMinutes();
          var seconds = date.getSeconds();
          var milliseconds = date.getMilliseconds();

          return '[' +
                 ((hour < 10) ? '0' + hour: hour) +
                 ':' +
                 ((minutes < 10) ? '0' + minutes: minutes) +
                 ':' +
                 ((seconds < 10) ? '0' + seconds: seconds) +
                //  '.' +
                //  ('00' + milliseconds).slice(-3) +
                 '] ';
      }

      log.apply(console, [formatConsoleDate(new Date()) + first_parameter].concat(other_parameters));
  };
}
