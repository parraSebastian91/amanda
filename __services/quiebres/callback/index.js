require('dotenv').config()
const request = require('request')
const logger = require('./../../../utils/logger')

const callbackBAckOffice = process.env.BACKOFFICE_SOLUCION_CALLBACK
const formatRut = (rut) => {
    return rut.replace(/[^\w]/g, '')
}

const negocio = process.env.BACKOFFICE_CALLBACK_NEGOCIO
const grupoAgentes = process.env.BACKOFFICE_CALLBACK_GRUPOAGENTES
module.exports = {


    async getClienteCallbackQuiebre(rut, telefono, numeroSS) {
        const rutFormat = await formatRut(rut)
        var _Body = "";

        _Body = {
            negocio: `${negocio}`,
            grupoAgentes: `${grupoAgentes}`,
            rut: rutFormat,
            telefono: telefono,
            codigo: numeroSS
        }

        const bodyDataClientInfo = {
            json: true,
            body: _Body
        }
        logger.info(`bodyDataClientInfo, ${JSON.stringify(bodyDataClientInfo)}`)
        const infoClient = await new Promise((resolve, reject) => {
            request.post(`${callbackBAckOffice}`, bodyDataClientInfo, (err, res, body) => {
                if (err) reject(err)
                resolve(body)
            })
        })

        logger.info(`getClienteLlamadaSolicitar, ${JSON.stringify(infoClient)}`)

        return infoClient
    }
}