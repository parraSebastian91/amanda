require('./../../../../reclamo_generico')

bot.dialog('/envio_mismo_producto', [
    (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    },
])