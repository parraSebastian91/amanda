const formatDocument = require("../formats/siebelFormatDocument")
const phone = require("../../../functions/validaciones/telefono.js")

const simpleFormatInfo = userData => {
  const siebelFormatDocument = formatDocument(userData.rut)
  let separatePhone = ""
  if (userData.telefono) {
    separatePhone = phone.separatePhone({
      response: userData.telefono
    })
  } else {
    separatePhone = phone.separatePhone({
      response: "56999646061"
    })
  }
  return {
    persona: {
      nombre: userData.nombre,
      apellidoMaterno: userData.apellidoMaterno,
      apellidoPaterno: userData.apellidoPaterno,
      telefono: separatePhone,
      documento: {
        tipo: siebelFormatDocument.tipo,
        numero: siebelFormatDocument.numero,
        digitoVerificador: siebelFormatDocument.digitoVerificador
      },
      nacionalidad: userData.nacionalidad
    },
    ServiceRequest: {
      nivel1: userData.nivel1,
      nivel2: userData.nivel2,
      nivel3: userData.nivel3,
      descripcion: userData.descripcion,
      numeroOrdenCompra: userData.orden_compra || "",
      Attachment: userData.Attachment || ""
    }
  }
}

module.exports = simpleFormatInfo