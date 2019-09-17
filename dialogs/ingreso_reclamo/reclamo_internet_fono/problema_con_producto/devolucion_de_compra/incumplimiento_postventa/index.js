require('./../../../../reclamo_generico')

bot.dialog('/incumplimiento_postventa', [
    (session, args, next) => {
        session.beginDialog('/reclamo_generico')
    },
])
