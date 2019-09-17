require('./../../functions/ingresoDatos/sectionEndConversation')
const botReply = require('./text')
const { MensajeDeAyuda } = require('../../utils')
bot.dialog('/chit_chat_estado_civil', [
    (session) => {
        const phrase = [botReply.text1, botReply.text2]
        const phraseRandom = _.sample(phrase)
        session.beginDialog('/end_conversation', { mensaje: phraseRandom })
        // session.send(phraseRandom)
        // MensajeDeAyuda(session)
        // session.endConversation()
    }
])