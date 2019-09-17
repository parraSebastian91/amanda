// *****************************************************************
// *                        Manejo con Google Maps                 *
// *****************************************************************

const format = require('string-format');

module.exports = {
  getMarkerString(origen) {
    return format('markers=size:{}|color:{}|label:{}|{},{}', process.env.MAPS_MARKER_SIZE, process.env.MAPS_MARKER_COLOR, process.env.MAPS_MARKER_LABEL, origen.latitude, origen.longitude)
  },
  toImgUrl(origen) {
    const markerString = this.getMarkerString(origen)
    const urlMapGoogle = format(
      '{}?{}&{}&{}&{}&{}', process.env.MAPS_URL_IMG_MAP_GOOGLE, format('center={},{}', origen.latitude, origen.longitude), 'zoom=' + process.env.MAPS_ZOOM, 'size=' + process.env.MAPS_SIZE, 'key=' + process.env.MAPS_API_KEY_GOOGLE, markerString
    )
    return urlMapGoogle
  },
  toUrl(origen) {
    return format('{}{},{}', process.env.MAPS_URL_MAP_GOOGLE, origen.latitude, origen.longitude)
  }
}