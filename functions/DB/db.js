var mongoClient = require('mongodb').MongoClient
var config = require("./config")

// `mongodb://${process.env.DATABASE_MONGO_USUARIO}:${process.env.DATABASE_MONGO_PASSWORD}@${process.env.DATABASE_MONGO_ENDPOINT}.documents.azure.com:10255/?ssl=true`

const HttpStatusCodes = {
  NOTFOUND: 404,
  CONFLICTED: 409
}

module.exports = class db {

  conectar() {
    return new Promise((resolve, reject) => {
      var url = process.env.STRING_CONECTION_MONGO

      mongoClient.connect(url, function(err, client) {
        if (err)
          reject(err)
        else
          resolve(client.db(process.env.DATABASE_MONGO))
      })
    })
  }

  crear(db, coleccion, document) {
    return new Promise((resolve, reject) => {
      db.collection(coleccion).insertOne(document, function(err, result) {
        if (err)
          reject(err)
        else
          resolve(result)
      })
    })
  }

  buscar(db, coleccion, document) {
    return new Promise((resolve, reject) => {

      var cursor = db.collection(coleccion).find({
        id: document.id
      })

      cursor.each(function(err, doc) {

        if (doc != null) {
          resolve(doc)
        } else {
          resolve()
        }
      })
    })
  }

  modificar(db, coleccion, document) {
    return new Promise((resolve, reject) => {
      db.collection(coleccion).replaceOne({
        "id": document.id
      }, document, function(err, result) {
        if (err)
          reject(err)
        else
          resolve(result)
      })
    })
  }

  guardarCollection(coleccion, document) {

    return this.conectar().then(db => {
      return this.buscar(db, coleccion, document).then(_ => {
        if (_)
          return this.modificar(db, coleccion, document)
        else
          return this.crear(db, coleccion, document)
      })
    })
  }
}