require('./sectionEndConversation')
const { noRecuerdaOC } = require('../validaciones/input')
const botReply = require('./text.js')
const { MensajeDeAyuda, AdaptiveCard } = require('../../utils')

const AyudaOC = (session) => {
    const url = 'https://chatbotstorageblob.blob.core.windows.net/assets/img/orden_compra.png'
    const body = [{
        'type': 'ColumnSet',
        'columns': [{
            'type': 'Column',
            'width': 'auto',
            'items': [{
                'type': 'Image',
                'url': url
            }]
        }]
    }]
    const action = [{
        'type': 'Action.OpenUrl',
        'id': 'ampliar-imagen',
        'title': 'Ampliar imagen',
        'url': url
    }]
    return AdaptiveCard(session, body, action)
}

bot.dialog('/sectionOCValidadorPalabras', [
    async(session, args, next) => {
        session.userData.dataProgram.palabraCorta = true
        if (args && args.dialogRetry) {
            if (args.recuerdaOC === false) {
                // validación reintentos con textos dinamicos
                let reintentoTextoNoLoSeOC = (session.userData.dialogRetryOC - 1)
                switch (reintentoTextoNoLoSeOC) {
                    case 1:
                        // session.send(botReply[`sectionOCValidadorPalabras_text${reintentoTextoNoLoSeOC}`])

                        session.send(botReply[`sectionOCValidadorPalabras_text${ reintentoTextoNoLoSeOC }`])
                        session.send(AyudaOC())

                        delete session.userData.orden_compra
                        delete session.userData.orderNumber
                        builder.Prompts.text(session, 'Por favor intenta ingresar nuevamente el número de orden de compra')
                        break;
                    case 2:
                        session.userData.dataProgram.palabraCorta = false
                        delete session.userData.orden_compra
                        delete session.userData.orderNumber
                        session.send(botReply[`sectionOCValidadorPalabras_text${ reintentoTextoNoLoSeOC }`])
                        session.send(AyudaOC(session))
                        break;
                    case 3:
                        session.userData.dataProgram.palabraCorta = false
                        session.userData.dialogRetryOC = 1
                        delete session.userData.orden_compra
                        delete session.userData.orderNumber
                        session.beginDialog('/end_conversation', { mensaje: botReply[`sectionOCValidadorPalabras_text${ reintentoTextoNoLoSeOC }`] })
                        // session.send(botReply[`sectionOCValidadorPalabras_text${ reintentoTextoNoLoSeOC }`])
                        // MensajeDeAyuda(session)
                        // session.endConversation()
                        break;
                }
            } else {
                builder.Prompts.text(session, '$numero_OC_invalido$ Por favor, ingresa un número de orden válido')
            }
        } else {
            // Primera pregunta
            builder.Prompts.text(session, '$ingrese_numero_OC$ ¿Me podrías indicar el número de tu orden de compra?')
        }
    },
    async(session, results, next) => {
        if (results.response) {
            try {
                session.userData.orden_compra = ''
                session.userData.orderNumber = ''
                results.response = results.response.trim()
                let text = results.response.replace(/[^\d.]/g, '').replace('.', '')
                let ordenDeCompraLength = text.length
                var flagRecuerdaOC = true
                if (results.response !== '') {
                    if (await noRecuerdaOC(results.response) || ordenDeCompraLength <= 6 || isNaN(results.response) === true) {
                        flagRecuerdaOC = false
                    }
                    if (session.userData.dialogRetryOC < 3 && !flagRecuerdaOC) {
                        session.userData.dialogRetryOC += 1
                        session.userData.dataProgram.palabraCorta = false
                        delete session.userData.orden_compra
                        delete session.userData.orderNumber
                        session.replaceDialog('/sectionOCValidadorPalabras', {
                            dialogRetry: true,
                            recuerdaOC: flagRecuerdaOC
                        })
                        return
                    }
                    if (session.userData.dialogRetryOC === 3 && ordenDeCompraLength <= 9) {
                        session.userData.dialogRetryOC = 1
                        session.userData.dataProgram.palabraCorta = false
                        delete session.userData.orden_compra
                        delete session.userData.orderNumber
                        session.beginDialog('/end_conversation', { mensaje: botReply['sectionOCValidadorPalabras_text3'] })
                        // session.send(botReply['sectionOCValidadorPalabras_text3'])
                        // MensajeDeAyuda(session)
                        // session.endConversation()
                    } else {
                        session.userData.dialogRetryOC = 1
                        session.userData.orden_compra = text
                        session.userData.orderNumber = text
                        session.userData.dataProgram.palabraCorta = false
                        session.endDialogWithResult(results)
                    }
                }
            } catch (error) {
                session.userData.dataProgram.palabraCorta = false
                delete session.userData.orden_compra
                delete session.userData.orderNumber
                session.beginDialog('/end_conversation', { mensaje: botReply.sectionOCValidadorPalabras_error_text4 })
                // session.send(botReply.sectionOCValidadorPalabras_error_text4)
                // MensajeDeAyuda(session)
                // session.endConversation()
            }
        } else {
            session.userData.dataProgram.palabraCorta = false
            delete session.userData.orden_compra
            delete session.userData.orderNumber
            session.beginDialog('/end_conversation', { mensaje: botReply.sectionOCValidadorPalabras_error_text4 })
            // session.send(botReply.sectionOCValidadorPalabras_error_text4)
            // MensajeDeAyuda(session)
            // session.endConversation()
        }
    }
])