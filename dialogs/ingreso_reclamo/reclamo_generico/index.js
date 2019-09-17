require('./../../../functions/ingresoDatos/sectionOCEMailReclamo')
//require('../../../functions/ingresoDatos/sectionPhone')

bot.dialog('/reclamo_generico', [
  (session, args, next) => {
    session.userData.dialogRetry = 1
    switch (session.userData.sectionDialog) {
      default: session.beginDialog('/sectionOCEMailReclamo')
    }
  }
])