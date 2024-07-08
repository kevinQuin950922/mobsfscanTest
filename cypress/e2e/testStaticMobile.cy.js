const FormData = require('form-data');
const fs = require('fs');
let hash="";
let apiKey=""

describe('Se consumen los servicios de la API de mobsf para realizar el analisis estatico', () => {
  it('Se realiza el login a mobsf y se extrae el apiKey',()=>{
    cy.visit('http://0.0.0.0:8000');
    cy.get(':nth-child(2) > .form-control').type("mobsf");
    cy.get(':nth-child(3) > .form-control').type("mobsf");
    cy.get('.col-12 > .btn').click();
    cy.get('.nav > [href="/api_docs"]').click()
    cy.get('strong > code').invoke('text').then(key => {
      apiKey=key;
    });
  });

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
  it('se descarga pdf', () => {
    const body={
      "hash":hash
    };
    cy.request({
      method: 'POST',
      url: 'api/v1/download_pdf',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body,
      encoding: 'binary'
    }).then((response) => {
      expect(response.status).to.equal(200);
      cy.writeFile('report/pdf/report.pdf', response.body, 'binary');
    });
  });

});