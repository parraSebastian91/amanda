module.exports = {
    text1: `Indícame tu número de orden de compra para consultar su estado o puedes revisar el estado de tu orden en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)`,
    text2: '¿Me puedes indicar con qué correo electrónico realizaste la compra?',
    text3: 'Tu orden de compra se encuentra confirmada. Puedes revisar más detalles aquí',
    text4: 'El número de orden de compra no es correcto. Por favor ingresa nuevamente el número de orden de compra',
    text5: 'Si olvidaste tu número de orden de compra, recuerda que te hemos enviado un mail de confirmación de tu orden en donde podrás encontrar el número',
    text6: 'El correo electrónico ingresado no es correcto. Por favor ingresa nuevamente tu correo',
    text7: 'Recuerda que tu correo electrónico ingresado debe ser el mismo con el cual realizaste la compra de tu producto',
    text8: `Puedes revisar el estado de tu orden de compra en el siguiente [link](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)`,
    text9: 'Ocurrió un inconveniente creando la solicitud de servicio, intente más tarde por favor',
    text10: 'Por favor, ingresa una observación válida',
    text11: 'Tu solicitud de servicio ha sido ingresada con éxito.<br> El número de tu solicitud es: ',
    text12: '¿Cual es el motivo de tu anulación?',
    text13: 'Tu solicitud de armado ha sido ingresada correctamente.<br> El número de tu solicitud es: ',
    text14: 'Un ejecutivo se contactará contigo para coordinar el armado',
    text15: 'Tu solicitud por anulación de compra ha sido ingresada con éxito.<br> El número de tu solicitud es:',
    text16: 'Un ejecutivo se contactará contigo',
    text17: 'Ocurrió un inconveniente creando la solicitud de servicio, intente más tarde por favor',
    text18: 'Ocurrió un inconveniente creando la Nota de Crédito, intente más tarde por favor',
    text19: 'Has solicitado la anulación de compra. El número de tu solicitud es {{SS}}. Estamos gestionando tu nota de crédito.',
    text20: 'Tu caso es importante para nosotros, es por eso que estamos gestionando una pronta solución',
    text21: 'Para realizar el seguimiento de tu orden necesitaré algunos datos.',
    text22: 'Te hemos enviado un respaldo de tu solicitud al correo: {{correo}}',
    solicitudRutTelefono_rut_no_registrado_en_oc: 'Lo siento, pero el RUT ingresado no coincide con el registrado en la compra. Por favor intenta nuevamente.',
    solicitudRutTelefono_datos_adicionales: 'Para poder gestionar una pronta solución a este lamentable inconveniente, necesito algunos datos adicionales',
    solicitudSinInconveniente: 'Recuerda que puedes revisar más detalles de tu orden [aquí](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes)',
    inicioSeguimientoOC: '$ingreso_Seguimiento_orden$ Entiendo, para realizar el seguimiento de tu orden necesitaré algunos datos adicionales',
    message: function(str, ss) {
        switch (str) {
            case 'ss':
                return {
                    titulo: 'Estimado cliente, hemos creado una solicitud de servicio con el número:',
                    pie: this.text16,
                    correo: this.text22
                }
                break
            case '0':
                return {
                    titulo: 'Estimado cliente, hemos creado una solicitud de servicio con el número:',
                    pie: this.text16
                }
                break
            case 'ncOk':
                return {
                    titulo: this.text19.replace('{{SS}}', ss),
                }
                break
            case 'ncError':
                return {
                    titulo: this.text18,
                }
                break
            case 'error':
                return this.text9
                break
            case 'noMensaje':
                return ''
                break
            default:
                //msg FCR
                return 'Estimado cliente un ejecutivo especializado ya se encuentra trabajando en tu solicitud. <br>Insistiremos en tu caso para darte una pronta solución'
        }
    },
    messageQuiebre: function(nivel) {
        switch (nivel) {
            case 'Anulación de compra parcial':
                return {
                    titulo: this.text15,
                    pie: this.text16,
                    correo: this.text22
                }
                break
            case 'Anulación de compra total':
                return {
                    titulo: this.text15,
                    pie: this.text16,
                    correo: this.text22
                }
                break
            case 'Solicitud de armado':
                return {
                    titulo: this.text13,
                    pie: this.text14,
                    correo: this.text22
                }
                break
            case 'Incumplimiento Sin Stock':
                return {
                    titulo: 'Estimado cliente, hemos creado una solicitud de servicio con el número:',
                    pie: this.text20,
                    correo: this.text22
                }
                break
            default:
                return {
                    titulo: this.text11,
                    pie: this.text16,
                    correo: this.text22
                }
        }
    }
}