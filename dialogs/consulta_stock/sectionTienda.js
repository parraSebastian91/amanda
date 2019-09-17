const { bodyAdaptiveCardList } = require("../../utils/checkBoxList/index")
const { AdaptiveCard } = require("../../utils")
bot.dialog('/sectionTiendaZona', [
    (session, args, next) => {
        session.dialogData.zona = session.dialogData.zona || args.zona
        let validarValue = ("value" in session.message)
        let validaTienda = (validarValue && "listSeleccionTienda" in session.message.value)
        let tienda = validaTienda ? session.message.value.listSeleccionTienda : null
        if (validaTienda && tienda && tienda !== "Selecciona Tienda") {
            next(session.message.value)
        } else {
            let bodytienda = bodyAdaptiveCardList("Selecciona Tienda", SIEBEL.getTiendasByZone(session.dialogData.zona), "listSeleccionTienda")
            const action = [
                {
                    "type": "Action.Submit",
                    "title": "Ok",
                    "data": { "message": "listSeleccionTienda" }
                }
            ]
            session.send(AdaptiveCard(session, bodytienda, action))
        }
    },
    (session, args, next) => {
        session.dialogData.tienda = session.message.value.listSeleccionTienda
        if (session.message.value.listSeleccionTienda === "Selecciona Tienda") {
            session.replaceDialog('/sectionTiendaZona', session.dialogData)
        }
        else {
            session.endDialogWithResult(session.dialogData)
        }
    }
])