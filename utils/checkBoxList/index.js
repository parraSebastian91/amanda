const { obtenerEstadoSubOrden } = require("../../utils/seguimiento/estado_seguimiento")

function bodyAdaptiveCardList(titulo, lista, id) {

    const bodyProducto = [
        {
            "type": "Input.ChoiceSet",
            "id": id || "predeterminado",
            "isMultiSelect": false,
            "style": "compact",
            "spacing": "Medium",
            "title": "Seleccion",
            "placeholder": titulo,
            "choices": choicesList(lista)
        }
    ]
    return bodyProducto
}
function choicesList(lista) {
    let itemsList = []
    for (let i = 0; i < lista.length; i++) {
        itemsList.push({
            "title": lista[i],
            "value": lista[i].toLowerCase()
        })

    }
    return itemsList
}
module.exports = {
    bodyAdaptiveCardList
}