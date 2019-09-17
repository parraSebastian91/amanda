// *****************************************************************
// *                        Solo para webtracking                  *
// *****************************************************************

bot.dialog('/sectionOrder', [
  (session, args, next) => {
    session.userData.dataProgram.palabraCorta = true
    if (args && args.dialogRetry) {
      session.userData.dataProgram.palabraCorta = false
      builder.Prompts.text(session, 'Por favor, ingresa un número de orden de compra válido')
    } else {
      builder.Prompts.text(session, 'Por favor ingresa el número de orden')
    }

  },
  async (session, results, next) => {
    let ordenDeCompraLength = results.response.trim().replace(/[^\d.]/g, '').length

    if (ordenDeCompraLength <= 9 && session.userData.dialogRetry < 2) {
      session.userData.dialogRetry += 1
      session.userData.dataProgram.palabraCorta = false
      session.replaceDialog('/sectionOrder', {
        dialogRetry: true
      })
      return
    }
    if (session.userData.dialogRetry == 2) {
      session.userData.dataProgram.palabraCorta = false
      session.send(`El número de orden es incorrecto.`)
      session.endConversation()
    } else {
      session.userData.dialogRetry = 1
      session.userData.dataProgram.palabraCorta = false
      session.userData.orderNumber = results.response
      session.send(`Estoy consultando los datos ingresados de la compra.`)
      const getOrder = await WEBTRACKING.getOrder(session)
      console.info('getOrder')
      console.info(getOrder)
      if (getOrder.success) {
        const products = getOrder.state.sub_orders[0].products
        //debo iterar sobre productos para sacar el nombre
        if (products.length > 0) {
          let productsDescription = 'Estos son los productos de tu orden de compra \n\n';
          products.forEach(function(e) {
            productsDescription += '* ' + e.description
          })
          productsDescription += `\n\n . Para más información, puedes ver el detalle en [este link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes/seguimiento-de-orden/${session.userData.orderNumber})`
          session.send(productsDescription)
        }
      } else {
        session.userData.dataProgram.palabraCorta = false
        session.send('Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)')
      }
      session.userData.dataProgram.palabraCorta = false
      session.endConversation()
    }
  }
])