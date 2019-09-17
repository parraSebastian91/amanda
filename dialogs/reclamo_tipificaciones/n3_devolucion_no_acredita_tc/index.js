// require('./../datos_reclamo_tipificado')
// const botReply = require('./../text')
require('./../../../functions/ingresoDatos/sectionEndConversation')
const { MensajeDeAyuda } = require('../../../utils')

bot.dialog('/n3_devolucion_no_acredita_tc', [
    async (session, args, next) => {
        let msg = 'Para estos casos puedes llamar a nuestro CallCenter al 600 380 5000 y uno de nuestros ejecutivos te atenderá'
        session.beginDialog('/end_conversation', { mensaje: msg })
        // session.send()
        // MensajeDeAyuda(session)
        // session.userData.tienda = 'Internet'
        // session.userData.nivel1 = 'Boletas y Cobros'
        // session.userData.nivel2 = 'Devolucion no acreditada en TC'
        // session.userData.nivel3 = 'Devolucion no acreditada en TC'
        // session.beginDialog('/datos_reclamo_tipificado',botReply.text2)
    }
])