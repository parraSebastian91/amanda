require('./../../functions/ingresoDatos/sectionEmail')
require('./../../functions/ingresoDatos/sectionOrder')

const botReply = require('./text')

bot.dialog('/productos_ordenes_compra', [
  (session, args, next) => {
    session.send(botReply.text1) 
    session.userData.dialogRetry = 1 
    session.beginDialog('/sectionEmail')
  },
  (session, results, next) => {
    session.userData.email = results.response
    session.beginDialog('/sectionOrder')
  },
])