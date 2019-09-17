const botReply = require('./text')
require('./../feedback')

bot.dialog('/compra_garantia_extendida', [
    (session, args, next) => {
        session.send(botReply.text1)
        session.endDialog()
    }
])