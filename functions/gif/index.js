module.exports = {
  gif(session, title, url) {
    return new builder.AnimationCard(session)
      .title(title || '')
      .media([{
        url: url || ''
      }])
  },
  img(session, title, url, text, urlButton, textButton) {
    return new builder.ThumbnailCard(session)
      .title(title || '')
      .images([{
        url: url || '',
      }])
      .tap(builder.CardAction.openUrl(session, urlButton))
      .subtitle(text || 'Ver')
      .buttons([
        builder.CardAction.openUrl(session, urlButton, textButton)
      ])
  },
}