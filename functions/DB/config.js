module.exports.database = {
  id: 'amanda-db'
}

module.exports.collection = {
  solicitud: {
    id: 'solicitud'
  },
  log: {
    id: 'log'
  },
  feedback: {
    id: 'feedback'
  },
  conversacion: {
    id: 'conversacion'
  }
}

module.exports.configAzure = function() {
  return {
    userName: process.env.AZURE_SQL_DATABASE_USERNAME,
    password: process.env.AZURE_SQL_DATABASE_PASSWORD,
    server: process.env.AZURE_SQL_DATABASE_SERVER,
    // If you are on Microsoft Azure, you need this:  
    options: {
      encrypt: true,
      database: process.env.AZURE_SQL_DATABASE_NAME
    }
  }
}
//, configMongo: function () { return configMongo }