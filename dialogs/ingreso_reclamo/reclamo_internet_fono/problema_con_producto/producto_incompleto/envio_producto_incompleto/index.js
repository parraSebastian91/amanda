require('./../../../../reclamo_generico')

bot.dialog('/envio_producto_incompleto', [
    (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    },
])