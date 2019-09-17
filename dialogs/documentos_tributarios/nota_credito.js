bot.dialog('/informacion_nota_credito', [
    (session, args, next) => {
    session.beginDialog('/datos_documentos_tributarios',{tipoDocumento: 'notaCredito'})
    }
  ])