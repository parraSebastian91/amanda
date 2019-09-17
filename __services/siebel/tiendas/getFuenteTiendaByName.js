const tiendas = require("./index");
const logger = require('./../../../utils/logger');

const getFuenteTiendaByName = (zone, tienda) => {
  const fuenteTiendaByName = tiendas.getFuenteTiendaByName(zone, tienda);
  logger.info(`getFuenteTiendaByName, ${JSON.stringify(fuenteTiendaByName)}`)
  return fuenteTiendaByName;
};

module.exports = getFuenteTiendaByName;
