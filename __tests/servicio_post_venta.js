require('dotenv').config()
const parameters = JSON.parse(process.env.CALLBACK_INFO)

console.log(GENESYS.getSolicitudEstadoOrden(parameters))