module.exports = {
    tieneSolicitud: async(ss) => {
        return {
            mensaje: "Estimado cliente, ya tienes una solicitud ingresada por inconvenientes con tu compra, el número de seguimiento es: **{{SS}}**. Un ejecutivo se encuentra trabajando en tu caso para darte una pronta solución.".replace('{{SS}}', ss),
            success: true
        }
    },
    // USUARIO_NO_LOGEADO: async (orden, hash) => { 
    //     return 'Sabemos que esta compra es importante para ti. Para encontrar una pronta solución te invitamos a que ingreses a la seccion mis ordenes y revises las opciones disponibles. [aquí](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes/seguimiento-de-orden/{{orden_num}}?hash={{hash}})'.replace('{{orden_num}}', orden).replace('{{hash}}', hash)
    // },
    // USUARIO_LOGEADO:  async (orden) => { 
    //     return 'Sabemos que esta compra es importante para ti. Para encontrar una pronta solución te invitamos a que ingreses a la seccion mis ordenes y revises las opciones disponibles.[aquí](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes?orden={{orden_num}})'.replace('{{orden_num}}', orden)
    // },
    messageDefaultDervPortal: async(subOrden) => {
            return '$entra_Quiebre_Seguimiento_orden$ Por favor ingresa a Mis Órdenes para recibir mas información.\n \n[Mis Órdenes >](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes?orden={{subOrden}})'.replace('{{subOrden}}', subOrden)
        }
        //USUARIO_LOGEADO: 'Estimado cliente, ha ocurrido un inconveniente al consultar la información de tu orden de compra, por favor ingresa al siguiente link [LINK](https://www.falabella.com/falabella-cl/mi-cuenta/ordenes), podrás encontrar más detalle . Revisa las opciones que tenemos para ti.',
}