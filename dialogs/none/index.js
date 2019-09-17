// Se va a dar uso posterior a la migración.
bot.dialog('/none', [
  (session, args, next) => {
    session.send('¡Lo siento! No te he podido entender bien. Podrías intentar preguntarme de otra forma.')
    session.endConversation()
  }
])