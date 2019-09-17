const request = require('request')
const logger = require('./../../utils/logger');
const webtrackingAPIBaseurl = process.env.WEBTRACKING_API_BASEURL

module.exports = {
  async getToken(session) {
    const options = {
      headers: {
        'session-id': session.userData.dataPersonal.sessionId,
        'Content-Type': 'application/json',
        'User-Agent': 'Amanda'
      }
    }

    let accessToken = await new Promise((resolve, reject) => {
      request.post(
        `${ webtrackingAPIBaseurl }/users/auth`,
        options,
        (err, res, body) => {
          if (err) {
            reject(err)
          }
          resolve(body)
        }
      )
    })

    if (typeof accessToken === 'string') {
      let validJsonString = await this.isJsonString(accessToken)
      if (validJsonString) {
        accessToken = JSON.parse(accessToken)
      } else {
        accessToken = false
      }
    }

    if (accessToken.errors.length > 0) {
      accessToken = false
    }

    return accessToken
  },
  async getOrder(session) {
    logger.info('serve: getOrder')
    let orderID
    let getOrders
    if (session.userData.orderNumber && typeof session.userData.orderNumber !== 'undefined') {
      orderID = session.userData.orderNumber.trim()
    } else {
      return false
    }

    const options = {
      method: 'GET',
      url: `${ webtrackingAPIBaseurl }/orders/${ orderID }`,
      headers: {
        Email: session.userData.email,
        'session-id': session.userData.dataPersonal.sessionId,
        'Content-Type': 'application/json',
        'User-Agent': 'Amanda'
      }
    }

    getOrders = await new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if (err) {
          reject(err)
        }
        resolve(body)
      })
    })

    let validJsonString = await this.isJsonString(getOrders)
    if (validJsonString) {
      if (typeof getOrders === 'string') {
        return JSON.parse(getOrders)
      }
    } else {
      getOrders = { success: false }
    }

    if (getOrders.state) {
      logger.info(`getOrders, ${ JSON.stringify(getOrders) }`)
      return getOrders
    } else {
      logger.error(`getOrders, ${ JSON.stringify(getOrders) }`)
      return false
    }
  },
  async getOrderUserAuthenticated(session) {
    let orderID
    let getOrders
    if (session.userData.orderNumber && typeof session.userData.orderNumber !== 'undefined') {
      orderID = session.userData.orderNumber.trim()
    } else {
      return false
    }

    const getToken = await this.getToken(session)

    if (getToken !== false) {
      const options = {
        method: 'GET',
        url: `${ webtrackingAPIBaseurl }/orders/${ orderID }`,
        headers: {
          Authorization: 'Bearer ' + getToken.state.token,
          Email: session.userData.email,
          'Content-Type': 'application/json',
          'User-Agent': 'Amanda'
        }
      }

      getOrders = await new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
          if (err) {
            reject(err)
          }
          resolve(body)
        })
      })

      let validJsonString = await this.isJsonString(getOrders)
      if (validJsonString) {
        if (typeof getOrders === 'string') {
          return JSON.parse(getOrders)
        }
      } else {
        getOrders = { success: false }
      }
      return getOrders
    } else {
      return false
    }
  },
  async getPaymentMethod(session) {
    let orderID
    if (session.userData.orderNumber && typeof session.userData.orderNumber !== 'undefined') {
      orderID = session.userData.orderNumber.trim()
    } else {
      return false
    }

    const options = {
      method: 'GET',
      url: `${ webtrackingAPIBaseurl }/orders/${ orderID }/payment_methods`,
      headers: {
        Email: session.userData.email,
        'session-id': session.userData.dataPersonal.sessionId,
        'Content-Type': 'application/json',
        'User-Agent': 'Amanda'
      }
    }

    let getPaymentMethods = await new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if (err) {
          reject(err)
        }
        resolve(body)
      })
    })

    let validJsonString = await this.isJsonString(getPaymentMethods);
    if (validJsonString) {
      if (typeof getPaymentMethods === 'string') {
        return JSON.parse(getPaymentMethods)
      }
    } else {
      getPaymentMethods = { success: false }
    }
    return getPaymentMethods;
  },
  async getPaymentMethodUserAuthenticated(session) {
    let orderID
    if (session.userData.orderNumber && typeof session.userData.orderNumber !== 'undefined') {
      orderID = session.userData.orderNumber.trim()
    } else {
      return false
    }

    const getToken = await this.getToken(session)

    if (getToken !== false) {
      const options = {
        method: 'GET',
        url: `${ webtrackingAPIBaseurl }/orders/${ orderID }/payment_methods`,
        headers: {
          Authorization: 'Bearer ' + getToken.state.token,
          Email: session.userData.email,
          'Content-Type': 'application/json',
          'User-Agent': 'Amanda'
        }
      }

      let getPaymentMethods = await new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
          if (err) {
            reject(err)
          }
          resolve(body)
        })
      })

      let validJsonString = await this.isJsonString(getPaymentMethods);
      if (validJsonString) {
        if (typeof getPaymentMethods === 'string') {
          return JSON.parse(getPaymentMethods)
        }
      } else {
        getPaymentMethods = { success: false }
      }
      logger.info(`getPaymentMethods, ${ JSON.stringify(getPaymentMethods) }`)
      return getPaymentMethods;
    } else {
      logger.error(`getPaymentMethods, ${ JSON.stringify(getToken) }`)
      return false
    }
  },
  async isJsonString(str) {
    try {
      JSON.parse(str)
    } catch (error) {
      logger.error(`getFuenteTiendaByName, ${ JSON.stringify(error) }`)
      return false
    }
    logger.info(`getFuenteTiendaByName, ${ JSON.stringify(str) }`)
    return true
  }
}
