const MongoClient = require('mongodb').MongoClient

module.exports = {
  async connection() {
    const url = process.env.MONGO_HOST
    const client = await MongoClient.connect(url, {
      auth: {
        user: process.env.MONGO_USER,
        password: process.env.MONGO_PASSWORD
      },
      useNewUrlParser: true
    })
    return client.db(process.env.MONGO_DATABASE)
  },
  async getCollection(dbPromise, collectionName) {
    const database = await dbPromise
    return await database.collection(collectionName)
  }
}