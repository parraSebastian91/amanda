const request = require('request')

const backofficeGiftcardApi = process.env.BACKOFFICE_GIFTCARD_API
const xrhsref = process.env.BACKOFFICE_GIFTCARD_API_XRHSREF
const Authorization = process.env.BACKOFFICE_GIFTCARD_API_AUTH

const headers = {
  'X-txRef': 999,
  'X-cmRef': 2001, // CODIGO AMANDA, AMANDA: 2001, PORTAL:  2002, BOT: 2003
  'X-rhsRef': `${xrhsref}`,
  //'X-rhsRef': '192.128.1.1',
  'X-chRef': 'WEB', // SIEMPRE
  'X-country': 'CL',
  'X-commerce': 1, // FALABELLA CHILE : 1, SODIMAC CHILE : 6, TOTUS CHILE : 8
  'Authorization': `${Authorization}`,
  //'Authorization': 'W6H09di3F8BC8HF1pd9NkHiNDNZiqFZO',
  'Content-Type': 'application/json',
  'Ocp-Apim-Subscription-Key': 'a3973480282e4a77bfdf5dad97ce6d8a',
  'Ocp-Apim-Trace': true
}

const createGiftcard = (body) => {
  const options = {
    url: `${backofficeGiftcardApi}`,
    //url: 'https://api-gc-uat.txdretail.com/bff/web/giftcards',
    headers: headers,
    json: true,
    body: body
  }
  return new Promise((resolve, reject) => {
    request.post(options, (err, resp, body) => {
      if (!err && body) {
        resolve(body)
      } else {
        reject(err)
      }
    })
  })
}

module.exports = { createGiftcard }