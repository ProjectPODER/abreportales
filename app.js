#!/bin/node
fetch = require("node-fetch");
fs = require("fs");
PDFParser = require("pdf2json");

const user = "data%40rindecuentas.org";
const cookie = "JSESSIONID=B2+cacIHC8fe5+j0VWGQ-CYt; COOKIE_SUPPORT=true; GUEST_LANGUAGE_ID=es_ES; COMPANY_ID=10154; ID=335350674553336d4934647647445a4b4e45776a39773d3d; USER_UUID=\"9wzax9FpC7yb9AcKyOoV3+EVslcURxEeEpeXE35y24w=\"; LFR_SESSION_STATE_5859536=1563503239852";
const mensaje_file = "./mensaje.txt";
const destinatarios_file = "./dependencias.json";

const mensaje = fs.readFileSync(mensaje_file, 'utf8');
const destinatarios = JSON.parse(fs.readFileSync(destinatarios_file, 'utf8'));

let batches = [];

//lista
//var destinatarios = "gof_9171_ADMINISTRACI%C3%93N+PORTUARIA+INTEGRAL+DE+MAZATL%C3%81N%2C+S.A.+DE+C.V.%7C";

for (d in destinatarios.catalogo) {
  // console.log(d,destinatarios.catalogo[d]);
  batchNumber = Math.floor(d/33);
  if (!batches[batchNumber]) { batches[batchNumber] = "" }
  batches[batchNumber] +="gof_"+destinatarios.catalogo[d].id+"_"+destinatarios.catalogo[d].nombre+"|";
}

//login
for (b in batches) {
  console.log("Realizando solicitud a",b,batches[b],mensaje);

  fetch("https://www.plataformadetransparencia.org.mx/group/guest/crear-solicitud?p_p_id=infomexportlet_WAR_infomexportlet100SNAPSHOT&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=controllerEnviarSolicitud&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_pos=2&p_p_col_count=3", {
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
    "body": "destinatarios="+destinatarios+"&informacionSolicitada="+mensaje+"&idTipoSolicitante=1&nombre=a&apellidoPaterno=&apellidoMaterno=&archivo=&contentType=&idModalidadEntrega=1&pais=131&tipoSolicitud=2&sexo=M&fechaNacimiento=&estadoExtranjero=&ciudadExtranjero=&codigoPostalExtranjero=&coloniaExtranjero=&calleExtranjero=&numeroExtExtranjero=&numeroIntExtranjero=&estado=&municipio=&codigoPostal=&colonia=&calle=&numeroExt=&numeroInt=&paisNombre=M%C3%A9xico&estadoNombre=&municipioNombre=&coloniaNombre=&datosComprobatorios=&idTipoDerecho=&idRecibirNotificacion=1&repLegalPersona=&breveDescripcion=&lenguaIndigena=&entidadIndigena=&municipioIndigena=&idFormatoAccesible=&accesibilidad=&otraAccesibilidad=&puebloIndigena=0&puebloIndigenaTxt=&nacionalidad=&idOcupacion=0&otrosAmbitos=&tipoSolicitudCAS=&foliomanualCAS=&curpCAS=&telefonoCAS=&correoCAS=&correoNotificacion="+user,
    "method": "POST",
    "mode": "cors"
  }).then(res => res.json())
  .then(json => {
    console.log("Resultado",json);

    //parse json
    for (r in json.result) {
      let folio = json.result[r].folio; //0917100005619;
      let token = json.result[r].token; //F240907BC6D503F1E477D3B026826B303DD6D589;
      let pdffilename = folio+'-'+token;

      console.log("Descargando...",pdffilename);

      //SAVE pdf
      let pdfurl = "https://www.plataformadetransparencia.org.mx/group/guest/crear-solicitud?p_p_id=infomexportlet_WAR_infomexportlet100SNAPSHOT&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=urlDescargaAcuse&p_p_cacheability=cacheLevelPage&p_p_col_id=column-1&p_p_col_pos=2&p_p_col_count=3&_infomexportlet_WAR_infomexportlet100SNAPSHOT_idInfomex=gof&_infomexportlet_WAR_infomexportlet100SNAPSHOT_folio="+folio+"&_infomexportlet_WAR_infomexportlet100SNAPSHOT_token="+token+"&_infomexportlet_WAR_infomexportlet100SNAPSHOT_idTipo=100";

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
        const dest = fs.createWriteStream('./'+pdffilename+'.pdf');
        res.body.pipe(dest);
      })
      .then(() => {
        console.log("PDF");
        let pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
        pdfParser.on("pdfParser_dataReady", pdfData => {
          console.log("PDF3");

          console.log(pdfData);
          fs.writeFile("./"+pdffilename+".json", JSON.stringify(pdfData));
        });

        pdfParser.loadPDF("./"+pdffilename+".pdf");
        console.log("PDF2");

      })
    }
  });


  console.log("Fin tanda: ",b);
  process.exit();

};
console.log("Fin.");
