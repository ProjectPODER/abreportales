const fetch = require("node-fetch");
const fs = require("fs");

const url_sistemas = "https://esbmx.inai.org.mx/infomex3/sistemas_infomex";
const dependencias_path = "dependencias/"

async function get_dependencias() {

    fetch(url_sistemas).then(res => { 
      // console.log(text);
      try {
        return res.json() 
      }
      catch(e) {
        console.error("Error descargar listado de sistemas",text);
        return {};
      }
    } )
    .then(async json => {
      if (json.errors && json.errors.length > 0) {
        console.error("Error al interpretar listado de sistemas",text,json);
      }
      else {
        console.log("Descargado listado de sistemas");
    
        //parse json
        for (let s in json.sistemasInfomex) {
          let sistema = json.sistemasInfomex[s];
          if (sistema.clase == "Estados y Municipios") {
            let idInfomex = sistema.idInfomex;
            const url_sistema = "https://esbmx.inai.org.mx/infomex3/"+idInfomex+"/dependencias";
            console.log("Leyendo dependencias de",url_sistema);
    
            try {
                fetch(url_sistema)
                    .then(res2 => {   
                        const dest = fs.createWriteStream(dependencias_path+idInfomex+'.json');
                        try {
                            res2.body.pipe(dest);
                            console.log("Escrito",idInfomex)
                        }
                        catch(e) {
                            console.error("Error al interpretar",idInfomex, e)
                        }
                        
                    } )
                    .catch(e => {
                        console.error("Error al descargar",idInfomex,e);
                    })                    
                await sleep(1000);
            }
            catch(e) {
                console.error("Error al descargar",idInfomex,e);

            }
            
    
    
          }
        }
      }
    
    });
}

//from https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}   

get_dependencias()