require('./../../../reclamo_generico')

bot.dialog('/cambio_fecha_entrega', [
  (session, args, next) => {
    session.userData.dialogRetry = 1
    switch (session.userData.sectionDialog) {
      default:
        session.beginDialog('/reclamo_generico')
    }
  },
])