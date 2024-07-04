const FormData = require('form-data');
const fs = require('fs');
let hash="";
const apiKey="bc6ba3b7b8e82f082b5cb966c1f86a24d95725b072c44a010cdb234c4fa8d19b"

describe('Se consumen los servicios de la API de mobsf para realizar el analisis estatico', () => {
  it('Se sube el apk para poder analizarla', () => {
    const filepath ='flypassParquimetrosV59.apk';
    cy.fixture(filepath, 'binary')
        .then((file) => Cypress.Blob.binaryStringToBlob(file))
        .then((blob) => {

            const formdata = new FormData();
            formdata.append("file", blob, filepath);
            cy.request({
                url: "/api/v1/upload",
                method: "POST",
                headers: {
                    Authorization: apiKey,
                    'content-type': 'multipart/form-data'
                },
                body: formdata
            }).then(
              (response)=>{
                const buffer = new Uint8Array(response.body);
                const decodedString = new TextDecoder('utf-8').decode(buffer);
                const responseBody = JSON.parse(decodedString);
      
                // Verificar la respuesta
                expect(response.status).to.equal(200);
                hash=responseBody["hash"]
            });
        })
  });
  it('Se escanea la aplicación',() =>{
    const body={
      "scan_type":"apk",
      "hash":hash
    };
    cy.request({
      url: "/api/v1/scan",
      method: "POST",
      headers: {
          Authorization: apiKey,
          'content-type': 'application/x-www-form-urlencoded'
      },
      body: body,
    }).then((response)=>{
      // Verificar la respuesta
      expect(response.status).to.equal(200);
    });
  });

  it('se extrae el reporte en formato json',()=>{
    const body={
      "hash":hash
    };
    cy.request({
      url: "/api/v1/report_json",
      method: "POST",
      headers: {
          Authorization: apiKey,
          'content-type': 'application/x-www-form-urlencoded'
      },
      body: body,
    }).then((response)=>{
      expect(response.status).to.equal(200);
      const reporte = response.body
      cy.writeFile('report/reporteMobsf.json',reporte);
    });
  });

});