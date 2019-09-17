require('./../../reclamo_generico')
const botReply = require('./text')

bot.dialog('/experiencia_compra', [
    (session, args, next) => {
        //session.userData.requirePayMethod = true
        session.userData.nivel2 = 'Publicidad engañosa'
        session.userData.nivel3 = 'Publicidad engañosa'
        session.beginDialog('/reclamo_generico')
    },
])