require('dotenv').config()
require('./../functions/menuPalabrasSueltas/menuPalabrasSueltas')
const validacionesInput = require("./../functions/validaciones/input")

var parameters
function limpiarId(str) {
    let _str = str
    _str = str.split('|')
    return _str[0]
}
module.exports = (bot) => {
  bot.use({
    receive(event, next) {
      if (event.text.length) {
        parameters = {
          event: event,
          onlyUser: true,
          createAt: new Date(),
          conversationIdAmanda: limpiarId(event.address.conversation.id)
        }
        logUserConversationAmanda(parameters, false)
      }
      next()
    },
    send(event, next) {
      if ('text' in event && event.text.length) {
        parameters = {
          event: event,
          onlyUser: false,
          createAt: new Date(),
          conversationIdAmanda: limpiarId(event.address.conversation.id)
        }
        logUserConversationAmanda(parameters)
      }
      if (event.text == undefined && 'attachments' in event && event.attachments.length > 0) {
        parameters = {
          event: event,
          onlyUser: false,
          createAt: new Date(),
          conversationIdAmanda: limpiarId(event.address.conversation.id)
        }
        logUserConversationAmanda(parameters)
      }
      next()
    },
    botbuilder(session, next) {

      //limpia caracteres y tildes
      if (session.message.text != "") {
        if (typeof session.userData.dataProgram != "undefined" && session.userData.dataProgram.ServiceOn) {
          session.send('Por favor espere un momento mientras busco la información.')
          return //evita que usuario ingrese mensajes mientras Bot hace procesos en backend
        }
        session.message.text = validacionesInput.sanitizeStrLuis(session.message.text)
      }
      //responde cuando llega un garabato
      if (validacionesInput.hasBadWords(session.message.text)) {
        session.send('No me gusta que me trates así')
        return
      }
      //responde cuando llega una risa
      if (validacionesInput.validateRisas(session.message.text) && session.userData.dataProgram.palabraCorta === false) {
        session.send('jajaja, tu risa es contagiosa')
        return
      }
      //salida opcional palabras cortas
      if (validacionesInput.palabraCorta(session.message.text.toLowerCase()) && session.userData.dataProgram.palabraCorta === false) {
        session.beginDialog('/menuPalabrasSueltas', { menuPalabra: validacionesInput.menuPalabrasCortas(session.message.text.toLowerCase()) })
        return
      }
      //responde cuando llega palabras relacionadas a nada
      if (validacionesInput.diccionarioPalabrasNada(session.message.text) && session.userData.dataProgram.palabraCorta === false) {
        session.send('Gracias por preferir Falabella. Recuerda que estoy aquí 24/7 para resolver tus consultas.')
        return
      }
      if (session.dialogStack().length > 0) {
        if (session.message.text.length) {
          stopSurveyForesee() // reinicio
          surveyForesee(session) // inicio
        }
        next()
      } else {
        next()
      }
    },
  })
}
async function logUserConversationAmanda(parameters, amanda = true) {
  try {
    switch (parameters.event.type) {
      case 'message':
        if (typeof parameters.event.address !== 'undefined' && parameters.event.address !== null) {
          var scoreLuis = '0.0'
          var intentLuis = 'bot'
          if (!amanda) {
            const intentTypeFront = await new Promise(async resolve => {
              resolve(await connectionApiLuis.getDataLuis(parameters.event.text))
            })
            scoreLuis = intentTypeFront.topScoringIntent.score
            intentLuis = intentTypeFront.topScoringIntent.intent
          }
          var menu = (('attachments' in parameters.event) && parameters.event.attachments.length > 0) ? parameters.event.attachments[0].content.buttons : null
          var adaptiveCard = ('attachments' in parameters.event && parameters.event.attachments.length > 0 && parameters.event.text == undefined) ? JSON.stringify(parameters.event.attachments[0].content) : null

                    const dataMessage = {
                        section: 'front',
                        //conversationId: (parameters.event.address && parameters.event.address.conversation) ? parameters.event.address.conversation.id : 0,
                        conversationId: parameters.conversationIdAmanda,
                        text: parameters.event.text,
                        opciones: menu,
                        adaptiveCrad: adaptiveCard,
                        score: scoreLuis,
                        intent: intentLuis,
                        payload: null,
                        //payload: parameters.event,
                        createAt: parameters.createAt
                    }
                    logs.registerLog(dataMessage, process.env.COLECCION_LOG_CONVERSACION_MONGO)
                }
                break
        }
    } catch (error) {
        console.log("##### logUserConversationAmanda #####")
        console.log(error)
        console.log("##### logUserConversationAmanda #####")
    }
}
// *****************************************************************
// *                        Manejo de encuesta                     *
// *****************************************************************
var contentSuveryForesee
function surveyForesee(session) {
    if (typeof session.userData.retryEncuesta === 'undefined') {
        contentSuveryForesee = setTimeout(() => {
            session.send(`Puedes evaluar la interacción que has tenido conmigo haciendo click en [este link](https://survey.foresee.com/f/gyUS9oK3z2). Al responder esta encuesta podré ir mejorando mi aprendizaje. ¡Gracias!`)
            session.userData.retryEncuesta = true
        }, process.env.TIME_OUT_POLL, session)
    }
}
function stopSurveyForesee() {
    clearTimeout(contentSuveryForesee)
}
/*****************************************************************/