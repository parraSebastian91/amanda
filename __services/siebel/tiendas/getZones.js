const tiendas = require("./index");
const logger = require('./../../../utils/logger');

const getZones = () => {
  const zones = tiendas.getZones();
  logger.info(`getZones, ${JSON.stringify(zones)}`)
  return zones;
};

module.exports = getZones;
