const builder = require('botbuilder')
const login = require("./../functions/login").login
const logger = require('./logger')
const text = require('./text')

const MensajeBuscandoInfo = (session) => {
  return session.send(text.txtBuscandoInformacion)
}

const consultarLuis = (txt) => {
  return new Promise((resolve, reject) => {
      resolve(connectionApiLuis.existsInLUIS(txt))
  })
}

const OfuscarCorreo = (correo) => {
  let correoAux = correo.split('@')
  let dom_ext = correoAux[1].split('.')
  
  let usuario = correoAux[0].substr(0,4).padEnd(correoAux[0].length, '*')
  let dominio = dom_ext[0].substr(0,1).padEnd(dom_ext[0].length, "*")
  let extension = dom_ext[1] 

  return usuario + '@' + dominio + '.' + extension
}

module.exports = {
  // ErrorException(errorObj) {
  //   const stack = Error().stack
  //   return {
  //     errorObj,
  //     errorStack: stack,
  //     errorCode: 1
  //   }
  // },
  // ErrorPrompt(code) {
  //   return console.error(`Excepcion encontrada\nError stack: ${code.errorStack}\nError object: %s`, JSON.stringify(code.errorObj))
  // },
  MensajeDeAyuda(session) {
    delete session.userData.email
    delete session.userData.orden_compra
    delete session.userData.orderNumber
    return setTimeout(function () { session.send('¿En qué más te puedo ayudar?') }, 3000)
  },
  OfuscarCorreo,
  MensajeBuscandoInfo,// Send que envia Menstaje Buscando Información
  consultarLuis,//Consulta API a LUIS
  // Valida que un objeto contenga una llave con valor
  KeyInObj(obj, key) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return true
    } else {
      return false
    }
  },
  AdaptiveCard(session, body, action) {
    const msg = new builder.Message(session)
      .addAttachment({
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          body: body,
          actions: action ? action : ""
        }
      })
    return msg
  },
  limpiaSession(session) {
    delete session.userData.email
    delete session.userData.orden_compra
    delete session.userData.orderNumber
    delete session.userData.rut
    delete session.userData.telefono
  },
  ReverseDate(str) {
    const datesSplit = str.split('/');
    const reverseDates = datesSplit.reverse()
    const contactDates = reverseDates.reduce((p, n) => p.concat('/', n))
    return contactDates
  },
  MapStruc(arr, fn) {
    return Array.prototype.map.call(arr, fn)
  },
  Filtrar(arr, fn) {
    return Array.prototype.filter.call(arr, fn)
  },
  ForEach(arr, fn) {
    return Array.prototype.forEach.call(arr, fn)
  },
  ExisteEnObjeto(obj, arr) {
    let tmp = obj;
    this.ForEach(arr, (x) => {
      if (tmp !== false && (x in tmp)) {
        tmp = tmp[x]
      } else {
        tmp = false
      }
    })
    return tmp
  },
  async validaUsuarioLogeado(session) {
    const userData = {
      dataPersonal: {
        'nombreUsuario': '',
        'emailUsuario': ''
      },
      dataProgram: {
        'sessionActiva': false,
        'sessionInicial': '',
        'sessionExpira': ''
      }
    }
    const loginResponse = await login(session.userData)
    if (loginResponse && loginResponse.sessionActiva) {
      userData.dataPersonal.emailUsuario = loginResponse.emailUsuario
      userData.dataPersonal.rutUsuario = loginResponse.rutUsuario
      userData.dataProgram.sessionInicial = loginResponse.sessionInicial
      userData.dataProgram.sessionExpira = loginResponse.sessionExpira
      userData.dataProgram.sessionActiva = loginResponse.sessionActiva
      //session.userData.dataProgram.sessionActiva = true
      console.log("### session activada ####")
    } else {
      userData.dataPersonal.emailUsuario = ''
      userData.dataPersonal.rutUsuario = ''
      userData.dataProgram.sessionInicial = ''
      userData.dataProgram.sessionExpira = ''
      userData.dataProgram.sessionActiva = false
      console.log("### session no activa ####")
    }
    return userData
  },
  normalizarRut(rut) {
    return (rut) ? rut.replace('-', '').trim() : false
  },
  transaccionesQuiebres(session, servicio, codigo) {
    try {
      let _servicio = {
        name: null,
        request: null,
        response: null
      }
      //let _sessionId = session.logger.address.conversation.id.split('|')[0]
      let _sessionId = session.message.address.conversation.id.split('|')[0]
      let _oc = session.userData.orderNumber
      let _rut = session.userData.rut
      let _email = session.userData.email
      let _codigo = codigo
      if (servicio) {
        _servicio.name = servicio.name
        _servicio.request = JSON.stringify(servicio.request)
        _servicio.response = JSON.stringify(servicio.response)
      }

      const dataMessage = {
        oc: _oc,
        rut: _rut,
        email: _email,
        codigoError: _codigo,
        service: _servicio,
        conversationId: _sessionId,
        //pathOrigen: 'quiebre_backoffice',
        createAt: new Date(Date.now())
      }
      logs.registerLog(dataMessage, process.env.COLECCION_LOG_TRANSACCIONES)
    } catch (error) {
      logger.error(`Utils/transaccionesQuiebres:, ${error}`)
    }
  }
  
}