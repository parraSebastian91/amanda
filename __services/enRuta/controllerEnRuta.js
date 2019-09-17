require('dotenv').config()

async function listaOcEnRuta(detalleOcInput) {
    try {
        let detalleOc = []
        if (detalleOcInput.length == undefined){
            detalleOc.push(detalleOcInput)
        } else {
            detalleOc=detalleOcInput }

        let detalleLista = []
        detalleOc.forEach(d => {
            const despacho = d.metodoDespacho == 'Ship to store' ? '_CS_' : '-D_CLIENT';
            let fecha_sistema = new Date(Date.now()).toLocaleDateString();
            let fecha_despacho = new Date(d.fechaPactada).toLocaleDateString()

            if (fecha_sistema == fecha_despacho) {
                detalleLista.push({ 'orden_ui': d.ordenId, 'id_despacho': [] })
                let od = d.historialEstado.estado.splice(-1).reduce((result, estado) => {
                    if (estado.estado.includes(despacho)) {

                        result = { 'sub_oc_result': d }
                    }
                    return result
                })

                if (od != null) {

                    detalleLista[detalleLista.length - 1].id_despacho.push(d.numeroSubOrden)
                }
            }
        })
        return detalleLista
    } catch (error) {
        console.log(error)
        return null
    }

}

async function mensajeEnRuta(listaEnRuta) {
    try {
        let Recuerda = 'Recuerda que hoy entregaremos tu compra.<br>'
        let numDespachoEnRuta = '<FONT SIZE=2><br>&#8226;&nbsp;N° Despacho <b>$NUM_DESPACHO</b>.</FONT>'
        let ordenCompra = '<br><br>Asociados a la Orden de Compra <b>$ORDCOMPRA</b>.<br>'
        const asegurate = '<br>Asegúrate que haya alguien mayor de edad para recibirla.'
            + 'Puedes revisar el detalle de tu orden aquí link portal'

        let despacho = ''
        let oCompra = ''
        let detalle = ''

        listaEnRuta.forEach(rt => {
            oCompra += (rt.id_despacho.length > 1) ? ordenCompra.replace('$ORDCOMPRA', rt.orden_ui) : ordenCompra.replace('$ORDCOMPRA', rt.orden_ui).replace('Asociados', 'Asociado');
            rt.id_despacho.forEach(des => {
                despacho += numDespachoEnRuta.replace('$NUM_DESPACHO', des);
            })
            detalle += despacho + oCompra
            oCompra = ''
            despacho = ''
        })
        Recuerda += detalle + asegurate
        return Recuerda
    } catch (error) {
        return null
    }



}


module.exports = { listaOcEnRuta, mensajeEnRuta }