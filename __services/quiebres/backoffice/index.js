const request = require('request')
//const logger = require('../../../utils/logger')

const backofficeUsername = process.env.BACKOFFICE_USERNAME
const backofficePassword = process.env.BACKOFFICE_PASSWORD
const backofficeUserUpdate = process.env.BACKOFFICE_USER_UPDATE
const backofficePasswordUpdate = process.env.BACKOFFICE_PASSWORD_UPDATE
let backofficeApiBaseurlInfo = ""
let backofficeApiBaseurlSelectedOption = ""

if (process.env.BACKOFFICE_ENV == "dev") {
  backofficeApiBaseurlInfo = process.env.BO_API_BASEURL_INFO_DEV
  backofficeApiBaseurlSelectedOption = process.env.BO_API_BASEURL_SELECTED_OPTION_DEV
} else {
  backofficeApiBaseurlInfo = process.env.BACKOFFICE_API_BASEURL + '/getinformation'
  backofficeApiBaseurlSelectedOption = process.env.BACKOFFICE_API_BASEURL + '/selectedoption'
}
const getTokenDatosQuiebre = () => {
  try {
    const url = `${backofficeApiBaseurlInfo}/users/token`
  const bodyToken = {
    json: true,
    body: {
      user: `${backofficeUsername}`,
      pass: `${backofficePassword}`
      // user: 'e38r321c-e38r321c-i97ee345-8914ab40',
      // pass: '0pg3aqc7-1of13zbl-111bumqi-ptwii50d'
    }
  }
  return new Promise((resolve, reject) => {
    request.post(url, bodyToken, (err, res, body) => {
      if (err) {
        reject(err)
      }
      resolve(body)
    })
  })
  } catch (error) {
    return {
      "success": false,
      "results": "error al consular los datos"
  }
  }
  //const url = `${backofficeApiBaseurlInfo}/getinformation/users/token`
  

}

const getSsDatoQuiebre = async (consultaQuiebre, esOC = false) => {
  const token = await getTokenDatosQuiebre()
  //const url = `${backofficeApiBaseurlInfo}/getinformation/ss/info`
  const url = `${backofficeApiBaseurlInfo}/ss/info`
  let opBody = (esOC)?{purchase_order: consultaQuiebre}:{id: consultaQuiebre}
  const bodyToken = {
    auth: {
      bearer: token.token
    },
    json: true,
    body: opBody
  }
  return new Promise((resolve, reject) => {
    request.post(url, bodyToken, (err, res, body) => {
      if (err) reject(err)
      resolve(body)
    })
  })
}

const getTokenSelectedOption = () => {
  //const url = `${backofficeApiBaseurlSelectedOption}/selectedoption/users/token`
  const url = `${backofficeApiBaseurlSelectedOption}/users/token`
  const bodyToken = {
    json: true,
    body: {
      user: `${backofficeUserUpdate}`,
      pass: `${backofficePasswordUpdate}`
      // user: 'e38r321c-e38r321c-i97ee345-8914ab40',
      // pass: '0pg3aqc7-1of13zbl-111bumqi-ptwii50d'
    }
  }
  return new Promise((resolve, reject) => {
    request.post(url, bodyToken, (err, resp, body) => {
      if (!err && resp.statusCode === 200) {
        resolve(body)
      } else {
        reject(err)
      }
    })
  })
}

const updSelectedOption = async (ss, sku, activationCode = null, giftcard_number = null, sequence_giftcard = null) => {
  //const url = `${backofficeApiBaseurlSelectedOption}/selectedoption/ss/selectedOption`
  const url = `${backofficeApiBaseurlSelectedOption}/ss/selectedOption`
  const token = await getTokenSelectedOption()
  const fechaDelDia = new Date().toLocaleDateString()
  const bodyToken = {
    auth: {
      bearer: token.token
    },
    json: true,
    body: {
      ss,
      sku,
      authorization_code_GC: activationCode,// response de giftcard
      terminal_number_GC: '2001', // Identificadores de Amanda
      local_number_GC: '1037', // Identificadores de Amanda
      date_creation_GC: fechaDelDia,
      giftcard_number: giftcard_number,
      sequence_giftcard: sequence_giftcard,
      identifier: "Amanda"
    }
  }

  return new Promise((resolve, reject) => {
    request.patch(url, bodyToken, (err, resp, body) => {
      if (!err && resp.statusCode === 200) {
        resolve(body)
      } else {
        reject(err)
      }
    })
  })
}

module.exports = {
  updSelectedOption,
  getSsDatoQuiebre
}