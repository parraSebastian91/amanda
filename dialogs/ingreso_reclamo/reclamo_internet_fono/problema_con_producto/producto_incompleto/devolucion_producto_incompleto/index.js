require('./../../../../reclamo_generico')

bot.dialog('/devolucion_producto_incompleto', [
    (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    },
])