require('./../../../reclamo_generico')

bot.dialog('/producto_incompleto', [
  (session, args, next) => {
    session.userData.dialogRetry = 1
    switch (session.userData.sectionDialog) {
      default:
        session.beginDialog('/reclamo_generico')
    }
  },
])