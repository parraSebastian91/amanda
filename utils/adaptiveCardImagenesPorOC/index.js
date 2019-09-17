const logger = require('./../logger')

function bodyAdaptiveCardImagenesPorOC(textTitulo) {
  logger.info('Funcion: bodyAdaptiveCardImagenes.')
  const bodyProducto = [{
    'type': 'TextBlock',
    'id': 'txtTitulo',
    'horizontalAlignment': 'Center',
    'text': textTitulo
  }
  ]
  return bodyProducto
}
function totalProductosOC(subOrdenesDeOC) {
  const productos = []
  subOrdenesDeOC.forEach(p => {
    p.products.forEach(pr => {
      productos.push(pr)
    })
  });
  return productos
}
function listaProductosPorOC(subOrdenesOC, fechaCompraOc, tituloOrigen = 'Por favor confirma tu compra') {
  var bodyproductos;
  var tmp;
  var contContainer = 1;
  // var cantSubOrdenes = subOrdenesOC.length;
  var totalProductos = totalProductosOC(subOrdenesOC)
  var cantProduct = totalProductos.length;
  let titulo = tituloOrigen
  let textFinal = `Fecha de Compra ${ fechaCompraOc }`
  bodyproductos = bodyAdaptiveCardImagenesPorOC(titulo)
  bodyproductos.push(
    {
      'type': 'Container',
      'items': []
    },
    {
      'type': 'TextBlock',
      'id': 'txtEstado',
      'text': textFinal,
      'horizontalAlignment': 'Center'
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

  totalProductos.map(function(el) {
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
          'url': `${ el.image_url }`,
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
  logger.info(`Function : bodyproductos : ${ JSON.stringify(bodyproductos) }`)
  return bodyproductos
}
module.exports = {
  listaProductosPorOC
}
