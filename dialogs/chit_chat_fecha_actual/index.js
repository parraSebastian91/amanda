const moment = require('moment-timezone')

bot.dialog('/chit_chat_fecha_actual', [
  (session, args, next) => {
    session.send(moment().tz("America/Santiago").format('DD/MM/YYYY'))
    session.endDialog()
  }
])
