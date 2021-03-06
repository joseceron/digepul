const path = require('path')
const express = require('express')
const hbs = require('hbs')
const formidable = require('formidable')
const chalk = require('chalk')
const functions = require('./utils/functions.js')
const request = require('./utils/rest.js')
node_xj = require("xls-to-json")
const fs = require('fs')
// const xlsx = require('tfk-json-to-xlsx')

const app = express()
const port = process.env.PORT || 3000

// Define parth for Express config
const publicDirectoryPath = path.join(__dirname, '../public')//this folder
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup handlebarsbars and views location
app.set('view engine', 'hbs')//needs to matches exactly for letting express what to do
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))


app.get('', (req, res) => {
    res.render('index', {
        title: 'Módulo carga',
        name: 'Seratic SAC',
        message: 'Inicio'

    })
})



app.post('/task', (req, res) => {
    console.log('Entrada method: ' + req.method)
    
    
    new formidable.IncomingForm().parse(req)
        .on('field', (name, field) => {
            // console.log('Field', 'Nombre:' + name, 'ARCHIVO:' + field)

        })
        .on('file', (name, file) => {
            console.log('File', 'Nombre:' + name, 'ARCHIVO:' + file)
           

            //pasa a json el archivo Excel
            functions.excelToJson(file.path, (error, msg) => {
                if (error) {
                    return console.log(chalk.red.inverse('Error escribiendo JSONPedidos:' + error))
                }
                console.log(chalk.green.inverse('call: ' + msg))

                //Call back para procesamiento del json
                functions.functions2('', (err, message) => {
                    if (err) { return console.log('Error en ArrayIds: ' + err) }
                    console.log(chalk.green.inverse('Fin set arraysIds: ' + message))

                    //envío al api de puerto del gv para registro de facturas
                    request.postAPI(functions.loadDocumentos(), (error, msg) => {
                        if (error) {
                            return console.log(chalk.red.inverse('Error escribiendo JSONPedidos:' + error))
                        }
                        console.log(chalk.green.inverse('call: ' + msg))
                        
                        functions.removeDocumentos();
                        res.send({
                            mensaje: 'respuesta'
                        })
                        
                        res.end()
                    })
                })
            })
        })
        .on('aborted', () => {
            console.error('Request aborted by the user')
        })
        .on('error', (err) => {
            console.error('Error', err)
            throw err
        })
        .on('end', () => {
            console.log('end')
           

        })



})

// This metod needs to be last
app.get('/descarga', (req, res) => {

var file = __dirname + '/Errores.xlsx';
console.log(file)

 res.download(file)


})



// This metod needs to be last
app.get('*', (req, res) => {
    res.render('404', {
        title: '404',
        name: 'Seratic SAC',
        errorMessage: 'Page not found.'
    })
})

//for initialize the server, must be call just once
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})