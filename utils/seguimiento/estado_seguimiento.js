const moment = require("moment")
const { KeyInObj } = require("../../utils")
const mascaraAlertaMicroSteps = require("./enmascararAlertaMicroSteps.json")
const mascaraStatusMicroSteps = require("./enmascararStatusMicroSteps.json")

const text = require("./text")
// divide la linea de la animacion en base a los macro steps existen
function divFormatoEstado(macroSteps, estadoRetiroTienda, store) {
    // se contabiliza el numero de circulos por los macrosteps existentes
    var cuerpoDiv = function () {
        var steps = ""
        var estadoSubOrden = ""
        try {
            for (let i = 0; i <= 3; i++) {
                switch (i) {
                    case 0:
                        estadoSubOrden = "Orden recibida"
                        break;
                    case 1:
                        if (typeof macroSteps[i] == 'undefined') {
                            estadoSubOrden = "Orden confirmada"
                        } else {
                            estadoSubOrden = (macroSteps[i].status == "Orden cancelada") ? "Orden cancelada" : "Orden confirmada"
                        }
                        break;
                    case 2:
                        if (typeof macroSteps[i] == 'undefined') {
                            estadoSubOrden = (estadoRetiroTienda) ? "Orden lista para retiro" : "Orden en camino"
                        } else if (macroSteps[i].status == "Orden cancelada") {
                            estadoSubOrden = "Orden cancelada"
                        } else {
                            estadoSubOrden = (store) ? "Orden lista para retiro" : "Orden en camino"
                        }
                        break
                    case 3:
                        if (typeof macroSteps[i] == 'undefined') {
                            estadoSubOrden = "Orden entregada"
                        } else {
                            estadoSubOrden = (macroSteps[i].status == "Orden cancelada") ? "Orden cancelada" : "Orden entregada"
                        }
                        break;
                }
                let fechaMacroStep = (i > macroSteps.length - 1) ? '' : macroSteps[i].date.split("/")
                //var fechaMacroStep = macroSteps[i].date.split("/")
                var divStep = `<div class="fb-timeline__step fb-timeline__step-${i + 1} ${(macroSteps[i] && macroSteps[i].status) ? "fb-timeline__active" : false} " data-status="activo">
            <div class="fb-timeline__step__circle fb-timeline__step__circle-${i + 1}"></div>
            <div class="fb-timeline__step__text fb-timeline__step__text-${i + 1} ${(i === macroSteps.length - 1) && "fb-timeline__step__text__active"}">
            <span>${estadoSubOrden}</span>
            <span>${ (fechaMacroStep !== '') ? fechaMacroStep[2] + '/' + fechaMacroStep[1] : ""}</span>
            </div>
            </div>`
                steps = steps.concat(divStep)
            }
            return steps
        } catch (error) {
            console.log(error)
        }
    }

    
    var cabeceraDiv = `<div class="fb-timeline__wrap animacion_terminada">
    <div class="fb-timeline__bar"></div>
    <div class="fb-timeline__bar-progress" style="width:${25 * macroSteps.length}%;"></div>
    ${cuerpoDiv()}
    </div>`
    // console.log(cabeceraDiv)
    return cabeceraDiv
}
function statusAmanda(microSteps) {
    let statusMicro = ""
    mascaraStatusMicroSteps.forEach(function (element) {
        if (element.msgStatus == microSteps[microSteps.length - 1].status) {
            statusMicro = element.msgStatusAmanda
        }
    })
    return (statusMicro == "") ? microSteps[microSteps.length - 1].status : statusMicro
}

function alertaAmanda(microSteps) {
    let msgAlerta = ''
    mascaraAlertaMicroSteps.forEach(function (element) {
        if (element.msgAlerta == microSteps[microSteps.length - 1].alert.message) {
            msgAlerta = element.msgAlertaAmanda
        }
    })
    var a = (msgAlerta != '') ? msgAlerta : microSteps[microSteps.length - 1].alert.message 
    return a
}

