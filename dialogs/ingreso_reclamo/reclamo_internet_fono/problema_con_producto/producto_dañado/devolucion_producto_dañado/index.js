require('./../../../../reclamo_generico')

bot.dialog('/devolucion_producto_dañado', [
    (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    },
])