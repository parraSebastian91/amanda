require('dotenv').config()
const request = require('request')
const moment = require('moment')
const { listaOcEnRuta, mensajeEnRuta } = require('./controllerEnRuta')

async function sericeOcEnRuta(session) {
    const detalleOc = await SIEBEL.clienteSubOrdenObtener(session, 'RUT')
    const resultEnRuta = await listaOcEnRuta(detalleOc)
    if (resultEnRuta.length) {
        let msn = await mensajeEnRuta(resultEnRuta)
        return msn
    }
    return null
    }

    module.exports = { sericeOcEnRuta }
