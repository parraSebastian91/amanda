const Request = require('tedious').Request
const TYPES = require('tedious').TYPES
const Connection = require('tedious').Connection
const proveedor = require('../models/proveedor').proveedor
const columnsProveedor = require('../models/proveedor').columns


exports.getByName = async function (nombre) {
  let result = await getCollectionByName(nombre)
  if (result && result.stack) {
    console.log('Error: proveedor [ getByName - TimeOut SQL]')
    return { error: '504' }
  }
  return result
}

function getCollectionByName(nombre) {
  return new Promise((resolve, reject) => {

    let connection = new Connection(require('../functions/db/config').configAzure())
    connection.on('connect', function (err) {
      request = new Request(`select top 1 * from serviciotecnico where nombre_marca = @nombre`, function (err, rowCount, rows) {
        if (err) {
          //reject(err)
          connection.close()
          resolve(err)
        }
        if (rowCount == 0) {
          connection.close()
          resolve(new proveedor(nombre))
        }
        if (rowCount > 0) {
          connection.close()
        }
      })
      request.addParameter('nombre', TYPES.NVarChar, nombre)
      request.on('row', function (columns) {
        let proveedorObject = new proveedor()
        proveedorObject.cargar(columns)
        resolve(proveedorObject)
      })
      connection.execSql(request)
    })
  })
}