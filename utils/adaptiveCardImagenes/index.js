const logger = require('./../logger')

function bodyAdaptiveCardImagenes(textoInicio) {
  logger.info('Funcion: bodyAdaptiveCardImagenes.')
  const bodyProducto = [{
    'type': 'TextBlock',
    'id': 'txtTitulo',
    'horizontalAlignment': 'Left',
    'text': textoInicio
  }]
  return bodyProducto
}
function listaProductos(solicitud, textoInicio, textFinal) {
  var bodyproductos;
  var tmp;
  var contContainer = 1;
  var cantProduct = solicitud.products.length;
  bodyproductos = bodyAdaptiveCardImagenes(textoInicio)
  bodyproductos.push(
    {
      'type': 'Container',
      'items': []
    },
    {
      'type': 'TextBlock',
      'id': 'txtEstado',
      'text': textFinal
    }
  )
  let numColumSet = Math.ceil(cantProduct / 3)
  const colunmsArray = []

  for (var y = 1; y <= numColumSet; y++) {
    bodyproductos[contContainer].items.push({
      'type': 'ColumnSet',
      'id': 'clmnSetProducto',
      'horizontalAlignment': 'Center',
      'columns': null
    })
  }

  solicitud.products.map(function(el) {
    var image_por_defecto = 'http://falabella.scene7.com/is/image/Falabella/zzzzzzz?$producto123$&wid=75&hei=75'
    let colunmBody = {
      'type': 'Column',
      'id': 'clmnProducto',
      'horizontalAlignment': 'Center',
      'spacing': 'Medium',
      'items': [
        {
          'type': 'Image',
          'id': 'imgProducto',
          'horizontalAlignment': 'Center',
          'url': `${ el.image_url || image_por_defecto }`,
          'size': 'Medium'
        },
        {
          'type': 'TextBlock',
          'id': 'txtProducto',
          'horizontalAlignment': 'Center',
          'text': `${ el.description }`,
          'isSubtle': true,
          'size': 'Small',
          'wrap': true
        }
      ],
      'width': 'auto'
    }
    colunmsArray.push(colunmBody)
  })
  bodyproductos[contContainer].items.forEach(function(e, i) {
    tmp = colunmsArray.splice(0, 3)
    e.columns = tmp
  })
  logger.info(`Info: bodyproductos : ${ JSON.stringify(bodyproductos) }`)
  return bodyproductos
}
module.exports = {
  listaProductos
}
