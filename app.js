#!/bin/node
fetch = require("node-fetch");
fs = require("fs");
var dotenv = require('dotenv')
dotenv.config();
PDFParser = require("pdf2json");

//Config
const user = process.env.ABREPORTALES_PNT_USER; //"data@rindecuentas.org";
const password = process.env.ABREPORTALES_PNT_PASSWORD; //"Y8wmzjWupBYroyiJumz";
//jsessionid,  id, USER_UUID, COMPANY_ID,LFR_SESSION_STATE_5859536
const cookie = process.env.ABREPORTALES_PNT_COOKIE; // 'FACEBOOK_ACCESS_TOKEN_COOKIE=testing; JSESSIONID=0se0aJCArAkUUkqKfCUvK0jq; COOKIE_SUPPORT=true; GUEST_LANGUAGE_ID=es_ES; USER_UUID="rFvOQqkUNNWsTQs5fLfvzW6zTgQK6Cy+q72ePreu1sE="; LFR_SESSION_STATE_5859536=1563565729155; COMPANY_ID=10154; ID=335350674553336d4934647647445a4b4e45776a39773d3d';

const mensaje_file = process.env.ABREPORTALES_MENSAJE ||"./mensaje.txt";
const destinatarios_file = process.env.ABREPORTALES_DEPENDENCIA ||"./dependencias.json";
const exclusion_patterns_file = process.env.ABREPORTALES_EXCLUIDOS || "./excluidos.json"

const batch_size = process.env.ABREPORTALES_BATCH_SIZE || 5;
const pdf_path = process.env.ABREPORTALES_PDF_PATH || './pdf/';
const json_path = process.env.ABREPORTALES_JSON_PATH || "./json/";


//Read files
const mensaje = fs.readFileSync(mensaje_file, 'utf8');
const destinatarios = JSON.parse(fs.readFileSync(destinatarios_file, 'utf8'));
const exclusion_patterns = JSON.parse(fs.readFileSync(exclusion_patterns_file, 'utf8'));

// login(runBatches);
runBatches(cookie);
// getPDF("0917700005319","776975B773402D9D345BC611ABC44A298861C46F","0917700005319-776975B773402D9D345BC611ABC44A298861C46F");

//Create batches of destinatarios for each request
//var destinatarios = "gof_9171_ADMINISTRACI%C3%93N+PORTUARIA+INTEGRAL+DE+MAZATL%C3%81N%2C+S.A.+DE+C.V.%7C";
function getBatches() {
  let batches = [];
  destinatario_number = 0;
  for (d in destinatarios.catalogo) {
    // console.log(d,destinatarios.catalogo[d],isExcluded(exclusion_patterns,destinatarios.catalogo[d].nombre));
    if (!isExcluded(exclusion_patterns,destinatarios.catalogo[d].nombre)) {
      batch_number = Math.floor(destinatario_number/batch_size);
      if (!batches[batch_number]) { batches[batch_number] = "" }
      batches[batch_number] +="gof_"+destinatarios.catalogo[d].id+"_"+destinatarios.catalogo[d].nombre+"|";
      destinatario_number++;
    }
  }
  // console.log(batches);
  return batches;
}

//Test if the name is on the exclussion patterns regular expression list
function isExcluded(exclusion_patterns,name) {
  return exclusion_patterns.some(pattern => {
    regex = new RegExp(pattern);
    return regex.test(name)
  })
}

function runBatches(cookie) {
  const batches = getBatches();
  console.log("Iniciando. Cantidad de solictudes: ",batches.length);

  nextBatch(batches,0);
}

function nextBatch(batches,b) {
    const destinatarios = batches[b];
    let options = {
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
        "body": "destinatarios="+encodeURIComponent(destinatarios)+"&informacionSolicitada="+encodeURIComponent(mensaje)+"&idTipoSolicitante=1&nombre=a&apellidoPaterno=&apellidoMaterno=&archivo=&contentType=&idModalidadEntrega=1&pais=131&tipoSolicitud=2&sexo=M&fechaNacimiento=&estadoExtranjero=&ciudadExtranjero=&codigoPostalExtranjero=&coloniaExtranjero=&calleExtranjero=&numeroExtExtranjero=&numeroIntExtranjero=&estado=&municipio=&codigoPostal=&colonia=&calle=&numeroExt=&numeroInt=&paisNombre=M%C3%A9xico&estadoNombre=&municipioNombre=&coloniaNombre=&datosComprobatorios=&idTipoDerecho=&idRecibirNotificacion=1&repLegalPersona=&breveDescripcion=&lenguaIndigena=&entidadIndigena=&municipioIndigena=&idFormatoAccesible=&accesibilidad=&otraAccesibilidad=&puebloIndigena=0&puebloIndigenaTxt=&nacionalidad=&idOcupacion=0&otrosAmbitos=&tipoSolicitudCAS=&foliomanualCAS=&curpCAS=&telefonoCAS=&correoCAS=&correoNotificacion="+encodeURIComponent(user),
        "method": "POST",
        "mode": "cors"
    };
    console.log("Realizando solicitud #",b,". Cantidad de destinatarios:",destinatarios.length);

    fetch("https://www.plataformadetransparencia.org.mx/group/guest/crear-solicitud?p_p_id=infomexportlet_WAR_infomexportlet100SNAPSHOT&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=controllerEnviarSolicitud&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_pos=2&p_p_col_count=3", options).then(res => { return res.text() } )
    .then(text => {
      // console.log(text);
      try {
        return json = JSON.parse(text);
      }
      catch(e) {
        console.error("Error al crear solicitud - Por favor renueve la cookie",text);
        return {};
      }
    } )
    .then(json => {
      if (json.errors.length > 0) {
        console.error("Error al crear solicitud",b,destinatarios,json.errorEdosDep);
      }
      else {
        console.log("Solicitud creada #",b);

        //parse json
        for (r in json.result) {
          let folio = json.result[r].folio; //0917100005619;
          let token = json.result[r].token; //F240907BC6D503F1E477D3B026826B303DD6D589;
          let pdf_filename = folio+'-'+token;

          getPDF(folio,token,pdf_filename);


        }
        nextBatch(batches,b+1);
      }

    });
    // console.log("Fin tanda: ",b);



};
// console.log("Fin todas las tandas.");



