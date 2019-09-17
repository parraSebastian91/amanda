const mongoDB = require("./mongodb")

module.exports = {
  async connection() {
    return await mongoDB.connection()
  },
  async registerConversation(db, collectionName) {
    return await mongoDB.getCollection(db, collectionName)
  }
}