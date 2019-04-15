const facturas = require('./functions.js')
const request = require('request');
node_xj = require("xls-to-json")
const xlsx = require('tfk-json-to-xlsx')

const postAPI = (facturasJSON, callback) => {

  request.post('/gettrackstest/', (req, res, next) => {

    return request({
      method: 'POST',
      url: 'http://34.224.125.60:8047/GestorVisitas/relevoActividad/facturarHistorico.action',
      //   headers: {
      //     "Content-Type": 'application/json',
      //     Authorization: 'token',
      //   },
      // body: bodyO,
      body: facturasJSON,
      json: true,
    }, (error, resp, body) => {
      if (!error) {
        console.log('Guardando logs' + resp.body)
        // facturas.saveLogs(resp.body)
        saveLogs(resp.body, facturasJSON)
        callback('', 'logs guardados')
      } else {
        res.send(null)
        callback('error', '')
      }
    })
  })
}



const saveLogs = (logs, facturasJSON) => {

  const mensaje = logs.mensaje
  const errs = logs.error
  // const rel = loadDocumentos()
  const rel = facturasJSON

  const err = []
  console.log('recibiendo logs')
  // console.log(logs.error)
  err.push({
    EXITOSO: logs.success + "",
    RESULTADO: logs.message,
    INDEX: "",
    MENSAJE: ""
  })
  errs.forEach((e) => {
    const pos = (parseInt(e.index)) - 1
    const factura = rel[pos].relevos
    const id = factura[0].idDocumento
    console.log(id)

    err.push({
      EXITOSO: "",
      RESULTADO: "",
      INDEX: e.index + " factura: " + id,
      MENSAJE: e.mensaje
    })
  })

  xlsx.write('./files/Errores.xlsx', err, function (error) {
    // Error handling here
    if (error) {
      console.error(error)
    }
  })

}

module.exports = {
  // request: request
  postAPI: postAPI,

}
