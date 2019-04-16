const fs = require('fs')
const chalk = require('chalk')
const xlsx = require('tfk-json-to-xlsx')
node_xj = require("xls-to-json")



const excelToJson = (path, callback) => {

    console.log("exportando!")

    if ( loadNotes().length === 0){
        console.log('JsonPedidos tamaño = 0')
        node_xj( {
            input: path,  // input xls
            output: "./files/ItemspedidosJSON.json",  // output json
            sheet: "Facturas"  // specific sheetname
        }, function (err, result) {
            if (err) {
                 callback('error',false) // error creando archivo
            } else {             
                 callback('','Archivo JsonPedidos creado, '+ result.length + ' pedidos') //archivo creado
            }
        }    
        );
    }
    else{
        
        console.log('Paso de json creado')
         callback('','Archivo JSONPedidos existente, '+ loadNotes().length+ ' pedidos') //archivo existente
    }   

} 

const functions2 = (input, callback) => {
    console.log('Inicio functions2')
  
    
    console.log('facturas tamaño' +  loadDocumentos().length)
    do{
        //loadNotes carga los items del pedido
        setTimeout(()=>{     
            console.log('prueba de ccarga')     
            listNotes() //guardar el array de idsFacturas
            setDocumentos() 
            console.log('Cantidad facturas: '+loadDocumentos().length)
            if(loadDocumentos().length > 0){ callback('','Fin proceso' +loadDocumentos().length)}
        },2000)
    }while (loadDocumentos().length > 0)
    
 
}



const listNotes = () => {
    //read ItemspedidosJSON
   
    console.log('cantidad items en pedidos:  '+loadNotes() .length)
    const notes = loadNotes()   
       
    notes.forEach((note) => {            
        //1. Grabar idFactura[] sin repetir            
        addIdFactura(note.NUMERO_DE_DOCUMENTO_VENTA)
    })      
   
   
    
 
    
    
}

const setDocumentos = ()=>{
     //read idFacturaJson
    const idsFacs= loadIds()
    removeDocumentos();
    idsFacs.forEach((idFac)=>{
        //filtrar las facturas por id       
        //guardar la factura repetida
       addDocumento(idFac)
        
    })
}


//Facturas desde el excel sin formato
const loadNotes= ()=>{
    try {                                   
        const dataBuffer = fs.readFileSync('./files/ItemspedidosJSON.json')
        const dataJSON = dataBuffer.toString()
        return JSON.parse(dataJSON)
    } catch (e) {
        return []
    }

}
//Array de idFacturas filtrado
const loadIds= ()=>{
    try {
        const dataBuffer = fs.readFileSync('./files/idsJSON.json')
        const dataJSON = dataBuffer.toString()
        return JSON.parse(dataJSON)
    } catch (e) {
        return []
    }

}
//get Documentos a enviar al API
const loadDocumentos= ()=>{
    console.log('inicio loadDocumentos')
    try {
        const dataBuffer = fs.readFileSync('./files/documentosJSON.json')
        const dataJSON = dataBuffer.toString()
        console.log('inicio loadDocumentos: try exitoso')
        return JSON.parse(dataJSON)
    } catch (e) {
        console.log('inicio loadDocumentos error: ' + e)
        return []
    }

}


const addIdFactura = (idFactura)=>{
    
    const facs=loadIds()
    
    const duplicateNote = facs.find((fac)=>fac.NUMERO_DE_DOCUMENTO_VENTA === idFactura)
       
    if(!duplicateNote){
        facs.push({
            NUMERO_DE_DOCUMENTO_VENTA: idFactura,            
        })
        saveIdsFacturas(facs)
        console.log('Nuevo IdFactura agregado al array!')
    }
    else{
        console.log(chalk.gray.inverse('IdFactura ya existente!'))
    }
 
}



const addNote = (idFactura)=>{
    const notes=loadNotes()
    //this array would be 0 if there is no duplicates
    //const duplicateNotes = notes.filter((note)=>note.title === title)
    const duplicateNote = notes.find((note)=>note.idFactura === idFactura)
    // if(duplicateNotes.length === 0){
   
    if(!duplicateNote){
        notes.push({
            title: title,
            
        })
        saveNotes(notes)
        console.log('New note added!')
    }
    else{
        console.log('Note title taken!')
    }
 
}

