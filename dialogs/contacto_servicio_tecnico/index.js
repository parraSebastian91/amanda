const botReply = require('./text')
const proveedorService = require('./../../__services/proveedor')
require('./../feedback')

function validaMarca(response) {
  
  var validaMarca = {
    'marca':false,
    'mensaje':''
  }
  try {
    let marca = response.toLocaleLowerCase().trim()
    const wurden = ('wurden').toLocaleLowerCase().trim()
    const recco = ('recco').toLocaleLowerCase().trim()
    if(marca == wurden ){
      validaMarca.marca = true
      validaMarca.mensaje =botReply.servicioTecnico_wurden
    }else if (marca == recco){
      validaMarca.marca = true
      validaMarca.mensaje = botReply.servicioTecnico_recco
    }
    return validaMarca
  } catch (error) {
    return validaMarca
  }
}
bot.dialog('/contacto_servicio_tecnico', [
  (session, args, next) => {
    builder.Prompts.text(session, botReply.text1)
  },
  async (session, results, next) => {
    try {
      let marcaResult = validaMarca(results.response)
      if (marcaResult.marca) {
        session.send(marcaResult.mensaje)
      }
      else {
        const proveedor = await proveedorService.getByName(results.response)
        if (proveedor != null && proveedor.id_serviciotecnico !== null && typeof (proveedor.id_serviciotecnico) != 'undefined') {
          var regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
          if (regex.test(proveedor.email_proveedor)) {
            if (proveedor.numero_proveedor !== null && typeof (proveedor.numero_proveedor) != 'undefined') {
              session.send(`El correo de ${proveedor.nombre_proveedor} es: ${proveedor.email_proveedor} y su número de contacto es [${proveedor.numero_proveedor}](tel: ${proveedor.numero_proveedor}) .`)
            }
            else {
              session.send(`El correo de ${proveedor.nombre_proveedor} es: ${proveedor.email_proveedor} .`)
            }

          }
          else {
            if (proveedor.numero_proveedor !== null && typeof (proveedor.numero_proveedor) != 'undefined') {
              session.send(`La dirección de ${proveedor.nombre_proveedor} [aquí](${proveedor.email_proveedor}) y su número de contacto es [${proveedor.numero_proveedor}](tel: ${proveedor.numero_proveedor}) .`)
            }
            else {
              session.send(`La dirección de ${proveedor.nombre_proveedor} [aquí](${proveedor.email_proveedor}) .`)
            }
          }

        } else if (proveedor && proveedor.error && proveedor.error === '504') {
          //Si falla la DB SQL se manda un mensaje generico
          session.send(botReply.servicioTecnico_error)
        } else {
          session.send(botReply.servicioTecnico_sin_informacion)
        }
      }
    }
    catch (e) {
      session.send(botReply.servicioTecnico_sin_informacion)
    }
    session.endConversation()
  }
])