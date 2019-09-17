require('./../../functions/ingresoDatos/sectionEndConversation')
const botReply = require('./text')
require('./sectionZone')
require('./sectionTienda')
const { MensajeDeAyuda } = require('../../utils')
require('./../../functions/ingresoDatos/sectionSku')

bot.dialog('/consulta_stock', [
    (session, args, mext) => {
        session.send(botReply.inicioConsultaStock)
        session.beginDialog('/sectionSku')
    },
    (session, results, next) => {
        session.userData.sku = results.sku
        session.send(botReply.seleccionarZona)
        session.beginDialog('/sectionZone')
    },
    async (session, results, next) => {
        session.dialogData.zona = results.zona
        if (session.dialogData.zona === "falabella.com") {
            session.dialogData.stock = []
            for (const nFuente of ['2000', '9944', '9906']) {
                let stock = await SIEBEL.getStock({
                    'sku': session.userData.sku,
                    'fuente': nFuente
                })
                session.dialogData.stock.push(stock)
            }
            const existeStockOnline = (session.dialogData.stock.indexOf(true) !== -1)
            next({ existeStockOnline })
        } else {
            session.send(botReply.seleccionarTienda)
            session.beginDialog('/sectionTiendaZona', session.dialogData)
        }

    },
    async (session, results, next) => {
        if (results.existeStockOnline != undefined) {
            if (results.existeStockOnline) {
                next({ "fuente": "stockOnline" })
            } else {
                next({ "fuente": "sinStockOnline" })
            }
        }
        let nFuente = SIEBEL.getFuenteTiendaByName(results.zona, results.tienda)
        let stock = await SIEBEL.getStock({
            'sku': session.userData.sku,
            'fuente': nFuente
        })
        if (stock) {
            next({ "fuente": "stockTienda" })
        } else if (results.zona !== undefined && stock !== true) {
            next({ "fuente": "sinStockTienda" })
        }
    },
    async (session, results, next) => {
        switch (results.fuente) {
            case "stockOnline":
                session.send(botReply.stockOnine)
                break;
            case "sinStockOnline":
                session.send(botReply.sinStockOnline)
                break;
            case "stockTienda":
                session.send(botReply.stockTienda)
                break;
            case "sinStockTienda":
                session.send(botReply.sinStockTienda)
                break;
        }
        session.beginDialog('/end_conversation')
        // MensajeDeAyuda(session)
        //session.endDialog()
    }
])