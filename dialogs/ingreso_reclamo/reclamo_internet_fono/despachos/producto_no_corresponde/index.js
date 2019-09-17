require('./../../../reclamo_generico')

bot.dialog('/producto_no_corresponde', [
  (session, args, next) => {
    session.userData.dialogRetry = 1
    switch (session.userData.sectionDialog) {
      default:
        session.beginDialog('/reclamo_generico')
    }
  },
])