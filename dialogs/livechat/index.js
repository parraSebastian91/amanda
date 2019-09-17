// const botReply = require('./text')
// require('./../feedback')
require('../../functions/ingresoDatos/sectionEmail')
require('../negativefeedback')

bot.dialog('/livechat', [
  async (session, args, next) => {
    const menuOptions = ['SI', 'NO']
    const menuText = '¿Deseas habar con un ejecutivo en vivo?'
    builder.Prompts.choice(session, menuText, menuOptions, {
      listStyle: builder.ListStyle.button
    })
  },
  async (session, results, next) => {
    switch (results.response.entity) {
      case 'SI':
        if (!session.userData.dataPersonal.emailUsuario) {
          session.beginDialog('/sectionEmail')
        } else {
          next()
        }
        break;
      case 'NO':
        session.beginDialog('/negativefeedback')
      default:
        break;
    }
  },async (session, results, next) => {
    const conf = {
      emailUsuario: session.userData.dataPersonal.emailUsuario || results.response,
      user: session.message.address.user,
      name: session.userData.dataPersonal.nombreUsuario
    }
    const message = (session.message.text !== 'SI') ? session.message.text : LiveChat[session.message.address.user.id].incommingMenssages[0]
    await LiveChat[session.message.address.user.id].outgoingMessage(formatData(message, conf.name), formatConf(conf))
  }
])

function formatData(message, name) {
  return {
    message: message,
    n3: "",
    name: name,
    last_name: "",
    phone_1: "",
    phone_2: "",
    address_line_1: "",
    address_line_2: null,
    city: "Santiago"
  }
}

function formatConf(data) {
  return {
    email: data.emailUsuario || "",
    userId: data.user.id
  }
}