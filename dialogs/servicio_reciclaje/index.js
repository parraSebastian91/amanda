// const builder = require('botbuilder')
const reciclaje_domicilio_costo = require('./costo')
const reciclaje_domicilio_productos = require('./productos')
const reciclaje_domicilio_empresas = require('./empresas')
const reciclaje_domicilio_cobertura = require('./cobertura')

// const lib = new builder.Library('servicio_reciclaje')

// global
// .triggerAction({
//   matches: 'Reciclaje_domicilio_costo'
// })
// bot.dialog('/reciclaje_domicilio_empresas', reciclaje_domicilio_empresas)
// global
// .triggerAction({
//   matches: 'Reciclaje_domicilio_empresas'
// })
// bot.dialog('/reciclaje_domicilio_productos', reciclaje_domicilio_productos)
// global
// .triggerAction({
//   matches: 'Reciclaje_domicilio_productos'
// })
// bot.dialog('/reciclaje_domicilio_cobertura', reciclaje_domicilio_cobertura)
// global
// .triggerAction({
//   matches: 'Reciclaje_domicilio_cobertura'
// })


module.exports = {
  reciclaje_domicilio_costo,
  reciclaje_domicilio_productos,
  reciclaje_domicilio_empresas,
  reciclaje_domicilio_cobertura
}
