const builder = require('botbuilder')
const { MapStruc, ReverseDate } = require('../../utils')

// const adaptiveCard = [
//   {
//     'type': 'TextBlock',
//     'text': 'Este es el detalle de la orden que deseas cambiar de boleta a factura',
//     'wrap': true
//   },
//   {
//     'type': 'ColumnSet',
//     'columns': [
//       {
//         'type': 'Column',
//         'width': 'stretch',
//         'items': []
//       },
//       {
//         'type': 'Column',
//         'width': 'auto',
//         'items': []
//       }
//     ]
//   }
// ]

bot.dialog('/sectionCardList', [
  (session, args, next) => {
    // if (adaptiveCard[1].columns[0].items.length > 0 && adaptiveCard[1].columns[1].items.length > 0) {
    //   adaptiveCard[1].columns[0].items = []
    //   adaptiveCard[1].columns[1].items = []
    // }
    // adaptiveCard[1].columns[0].items.push(
    //   {
    //     'type': 'TextBlock',
    //     'text': 'Orden de compra:'
    //   })
    // adaptiveCard[1].columns[1].items.push(
    //   {
    //     'type': 'TextBlock',
    //     'text': session.userData.orden_compra
    //   })
    // session.userData.infoProductos.forEach((subOrden) => {
    //   subOrden.forEach(product => {
    //     adaptiveCard[1].columns[0].items.push(product.description)
    //     adaptiveCard[1].columns[1].items.push(product.price)
    //   })
    // })
    var msg = new builder.Message(session)
      .addAttachment({
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          body: CBFCardFormat(session.userData.infoProductos)
        }
      })
    session.send(msg)
    session.endDialog()
  }
])

const CBFCardFormat = function(subOrdenArray) {
  const title = 'Este es el detalle de la orden que deseas cambiar de boleta a factura'
  const body = [
    {
      'type': 'TextBlock',
      'text': title
    },
    {
      'type': 'Container',
      'items': []
    }]
  MapStruc(subOrdenArray, function(e) {
    const cantidadProductos = `(${ e.length } ${ (e.length > 1) ? 'unidades' : 'unidad' })`
    const despacho = {
      'type': 'TextBlock',
      'text': `Despacho: <b>${ e[0].subOrden }</b> <p>${ cantidadProductos }</p>`
    }
    body[1].items.push(despacho)
    MapStruc(e, function(e) {
      const timeFormat = ReverseDate(e.fecha)
      body[1].items.push(
        {
          'type': 'Image',
          'horizontalAlignment': 'Center',
          'url': e.image
        },
        {
          'type': 'TextBlock',
          'weight': 'Bolder',
          'horizontalAlignment': 'Center',
          'text': e.description
        },
        {
          'type': 'TextBlock',
          'weight': 'Bolder',
          'horizontalAlignment': 'Center',
          'text': `$${ e.price }`
        },
        {
          'type': 'TextBlock',
          'horizontalAlignment': 'Center',
          'text': `Fecha de entrega: ${ timeFormat }`
        },
        {
          'type': 'TextBlock',
          'text': ' ',
          'separator': true
        })
    })
  })
  return body
}
