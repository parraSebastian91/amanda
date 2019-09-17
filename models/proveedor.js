const format = require("string-format")

module.exports.proveedor = class proveedor {
  constructor(nombre) {
    this.nombre = nombre || ''
    this.contador = 0
  }

  cargar(columns) {

    this.id_serviciotecnico = columns[0].value // id_serviciotecnico
    this.nombre_marca = columns[1].value // nombre_marca
    this.nombre_proveedor = columns[2].value // nombre_proveedor
    this.email_proveedor = columns[3].value // email_proveedor
    this.numero_proveedor = columns[4].value // numero_proveedor
    this.numero_proveedor_secundario = columns[5].value // numero_proveedor_secundario
    this.numeroToString = format(" y su número de contacto es <a href=\"tel:{0}\">{0}</a>", this.numero)
    this.numeroSecundarioToString = format(" - <a href=\"tel:{0}\">{0}</a>", this.numeroSecundario)

  }
}

module.exports.columns = function() {
  return 'id_serviciotecnico' +
    ', nombre_marca' +
    ', nombre_proveedor' +
    ', email_proveedor' +
    ', numero_proveedor' +
    ', numero_proveedor_secundario'
}