function divMapa(e) {
    var cuerpoMapa = `<div>
  <p>Tu orden <strong>ya está lista para ser retirada</strong>. Recuerda que has solicitado el retiro de tu producto
    en <strong style="color: #8aac02;">${e.store.name}</strong> para el <strong>${e.fechaEntrega}</strong>. No olvides
    presentar carnet de identidad y número de orden al momento del retiro. <br />Recuerda que desde que recibes el
    e-mail de retiro, tienes 3 días para ir a buscar tu compra. Lo puedes hacer a cualquier hora mientras la tienda
    esté abierta. Posterior a este plazo, tu orden quedará anulada, por lo que deberás realizar nuevamente tu compra</p>
  <p class="ver_detalle_orden_compra" onclick="accionDetalleOrdenCompra(this);" style="cursor: pointer; text-align: center; color: #aad500; font-weight: bold; margin-top: 10px;">Detalle
    <span>[+]</span></p>
  <div style="display: none;">El horario de atención es de <strong>${e.horarioSucursal} hrs.</strong>
        <br />Mapa zona de retiro: <img class = "mapa_zona_retiro" src = "${e.store.map}" width = "150" alt = "Haz clíc para ampliar la imagen"
    title = "Haz clíc para ampliar la imagen" ></div >
</div >`
    //console.log(e.fechaEntrega)
    return cuerpoMapa
}

function GenerarMensaje(subOrden){
    var msj_full = alertaAmanda(subOrden.sub_orden.micro_steps)
    let substr = msj_full.substring(0, (msj_full.length-12)) 
    if(substr === text.to_replace_incumplimiento_entrega )
    {
        var msjSeguimiento = text.replace_incumplimiento_entrega
        var sss = (subOrden.estado != null && subOrden.estado.length != 0)?subOrden.estado[0].ss : '' // se agrega validación si estado es nulo
        msjSeguimiento = msjSeguimiento.replace('$numSS',sss)
        msj_full = `${msj_full} </br> ${msjSeguimiento}`
    }  
    return  msj_full    
}

function obtenerEstadoSubOrden(subOrden) {
    // valida con true o false todas las constante
    const macroSteps = subOrden.sub_orden.macro_steps
    const microSteps = subOrden.sub_orden.micro_steps
    const alerta = ("alert" in microSteps[microSteps.length - 1])
    const store = ("store" in subOrden.sub_orden)
    const mapaLocal = (store) && KeyInObj(subOrden.sub_orden.store, "map")
    const despachoHogar = subOrden.sub_orden.delivery_status.is_delivered
    const quiebre = subOrden.sub_orden.delivery_status.is_broken
    const incumplimiento = despachoHogar && subOrden.sub_orden.delivery_status.initial_date
    const cancelada = subOrden.sub_orden.delivery_status.is_canceled
    const reprogramacion = subOrden.sub_orden.delivery_status.is_rescheduled && (subOrden.sub_orden.delivery_status.rescheduled_date >= moment().format("YYYY/MM/DD"))
    const fechaReprogramacion = subOrden.sub_orden.delivery_status.rescheduled_date
    const estadoRetiroTienda = (microSteps[microSteps.length - 1].status === "Tu orden está lista para ser retirada")
    const estado = {}
    var verEstadosCirculo = false

    if (alerta && mapaLocal && estadoRetiroTienda) {
        let fecha = (subOrden.sub_orden.delivery_status.date == '' || subOrden.sub_orden.delivery_status.date == null) ? '' : subOrden.sub_orden.delivery_status.date.split('/')
        estado.alerta = microSteps[microSteps.length - 1].alert
        estado.store = subOrden.sub_orden.store
        estado.horarioSucursal = (subOrden.sub_orden.delivery_status.time == '' || subOrden.sub_orden.delivery_status.time == null) ? '' : subOrden.sub_orden.delivery_status.time
        estado.fechaEntrega = (fecha.length < 0) ? "" : fecha.reverse().join('/')
        return divMapa(estado)
    } else if (alerta && cancelada || alerta) {
        return  GenerarMensaje(subOrden)
    } else if (macroSteps.length == 0) {
        return statusAmanda(microSteps)
    } else {
        return divFormatoEstado(macroSteps, estadoRetiroTienda, store)
    }

}
module.exports = {
    obtenerEstadoSubOrden
}