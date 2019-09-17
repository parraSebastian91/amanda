const request = require('request')
let accessKey = process.env.TEXT_ANALYTICS_KEY
let uri = process.env.TEXT_ANALYTICS_URL
let path = process.env.TEXT_ANALYTICS_SENTIMIENT_PATH

module.exports = {
  async getSentiment(result) {

    const bodyData = {
      json: true,
      headers: {
        'Ocp-Apim-Subscription-Key': accessKey,
      },
      strictSSL: true,
      body: {
        'documents': [{
          'id': '1',
          'language': 'es',
          'text': `${result}`
        }, ]
      },
    }

    const getSentiments = await new Promise((resolve, reject) => {
      request.post(`${uri}${path}`, bodyData, (err, res, body) => {
        if (err) reject(err)
        resolve(body)
      })
    })
    if (typeof getSentiments == 'string') {
      return JSON.parse(getSentiments)
    }
    return getSentiments
  }
}