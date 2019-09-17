const { obtenerEstadoSubOrden } = require("../../utils/seguimiento/estado_seguimiento")
const { TIPO_SOLICITUD } = require('./../../dialogs/informacion_orden_compra/functions')
const logger = require('./../../utils/logger')

function obtenerMensajeIncumplimientoFecha(subOrden) {
    let textoIncumplimiento = ''
    if (subOrden.dialogo == TIPO_SOLICITUD.INCUMPLIMIENTO_FECHA || subOrden.dialogo == TIPO_SOLICITUD.INCUMPLIMIENTO_FECHA_FUERA_HORARIO) {
        textoIncumplimiento = `</br>Ha ocurrido un inconveniente al consultar los datos ingresados. Recuerda que también puedes ingresar tus solicitudes o realizar el seguimiento de tu orden en el siguiente <a href="https://www.falabella.com/falabella-cl/mi-cuenta/ordenes">link</a>)`
        if (subOrden.estado !== null && subOrden.estado.length > 0) {
            let _estado = subOrden.estado[0].ss
            textoIncumplimiento = `</br>Conmigo puedes hacerle seguimiento a tu caso usando el número: <b>${_estado}</b>`
                //textoIncumplimiento = `</br>Sabemos que tu despacho aún se encuentra con inconvenientes. Continuamos gestionando el envío de tu compra. El número de seguimiento de tu caso es: <b>${_estado}</b>`
                //textoIncumplimiento = `</br>Tu caso es muy importante para nosotros, es por eso que hemos creado una solicitud por este inconveniente. El número con el cual puedes realizar el seguimiento es: <b>${_estado}</b>`
        }
    }
    return textoIncumplimiento

}

function bodyAdaptiveCard(productos, isBroken = false) {
    let title = `${(productos.length > 1) ? "Hemos dividido tu orden para que la puedas visualizar con detalle:" : "El detalle de tu orden es el siguiente:"}`
    if (isBroken) {
        title = "Tuvimos un problema con tu orden de compra y el siguiente producto no pobrá ser entregado:"
    }
    const bodyProducto = [{
        "type": "TextBlock",
        "id": "txtTitulo",
        "horizontalAlignment": "Left",
        "text": title
    }, ]
    return bodyProducto
}

function mostrarProducto(subOrdenes, isBroken = false) {
    logger.info("mostrarProducto inicio")
    var bodyproductos;
    var tmp;
    var contSuborden = 0;
    var contContainer = 3;
    bodyproductos = bodyAdaptiveCard(subOrdenes[contSuborden].sub_orden.products, isBroken)

    for (var i = 0; i < subOrdenes.length; i++) {
        let numproductos = subOrdenes[i].sub_orden.products.length
        let numColumSet = Math.ceil(numproductos / 3)
        const colunmsArray = []
        let _obtenerMensajeIncumplimientoFecha = obtenerMensajeIncumplimientoFecha(subOrdenes[i])
        let detalle = ""
        let despacho = ""
        let producto = ""
        if (!isBroken) {
            detalle = `<b>Detalle:</b> ${(_obtenerMensajeIncumplimientoFecha != '') ? obtenerEstadoSubOrden(subOrdenes[i]) + '</br>' + _obtenerMensajeIncumplimientoFecha + '</br>' : obtenerEstadoSubOrden(subOrdenes[i])}`
            despacho = `<b>N° Despacho:</b> ${subOrdenes[i].sub_orden.id}`
            producto = `${(numproductos > 1) ? "Productos" : "Producto"}`
        }

        bodyproductos.push({
            "separator": (subOrdenes.length > 1 && i >= 1) ? true : false,
            "type": "TextBlock",
            "id": "txtDespacho",
            "weight": "Bolder",
            "text": despacho
        }, {
            "type": "TextBlock",
            "id": "txtProducto",
            "horizontalAlignment": "Left",
            "weight": "Bolder",
            "text": producto
        }, {
            "type": "Container",
            "items": []
        }, {
            "type": "TextBlock",
            "id": "txtEstado",
            "text": detalle,
        })

        for (var y = 1; y <= numColumSet; y++) {
            bodyproductos[contContainer].items.push({
                "type": "ColumnSet",
                "id": "clmnSetProducto",
                "horizontalAlignment": "Center",
                "columns": null
            })
        }

        subOrdenes[i].sub_orden.products.map(function(el) {
            let colunmBody = {
                "type": "Column",
                "id": "clmnProducto",
                "horizontalAlignment": "Center",
                "spacing": "Medium",
                "items": [{
                        "type": "Image",
                        "id": "imgProducto",
                        "horizontalAlignment": "Center",
                        "url": `${el.image_url}`,
                        "size": "Medium"
                    },
                    {
                        "type": "TextBlock",
                        "id": "txtProducto",
                        "horizontalAlignment": "Center",
                        "text": `${el.description}`,
                        "isSubtle": true
                    }
                ],
                "width": "auto"
            }
            colunmsArray.push(colunmBody)
        })
        bodyproductos[contContainer].items.forEach(function(e, i) {
            tmp = colunmsArray.splice(0, 3)
            e.columns = tmp
        })

        // Contador para inicializar el body del adaptive card
        contSuborden = contSuborden + 1
            // Contador para contar los container de cada sub orden
        contContainer = contContainer + 4
    }
    //console.log(bodyproductos)
    logger.info(JSON.stringify(bodyproductos))
    return bodyproductos
}
module.exports = {
    bodyAdaptiveCard,
    mostrarProducto
}