require('./../../../../reclamo_generico')

bot.dialog('/atencion_comercial', [
    (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    },
])