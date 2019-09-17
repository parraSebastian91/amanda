bot.dialog('/sectionCardInfoAnulacion', [
    async (session, results, next) => {
        try {
            const subOrdenArray = session.userData.order.order.anulacion_subOrden
            // session.send('Para anular tu compra puedes dirigirte con tu producto a cualquiera de nuestras tiendas')
            // session.send('Si tu producto no es fácil de transportar, puedes ingresar tu solicitud de anulación en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
            // ((typeof so.address !== undefined && so.address) ? SO_Home_delivery : SO_retiro_Tienda).push(so)
            //console.log(JSON.stringify(card))

            if (subOrdenArray.SO_isDelivered_false.length != 0) {
                var msg_isDelivered_false = new builder.Message(session).addAttachment(bodyCard(subOrdenArray.SO_isDelivered_false, 1))
                session.send(msg_isDelivered_false)
            }

            // if (subOrdenArray.SO_retiro_Tienda.length != 0) {
            //     var msg_retiro_tienda = new builder.Message(session).addAttachment(bodyCard(subOrdenArray.SO_retiro_Tienda, 2))
            //     session.send(msg_retiro_tienda)
            // }

            // if (subOrdenArray.SO_Home_delivery.length != 0) {
            //     var msg_home_delivery = new builder.Message(session).addAttachment(bodyCard(subOrdenArray.SO_Home_delivery, 3))
            //     session.send(msg_home_delivery)
            // }

        } catch (e) {
            console.log(e)
            session.send('No he logrado encontrar información de tu compra, intenta más tarde')
            session.endConversation()
        }
    }
])

const bodyCard = (subOrden, tipo) => {

    var texto_inicial = ''

    switch (tipo) {
        case 1:
            texto_inicial = 'Las siguientes órdenes'
            break
        case 2:
            texto_inicial = ''
            break
        case 3:
            texto_inicial = '¿Cual es el motivo de anulación de tus productos?'
            break
    }

    var body = [{
        'type': 'TextBlock',
        'text': texto_inicial
    }]

    subOrden.forEach(function (e) {
        e.products.forEach(function (v) {
            body.push({
                'type': 'TextBlock',
                'text': `Despacho: ${e.id}`
            })
            body.push(
                {
                    'type': 'Image',
                    'url': v.image_url
                },
                {
                    'type': 'TextBlock',
                    'text': v.description
                })
        })
    })

    switch (tipo) {
        case 1: //Tipo: isDelivered false
            body.push({
                'type': 'TextBlock',
                'text': 'Estimado cliente, para poder gestionar la anulación de tu producto debes primero recibir tu despacho para luego poder ingresar tu solicitud. Una vez que recibas tu despacho contáctame y te ayudaré'
            })
            break
        case 2://tipo: Retiro en tienda
            body.push({
                'type': 'TextBlock',
                'text': 'Para anular tu compra puedes dirigirte con tu producto a cualquiera de nuestras tiendas'
            },
                {
                    'type': 'TextBlock',
                    'text': "Si tu producto no es fácil de transportar, puedes ingresar tu solicitud de anulación en el siguiente <a href='https://www.falabella.com/falabella-cl/mi-cuenta/ordenes'>Link</a>."
                })
            break
        case 3://Tipo: Despacho a domicilio
            break
    }


    //
    var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            'body': body
        }
    }

    return card
}