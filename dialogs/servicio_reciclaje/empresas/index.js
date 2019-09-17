require('./../../../functions/ingresoDatos/sectionEndConversation')
const { MensajeDeAyuda } = require('../../../utils')

bot.dialog('/reciclaje_domicilio_empresas', [
    (session, args, next) => {
        let msg = 'Falabella está comprometida con el medio ambiente, todos los productos son retirados posterior a la entrega de tu producto nuevo. El producto a reciclar es retirado y entregado a una empresa certificada en el proceso de reciclaje.'
        session.beginDialog('/end_conversation', { mensaje: msg })
        //session.send('Falabella está comprometida con el medio ambientes es por eso que todos los productos reciclados son retirados por la empresa especialista Midas quien cuida el proceso de reciclaje y disposición final de residuos.')
        // session.send()
        // session.endDialog()
        // MensajeDeAyuda(session)
    }
])