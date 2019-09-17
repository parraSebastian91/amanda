require('./../../functions/ingresoDatos/sectionEndConversation')
const { MensajeDeAyuda } = require("./../../utils")

bot.dialog('/catalogo_navidad', [
    (session) => {
        //session.send(botReply.text1)
        //session.endConversation()
        var card = {
            'contentType': 'application/vnd.microsoft.card.adaptive',
            'content': {
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "type": "AdaptiveCard",
                "version": "1.0",
                "body": [
                    {
                        "type": "Container",
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": `Desde el año 2012 somos socios fundadores de <span style="color:#aad500; font-weight:bold;">Fundación Reforestemos</span>  y juntos hemos plantando 49.432 árboles nativos. Además este año aportamos  <span style="color:#aad500; font-weight:bold;">5.000 árboles nativos</span> para las zonas más afectadas por los incendios en el sur de Chile.`,
                                "wrap": true
                            }
                        ]
                    }
                ]
            }
        }
        //console.log(JSON.stringify(card))
        var msg = new builder.Message(session).addAttachment(card)
        session.beginDialog('/end_conversation', { mensaje: msg })
        // session.send(msg)
        // MensajeDeAyuda(session)
        // session.endConversation()
    }
])