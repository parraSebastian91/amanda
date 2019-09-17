require('./../../../../reclamo_generico')

bot.dialog('/retiro_de_producto', [
    (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    },
])