const addDocumento = (idFac)=>{
    //documento a enviar a api
    const documentos=loadDocumentos()
    //Facturas del excel
    const notes=loadNotes()
    //this array would be 0 if there is no duplicates
    //const duplicateNotes = notes.filter((note)=>note.title === title)
    const facsToKeep = notes.filter((note) =>
    note.NUMERO_DE_DOCUMENTO_VENTA === idFac.NUMERO_DE_DOCUMENTO_VENTA)
    //const duplicateDocumentos = documento.find((documento)=>documento.idFactura === idFactura)
    // if(duplicateNotes.length === 0){
    //console.log(facsToKeep.length)
    if(facsToKeep.length>0){
        
        const ceroDecimal= 0.0     

        const detallePedido=[]

        facsToKeep.forEach((doc) => {
            detallePedido.push({
                codProducto:doc.CODIGO_JDE_PRODUCTO,
                codUnidad:doc.TIPO_ENVASE,
                cantidad:doc.CANTIDAD_UNIDAD_VENTA,
                precio:ceroDecimal,
                descuento:ceroDecimal,
                motivoDevolucion:0,
                serie:"",
                codListaPrecio:null
            })
        });

        const listaDatosRelevo=[]       
        listaDatosRelevo.push(
            {//Fecha factura
            codProducto:"",
            codComponente:82,
            valor:facsToKeep[0].FECHA_DE_VENTA
            },
            {//Número de Factura
            codProducto:"",
            codComponente:83,
            valor:facsToKeep[0].NUMERO_DE_DOCUMENTO_VENTA
            },
            {//Tipo documento
            codProducto:"",
            codComponente:134,
            valor:facsToKeep[0].TIPO_DOCUMENTO_VENTA
            }
        )
        
       
        const relevo=[]      
        relevo.push({
                idDocumento:facsToKeep[0].NUMERO_DE_DOCUMENTO_VENTA,
                codActividad:3,
                codCategoria:null,
                comentario:"",
                //fechaHora:facsToKeep[0].FECHA_DE_VENTA.concat("T12:00:00-05:00")
                idPedido:null,
                listaSeleccionados:null,
                listaDatosRelevo: listaDatosRelevo,
                listDetallePedidos: detallePedido
        })
              

        documentos.push({
            motivoVisita:"",
            tipoRegistro: "5",
            codCliente:  facsToKeep[0].CODIGO_DISTRIBUIDOR_CLIENTE_DE_VENTA,
            usuario:facsToKeep[0].VENDEDOR,
            fechaInicio:facsToKeep[0].FECHA_DE_VENTA.concat("T12:00:00-05:00"),
            fechaFin:facsToKeep[0].FECHA_DE_VENTA.concat("T12:10:00-05:00"),
            latitudInicial:ceroDecimal,
            latitudFinal:ceroDecimal,
            longitudInicial:ceroDecimal,
            longitudFinal:ceroDecimal,
            idCita:null,
            comentario:null,
            efectividad:true,        
            contactos:null,
            relevos: relevo
               
            
        })
        
        console.log('Cantidad Documentos: '+documentos.length)       
         saveDocumentos(documentos)
        
    }
    else{
        console.log('Documento existente!')
    }
 
}

const readNote = (title) => {
    const notes = loadNotes()
    const note = notes.find((note)=>note.title === title)

    if(note){
        console.log(chalk.inverse(note.title))
        console.log(note.body)
    }else{
        console.log(chalk.red.inverse('Note not found'))
    }
}


const saveDocumentos =  (notes)=>{
    console.log('guardando documentosJSON.json')
    const dataJSON = JSON.stringify(notes)
    
    fs.writeFileSync('./files/documentosJSON.json',dataJSON)
}

const saveNotes =  (notes)=>{
    const dataJSON = JSON.stringify(notes)
    fs.writeFileSync('./files/ItemspedidosJSON.json',dataJSON)
}

const saveIdsFacturas =  (notes)=>{
    const dataJSON = JSON.stringify(notes)
    fs.writeFileSync('./files/idsJSON.json',dataJSON)
}



const removeNote = (idFactura) =>{
    const notes=loadNotes()
    const notesToKeep = notes.filter((note) =>note.idFactura !== idFactura)

    if(notes.length > notesToKeep.length){
        console.log(chalk.green.inverse('Note removed!'))
        saveNotes(notesToKeep)
    }else{
        console.log(chalk.red.inverse('No note found'))
    }

}

const removeDocumentos = () =>{ 
    const notesToKeep = []
    saveDocumentos(notesToKeep)
    
}

const removeLogs = () =>{ 
    const notesToKeep = []
    saveLogs(notesToKeep)
    
}





module.exports =

{  
    addNote: addNote,
    addIdFactura:addIdFactura,
    removeNote: removeNote,
    loadNotes: loadNotes,
    listNotes: listNotes,
    readNote: readNote,
    saveNotes: saveNotes,
    loadIds:loadIds,
    loadDocumentos:loadDocumentos,
    addDocumento:addDocumento,
    setDocumentos:setDocumentos,
    node_xj:node_xj,
    excelToJson:excelToJson,
    functions2: functions2,
    removeDocumentos:removeDocumentos,
    saveDocumentos
  
    
}