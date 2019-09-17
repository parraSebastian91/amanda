const tiendas = require('./tiendas.js')
const tiendas_zona = require('./tiendas_zona.js')
const Enumerable = require('linq')

String.prototype.capitalize = function () {
  return this.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase()
  })
}

module.exports = {
  getZones() {
    return Enumerable.from(tiendas).select((val, i) => (val.zona.capitalize())).toArray()
  },
  getTiendasByZone(zona) {
    const tiendasArray = Enumerable.from(tiendas).where(`$.zona == '${zona}'`).select((val, i) => (val.tiendas[0])).toArray()
    return Enumerable.from(tiendasArray[0]).where(t => t.tienda != 9944).select((val, i) => (val.tienda)).toArray()
  },
  getFuenteTiendaByName(zona, tienda) {
    const tiendasArray = Enumerable.from(tiendas).where(`$.zona == '${zona}'`).select((val, i) => (val.tiendas[0])).toArray()
    return Enumerable.from(tiendasArray[0]).where(t => t.tienda.toLocaleLowerCase() == tienda.toLocaleLowerCase()).select((val, i) => (val.fuente)).toJoinedString()
  }
}