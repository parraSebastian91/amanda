bot.dialog('/copia_boleta', [
    (session, args, next) => {
    session.beginDialog('/datos_documentos_tributarios',{tipoDocumento: 'boleta'})
    }
  ])