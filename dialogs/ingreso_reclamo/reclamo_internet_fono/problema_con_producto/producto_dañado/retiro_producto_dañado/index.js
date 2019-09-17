require('./../../../../reclamo_generico')

bot.dialog('/retiro_producto_dañado', [
    (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    },
])