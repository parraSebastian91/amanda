require('./../../../../reclamo_generico')

bot.dialog('/envio_manual_producto', [
    (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    },
])