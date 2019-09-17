const { bodyAdaptiveCardList } = require("../../utils/checkBoxList/index")
const { AdaptiveCard } = require("../../utils")
bot.dialog('/sectionZone', [
    (session, args, next) => {
        let validarValue = ("value" in session.message)
        let validarZona = (validarValue && "listSeleccionZona" in session.message.value)
        let zona = validarZona ? session.message.value.listSeleccionZona : null
        if (validarZona && zona && zona !== "Selecciona Zona") {
            next(session.message.value)
        } else {
            let bodyZona = bodyAdaptiveCardList("Selecciona Zona", SIEBEL.getZones(), "listSeleccionZona")
            const action = [
                {
                    "type": "Action.Submit",
                    "title": "Ok",
                    "data": { "message": "listSeleccionZona" }
                }
            ]
            session.send(AdaptiveCard(session, bodyZona, action))
        }
        // session.endDialogWhitResults()
        // builder.Prompts.text(session, AdaptiveCard(session, bodyZona, action))
    },
    (session, args, next) => {
        session.dialogData.zona = session.message.value.listSeleccionZona
        if (session.message.value.listSeleccionZona === "Selecciona Zona") {
            session.replaceDialog('/sectionZone', session.dialogData)
        }
        else {
            session.endDialogWithResult(session.dialogData)
        }
    }
])