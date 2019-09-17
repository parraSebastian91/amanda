const createThumbnailCard = require('./../gif')
const Enumerable = require('linq')
const tiendaService = require('./../../__services/tienda')
const maps = require('./../maps')

module.exports = {
  async calcularTiendaPorIntentType(intentType) {
    const entities = Enumerable.from(intentType.entities).where(e => e.type == 'Tienda').toArray()

    for (var i = entities.length - 1; i >= 0; i--) {
      const tienda = await tiendaService.getByName(entities[i].resolution.values[0])
      if (tienda != null && tienda.id !== null && typeof(tienda.id) != 'undefined' && tienda.id !== 0) {
        return tienda
      } else {
        const tienda = await tiendaService.getByName(entities[i].entity)
        if (tienda != null && tienda.id !== null && typeof(tienda.id) != 'undefined' && tienda.id !== 0) {
          return tienda
        }
      }
    }
    return null
  },
  generateMap(session, tienda, direccion) {
    const urlImgMap = maps.toImgUrl({
      latitude: tienda.latitude,
      longitude: tienda.longitude
    })
    const urlMap = maps.toUrl({
      latitude: tienda.latitude,
      longitude: tienda.longitude
    })
    //const thumbnailResult = createThumbnailCard.img(session, tienda.nombreFantasia, urlImgMap, 'Ver', urlMap, 'Abrir en Google Maps')
    const thumbnailResult = createThumbnailCard.img(session, tienda.nombreFantasia, urlImgMap, direccion, urlMap, 'Abrir en Google Maps')
    return thumbnailResult
  }
}