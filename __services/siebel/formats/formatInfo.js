const formatDocument = require("../formats/siebelFormatDocument")
const phone = require("../../../functions/validaciones/telefono.js")

const formatInfo = (rut, user, dialogUserInfo, order, subOrder, flagSKU = true) => {
  const siebelFormatDocument = formatDocument(rut)
  let separatePhone = ""
  if (dialogUserInfo.telefono) {
    separatePhone = phone.separatePhone({
      response: dialogUserInfo.telefono
    });
  } else {
    separatePhone = phone.separatePhone({
      response: "56999646061"
    })
  }

  const product = {
    numeroOrdenCompra: null,
    sku: null,
    numeroSuborden: null
  }
  product.numeroOrdenCompra = order.order.id
  if (flagSKU) {
    product.sku = subOrder.products[0].sku
  } else {
    product.sku = ""
  }
  product.numeroSuborden = subOrder.id;
  return {
    persona: {
      nombre: user.nombre,
      apellidoMaterno: user.apellidoMaterno,
      apellidoPaterno: user.apellidoPaterno,
      Telefono: separatePhone,
      documento: {
        tipo: siebelFormatDocument.tipo,
        numero: siebelFormatDocument.numero,
        digitoVerificador: siebelFormatDocument.digitoVerificador
      },
      nacionalidad: user.nacionalidad
    },
    ServiceRequest: {
      estadoF12: dialogUserInfo.estadoF12,
      nivel1: dialogUserInfo.nivel1,
      nivel2: dialogUserInfo.nivel2,
      nivel3: dialogUserInfo.nivel3,
      descripcion: dialogUserInfo.descripcion,
      medioPago: dialogUserInfo.medioPago,
      fechaCompra: dialogUserInfo.fechaCompra.replace(/\//g, "-"),
      tiendaOrigen: dialogUserInfo.tiendaOrigen,
      numeroOrdenCompra: product.numeroOrdenCompra,
      sku: product.sku,
      numeroSuborden: product.numeroSuborden,
      idTicket: dialogUserInfo.idTicket, //cm
      terminal: dialogUserInfo.terminal, //cm
      secuencia: dialogUserInfo.secuencia, //cm
      ListOfSKUF12: {
        SKUF12: dialogUserInfo.ListOfSKUF12
      }
    }
  }
}

module.exports = formatInfo