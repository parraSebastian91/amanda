
bot.dialog('/tengo_una_pregunta',[
    async(session, arg) =>{
        session.send('Perfecto. ¿En qué te puedo ayudar?')
        session.endDialog()
    } 
])
