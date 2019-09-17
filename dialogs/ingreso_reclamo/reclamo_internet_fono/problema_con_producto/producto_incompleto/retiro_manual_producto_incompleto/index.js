require('./../../../../reclamo_generico')

bot.dialog('/retiro_manual_producto_incompleto', [
    (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    },
])