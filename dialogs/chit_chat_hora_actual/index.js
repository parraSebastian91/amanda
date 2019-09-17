const moment = require('moment-timezone')

bot.dialog('/chit_chat_hora_actual', [
  (session, args, next) => {
    session.send(moment().tz("America/Santiago").format('HH:mm'))
    session.endDialog()
  }
])