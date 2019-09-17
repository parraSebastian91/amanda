const tiendas = require('./index');
const logger = require('./../../../utils/logger');

const getTiendasByZone = (zone) => {
    const tiendasByZone = tiendas.getTiendasByZone(zone)
    logger.info(`getTiendasByZone, ${JSON.stringify(tiendasByZone)}`)
    return tiendasByZone
  }

  module.exports = getTiendasByZone
  