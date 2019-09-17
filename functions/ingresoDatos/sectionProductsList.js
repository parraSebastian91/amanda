// const builder = require('botbuilder')
bot.dialog('/sectionProductsList', [
    async(session, results, next) => {
        if (session.message && session.message.value) {
            const response = session.message.value.id
            session.message.value = {}
            session.endDialogWithResult({ response: response })
            return
        } else if (session.message.text && session.message.text !== '') {
            const responseToUpperCase = session.message.text.toUpperCase()
            session.message.text = ''
            session.endDialogWithResult({ response: responseToUpperCase })
            return
        }
        try {
            const subOrdenArray = session.userData.subOrdenesProductos
            var body = [{
                'type': 'TextBlock',
                'text': '¿Estás seguro que deseas anular la siguiente compra?'
            }]
            subOrdenArray.forEach(function(e) {
                e.products.forEach(function(v) {
                    body.push({
                        'type': 'TextBlock',
                        'text': e.value
                    })
                    body.push({
                        'type': 'Image',
                        'url': v.image
                    }, {
                        'type': 'TextBlock',
                        'text': v.value
                    })
                })
            })
            var card = {
                'contentType': 'application/vnd.microsoft.card.adaptive',
                'content': {
                    '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
                    'type': 'AdaptiveCard',
                    'version': '1.0',
                    'body': body,
                    'actions': [{
                            'type': 'Action.Submit',
                            'title': 'SI',
                            'data': {
                                'id': 'SI'
                            }
                        },
                        {
                            'type': 'Action.Submit',
                            'title': 'NO',
                            'data': {
                                'id': 'NO'
                            }
                        }
                    ]
                }
            }
            console.log(JSON.stringify(card))
            var msg = new builder.Message(session).addAttachment(card)
            session.send(msg)
        } catch (e) {
            console.log(e)
            session.send('No he logrado encontrar información de tu compra, intenta más tarde')
            session.endConversation()
        }
    }
])