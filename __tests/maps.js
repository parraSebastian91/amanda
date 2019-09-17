const maps = require('../functions/maps')
const origen = JSON.parse(process.env.MAPS_ORIGEN)

console.log('UrlImg : '+maps.toImgUrl(origen))

console.log('Url : '+maps.toUrl(origen))