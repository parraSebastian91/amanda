const subOrdersProductos = (array, userData) => {
  let arr = []
  if (typeof array !== "undefined" && array !== null && array.length > 0) {
    arr = array.map(obj => ({
      lineaId: obj.line_id,
      cantidad: obj.quantity,
      sku: obj.sku,
      motivo: userData.motivo,
      estadoEmbalaje: "",
      estadoProducto: "",
      nivelUso: "",
      descripcionDano: "",
      descripcionEr: "",
      upc: obj.upc
    }))
  }
  return arr
}

module.exports = subOrdersProductos;