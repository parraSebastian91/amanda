require('./../../../../reclamo_generico')

bot.dialog('/devolucion_de_producto', [
    (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    },
])