require('./../../../../reclamo_generico')

bot.dialog('/retiro_manual_producto_falla', [
    (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    },
])