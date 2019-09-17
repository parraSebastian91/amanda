// const builder = require('botbuild
const { ReverseDate } = require('../../utils')

bot.dialog('/sectionCheckboxList', [
    async(session, results, next) => {
        if (session.message && session.message.value) {
            if (session.userData.subOrdenesProductos.length > 1) {
                const checkBoxSelectedArray = Object.values(session.message.value)
                session.message.value = null
                session.endDialogWithResult(checkBoxSelectedArray)
                return
            }
            const checkBoxSelected = [session.userData.subOrdenesProductos[0].value]
            session.message.value = null
            session.endDialogWithResult(checkBoxSelected)
            return
        }

        try {
            const subOrdenArray = session.userData.subOrdenesProductos
            const cardBody = newCardFormat(session, subOrdenArray)
            const card = {
                'contentType': 'application/vnd.microsoft.card.adaptive',
                'content': {
                    '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
                    'type': 'AdaptiveCard',
                    'version': '1.0',
                    'body': cardBody,
                    'actions': [{
                        'type': 'Action.Submit',
                        'title': 'Confirmar'
                    }]
                }
            }
            const msg = new builder.Message(session).addAttachment(card)
            session.send(msg)
        } catch (e) {
            console.log(e)
            session.send('No he logrado encontrar información de tu compra, intenta más tarde')
            session.endConversation()
        }
    }
])

const newCardFormat = function(session, subOrdenArray) {
    let title
    if (typeof session.userData.order.order.anulacion_subOrden !== 'undefined') {
        if (session.userData.subOrdenesProductos.length > 1) {
            title = 'Por favor confirma que estos son los productos que quieres anular'
        } else {
            title = 'Por favor confirma que este es el producto que quieres anular'
        }
    } else {
        if (session.userData.subOrdenesProductos.length > 1) {
            title = 'Por favor selecciona el despacho'
        } else {
            title = 'Por favor confirma el despacho'
        }
    }


    const body = [{
        'type': 'TextBlock',
        'text': title
    }]
    subOrdenArray.forEach(function(e) {
        const cantidadProductos = `(${e.products.length} ${(e.products.length > 1) ? 'unidades' : 'unidad'})`
        const choiceObject = {
            'type': 'Input.ChoiceSet',
            'id': `D${e.value}`,
            'isMultiSelect': true,
            'value': `D${e.value}`,
            'style': 'compact',
            'choices': [{
                'title': `Despacho: <b>${e.value}</b> <p>${cantidadProductos}</p>`,
                'value': e.value
            }]
        }
        const textBoxVacia = { 'type': 'TextBlock', 'text': '' }
        const choiceTemp = ((subOrdenArray.length > 1) ? choiceObject : textBoxVacia)
        const timeFormat = ReverseDate(e.fecha)
        body.push(choiceTemp)
        e.products.forEach(function(v) {
            body.push({
                'type': 'Image',
                'horizontalAlignment': 'Center',
                'url': v.image
            }, {
                'type': 'TextBlock',
                'weight': 'Bolder',
                'horizontalAlignment': 'Center',
                'text': v.value
            }, {
                'type': 'TextBlock',
                'horizontalAlignment': 'Center',
                'text': `Fecha de entrega: ${timeFormat}`
            }, {
                'type': 'TextBlock',
                'text': ' ',
                'separator': true
            })
        })
    })
    return body
}

// const oldCardFormat = function(session, subOrdenArray) {
//   let body = []
//   let texto_cabecera
//   if (session.userData.subOrdenesProductos.length > 1) {
//     texto_cabecera = 'Hemos dividido tu orden para que la puedas visualizar con detalle:'
//   } else {
//     texto_cabecera = 'El detalle de tu orden es el siguiente:'
//   }
//   let title = texto_cabecera
//   // if (typeof results !== 'undefined' && results != null) {
//   //   if (typeof results.tituloList !== 'undefined' && typeof results.tituloList !== '') {
//   //     title = results.tituloList
//   //   }
//   // }
//   body = [{
//     'type': 'TextBlock',
//     'text': title
//   }]
//   subOrdenArray.forEach(function(e) {
//     body.push({
//       'type': 'Input.ChoiceSet',
//       'id': `D${ e.value }`,
//       'isMultiSelect': true,
//       'value': `D${ e.value }`,
//       'style': 'compact',
//       'choices': [{
//         'title': `Despacho: ${ e.value }`,
//         'value': e.value
//       }]
//     })
//     e.products.forEach(function(v) {
//       body.push({
//         'type': 'TextBlock',
//         'text': v.value
//       })
//     })
//   })
//   return body
// }

// const totalEntregaFalso = function(session) {
//   const sub_orders = session.userData.order.order.sub_orders
//   const flag = sub_orders.filter((e) => e.delivery_status)
// }