const format = require("string-format")

module.exports.ordenCompra = class ordenCompra {
  constructor(rut) {
    this.numero = ''
    this.email = ''
    this.contador = 0
    this.subordenes = []
  }

  direccionToString() {
    if (this.departamento)
      dpto += `, depto. ${this.departamento}`

    return `${this.subordenes[0].calle} ${this.subordenes[0].numero}${dpto}, ${this.subordenes[0].ciudad}`
  }
}