/**
 * Connection to MongoDB
 * @type {[type]}
 */
const logConversation = require('./handle')
const dbMongo = logConversation.connection()

module.exports = {
  async registerLog(dataMessage, collectionName) {
    const collection = await logConversation.registerConversation(dbMongo, collectionName)
    collection.insertOne(dataMessage)
  },
  async logFeedback(results, getSentiment, pathOrigenFeedback) {
    const dataMessage = {
      commetSentiment: results.response,
      scoreSentiment: getSentiment.documents[0].score,
      pathOrigenFeedback: pathOrigenFeedback,
      createAt: new Date(Date.now())
    }
    logs.registerLog(dataMessage, process.env.COLECCION_LOG_FEEDBACK_MONGO)
  }
}