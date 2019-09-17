require('./../../../../reclamo_generico')

bot.dialog('/devolucion_nota_credito', [
    (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    },
])