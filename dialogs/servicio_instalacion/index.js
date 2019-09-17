// const builder = require('botbuilder')
const instalacion_domicilio_costo = require('./costo')
const instalacion_domicilio_productos = require('./productos')
const instalacion_domicilio_cobertura = require('./cobertura')
const instalacion_domicilio_plazo = require('./plazo')

// lib.dialog('instalacion_domicilio_costo', instalacion_domicilio_costo)
// global
// .triggerAction({
//   matches: 'Instalacion_domicilio_costo'
// })
// lib.dialog('instalacion_domicilio_productos', instalacion_domicilio_productos)
// global
// .triggerAction({
//   matches: 'Instalacion_domicilio_productos'
// })
// lib.dialog('instalacion_domicilio_cobertura', instalacion_domicilio_cobertura)
// global
// .triggerAction({
//   matches: 'Instalacion_domicilio_cobertura'
// })
// lib.dialog('instalacion_domicilio_plazo', instalacion_domicilio_plazo)
// global
// .triggerAction({
//   matches: 'Instalacion_domicilio_plazo'
// })

// module.exports = {
//   createLibrary() {
//     return lib
//   }
// }
module.exports = {
  instalacion_domicilio_costo,
  instalacion_domicilio_productos,
  instalacion_domicilio_cobertura,
  instalacion_domicilio_plazo
}