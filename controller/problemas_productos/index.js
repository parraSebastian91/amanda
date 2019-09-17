const mensajesCreacionSSTipologiaNivel3 = require('./../../functions/ingresoDatos/mensajesCreacionSSTipologiaNivel3.json')

module.exports = {
    async  duplicidadSS(session) {
        let num_subordenes = session.userData.checkBoxOrdersSelected.length
        let ordenCompra = session.userData.orden_compra
        let rut = session.userData.rut
        let nivel3 = session.userData.nivel3
        let array_num_subordenes_con_ss_duplicadas = []
        let lista_duplicidad_ss = []
        let lista_string_ss_creadas = ''
        let result = {
            duplicidad: true,
            mensaje: ''
        }
        for (let numero_suborden of session.userData.checkBoxOrdersSelected) {
            lista_duplicidad_ss = await SIEBEL.calcularSolicitudListadoObtenerReturnArray(
                rut,
                ordenCompra,
                numero_suborden,
                nivel3)
            if (lista_duplicidad_ss.length > 0) {
                array_num_subordenes_con_ss_duplicadas.push(numero_suborden)
                lista_string_ss_creadas = (array_num_subordenes_con_ss_duplicadas.length === 1) ? lista_duplicidad_ss[0].numeroSS + '.' : lista_string_ss_creadas + '<br>' + lista_duplicidad_ss[0].numeroSS + '.'
            }
        }
        if (num_subordenes == array_num_subordenes_con_ss_duplicadas.length) {
            if (num_subordenes == 1) {
                result.duplicidad = true
                result.mensaje = `Estimado cliente, ya tienes una solicitud ingresada por este motivo. El número de seguimiento es : ${lista_string_ss_creadas} Tu caso es muy importante para nosotros, es por eso que seguimos gestionando tu solicitud para darte una pronta solución`
            } else {
                result.duplicidad = true
                result.mensaje = `Estimado cliente, ya tienes solicitudes ingresadas por este motivo.<br>Los números de seguimiento son:<br><br>${lista_string_ss_creadas}<br><br>Tus casos son muy importante para nosotros, es por eso que seguimos gestionando una pronta solución`
            }
        } else {
            result.duplicidad = false
            result.mensaje = ''
        }
        return result
    },
    async crearMensaje(session, arrayCreateSS) {
        let mensaje = ''
        arrayCreateSS.success.forEach(obj => {
            let count = 0
            mensajesCreacionSSTipologiaNivel3.forEach(function (element) {
                if (element.tipologia == session.userData.nivel3) {
                    mensaje += '&bull;' + element.mensaje.replace('$ID_SOLICITUD', obj.msg) + '<br>'
                    count++
                }
            })
            if (count == 0) {
                var msgGenerico = mensajesCreacionSSTipologiaNivel3.find(function (e) {
                    return e.tipologia == ""
                })
                mensaje += '&bull;' + msgGenerico.mensaje.replace('$ID_SOLICITUD', obj.msg) + '<br>'
            }
        })
        if (arrayCreateSS.error.length > 0) {
            mensaje += '<br> No pudimos registrar la solicitud de servicio para el despacho:'
        }
        arrayCreateSS.error.forEach(obj => {
            mensaje += '<br> &bull; ' + obj.subOrden + '<br>' + obj.msg
        })
        return mensaje
    }
}