function getPDF(folio,token,pdf_filename) {
  // console.log("Descargando PDF...",pdf_filename);

  //SAVE pdf
  const pdfurl = "https://www.plataformadetransparencia.org.mx/group/guest/crear-solicitud?p_p_id=infomexportlet_WAR_infomexportlet100SNAPSHOT&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=urlDescargaAcuse&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_pos=2&p_p_col_count=3&_infomexportlet_WAR_infomexportlet100SNAPSHOT_idInfomex=gof&_infomexportlet_WAR_infomexportlet100SNAPSHOT_folio="+folio+"&_infomexportlet_WAR_infomexportlet100SNAPSHOT_token="+token+"&_infomexportlet_WAR_infomexportlet100SNAPSHOT_idTipo=100";

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

    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
    pdfParser.on("pdfParser_dataReady", pdfData => {
      // getPDFText(pdfData,[15,35,36,39,40,41,44,46,47,50,54,53])
      console.log("Respuesta de ",getPDFText(pdfData,[15]),"en fecha",getPDFText(pdfData,[39]), "folio", folio)
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

//Login to PNT and run callback
function login(callback) {
  console.log("Login",user);
  //form_date 1563555061602
  // _58_formDate
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

      const login_cookie = 'FACEBOOK_ACCESS_TOKEN_COOKIE=testing; JSESSIONID=4+hjesVbu+GO8JEXt+-S-4gU; COOKIE_SUPPORT=true; GUEST_LANGUAGE_ID=es_ES; USER_UUID="MqYe4rI5lDA2thSEChFP8wYTxLCd7JoDN18Lu27jDZc="; LFR_SESSION_STATE_5859536=1563559809683'

      first_position = text.indexOf("_58_formDate")+35;
      second_position = text.indexOf("_58_saveLastPath") - first_position - 31;
      form_date = text.substr(first_position,second_position);
      console.log("Login 1",form_date, resdata.headers);
      //login
      fetch("https://www.plataformadetransparencia.org.mx/web/guest/inicio?p_p_id=58&p_p_lifecycle=1&p_p_state=maximized&p_p_mode=view&_58_struts_action=%2Flogin%2Flogin", {
        "credentials": "include",
        "headers": {
          "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:68.0) Gecko/20100101 Firefox/68.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/x-www-form-urlencoded",
          "Upgrade-Insecure-Requests": "1",
          "Cookie": login_cookie
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
          console.log("Login 2 - headers",resdata.headers);
          const login_cookie = 'JSESSIONID=4+hjesVbu+GO8JEXt+-S-4gU; COOKIE_SUPPORT=true; GUEST_LANGUAGE_ID=es_ES; USER_UUID="mxGK7V90NNpzFqBv4LOXBTW4Gi4Lmnz+M6ioMTp5Op8="; COMPANY_ID=10154; ID=335350674553336d4934647647445a4b4e45776a39773d3d';
          fetch(resdata.headers.get("location"),  {
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
            console.log("Login 3 - headers",resdata.headers.get("set-cookie"));
            const cookie = 'FACEBOOK_ACCESS_TOKEN_COOKIE=testing; JSESSIONID=4+hjesVbu+GO8JEXt+-S-4gU; COOKIE_SUPPORT=true; GUEST_LANGUAGE_ID=es_ES; USER_UUID="MqYe4rI5lDA2thSEChFP8wYTxLCd7JoDN18Lu27jDZc="; LFR_SESSION_STATE_5859536=1563559801574; COMPANY_ID=10154; ID=335350674553336d4934647647445a4b4e45776a39773d3d';

            console.log("Login 3 - codes recieved",cookie);

            console.log("Login 3",text.indexOf("user-full-name"));
            if(text.indexOf("user-full-name") != -1) {
              console.log("Login success",text.substr(text.indexOf("user-full-name")+16,20));
              callback(cookie);
            }
            else {
              console.error("Login failed");
            }
          })
        });
      })
    })
  })
})
};
