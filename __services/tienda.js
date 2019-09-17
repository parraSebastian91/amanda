const Request = require('tedious').Request
const TYPES = require('tedious').TYPES
const Connection = require('tedious').Connection
const tienda = require('../models/tienda').tienda
const columnsTienda = require('../models/tienda').columns

exports.getByName = async function (nombre) {
  let result = await getCollectionByName(nombre)
  if (result && result.stack) {
    console.log('Error: [ getByName - TimeOut SQL]')
    return { error: '504' }
  }
  return result
}
exports.getAllByName = async function (nombre) {
  let result = await getAllCollectionByName(nombre)
  if (result && result.stack) {
    console.log('Error: [getAllByName - TimeOut SQL]')
    return { error: '504' }
  }

  return result
}

function getCollectionByName(nombre) {
  return new Promise((resolve, reject) => {
    let conexion = new Connection(require('../functions/db/config').configAzure())
    conexion.on('connect', function (err) {
      console.log(`select top 1 ${columnsTienda()} from tienda where nombre_fantasia like '%${nombre}%' or nombre_tienda like '%${nombre}%'`)
      request = new Request(`select top 1 ${columnsTienda()} from tienda where nombre_fantasia like '%${nombre}%' or nombre_tienda like '%${nombre}%'`, function (err, rowCount, rows) {
        if (err) {
          //reject(err)
          conexion.close()
          resolve(err)
        }
        if (rowCount == 0) {
          conexion.close()
          resolve(new tienda(nombre))
        }
        if (rowCount > 0) {
          conexion.close()
        }
      })
      request.addParameter('nombre', TYPES.NVarChar, nombre)
      request.on('row', function (columns) {
        let store = new tienda()
        store.cargar(columns)
        resolve(store)
      })
      conexion.execSql(request)
    })
  })
}

function getAllCollectionByName(nombre) {
  return new Promise((resolve, reject) => {
    let conexion = new Connection(require('../functions/db/config').configAzure())
    conexion.on('connect', function (err) {
      console.log(`select  ${columnsTienda()} from tienda where nombre_fantasia like '%${nombre}%' or nombre_tienda like '%${nombre}%'`)
      request = new Request(`select  ${columnsTienda()} from tienda where nombre_fantasia like '%${nombre}%' or nombre_tienda like '%${nombre}%'`, function (err, rowCount, rows) {
        if (err) {
          //reject(err)
          conexion.close()
          resolve(err)
        }
        if (rowCount == 0) {
          resolve(new tienda(nombre))
          conexion.close()
        }
        if (rowCount > 0) {
          conexion.close()
        }
      })
      request.addParameter('nombre', TYPES.NVarChar, nombre)
      request.on('row', function (columns) {
        let store = new tienda()
        store.cargar(columns)
        resolve(store)
      })
      conexion.execSql(request)
    })
  })
}