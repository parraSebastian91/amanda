bot.dialog('/sectionOC', [
  (session, args, next) => {
    session.userData.dataProgram.palabraCorta = true
    if (args && args.dialogRetry) {
      builder.Prompts.text(session, 'Por favor, ingresa un número de orden válido')
    } else {
      builder.Prompts.text(session, '¿Me podrías indicar el número de tu orden de compra?')
    }
  },
  async (session, results, next) => {
    let ordenDeCompraLength = results.response.replace(/[^\d.]/g, '').length
    results.response = results.response.trim()
    session.userData.orden_compra = results.response
    if (ordenDeCompraLength <= 9 && session.userData.dialogRetry < 2) {
      session.userData.dialogRetry += 1
      session.replaceDialog('/sectionOC', {
        dialogRetry: true
      })
      return
    }

    if (session.userData.dialogRetry == 2) {
      session.send(`El número de orden es incorrecto.`)
      session.userData.dataProgram.palabraCorta = false
      session.endConversation()
    } else {
      session.userData.dialogRetry = 1
      session.userData.dataProgram.palabraCorta = false
      session.endDialogWithResult(results)
    }
  }
])