const axios = require('axios')

module.exports = {
  async existsInLUIS(message) {
    const {
      data: resultLuis
    } = await axios.get(`${process.env.LUIS_MODEL_URL}${message}`)
    return resultLuis.intents[0].intent
  },
  async getDataLuis(message) {
    const {
      data: resultLuis
    } = await axios.get(`${process.env.LUIS_MODEL_URL}${message}`)
    return resultLuis
  }
}