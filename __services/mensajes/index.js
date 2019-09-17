// const request = require('request')
// const service = process.env.xxxx
const getEstadoTipologias = async (args) => {
    // let isJson = (str) => {
    //     try {
    //         return JSON.parse(str);
    //     } catch (e) {
    //         return { errors: [{ message: 'Error No es un JSON' }] };
    //     }
    // }
    return getTipologia(args);
    // return await new Promise((resolve, reject) => {
    //     request.get(`${ service }/textos`, {},
    //         (err, res, body) => {
    //             if (err) reject(err)
    //             resolve(isJson(body))
    //         }
    //     )
    // })
}
module.exports = {
    getEstadoTipologias
}

function getTipologia(args) {
    const response = {
        'code': 200,
        'status': 'success',
        'data': [
            {
                'message': 'Tu caso por Despacho Atrasado está activo en nuestros sistemas. En los próximos días tendremos nueva información sobre la entrega de tu producto.',
                'tipologiaN3': 'Incumplimiento fecha Entrega',
                'estado': 'ABIERTO',
                'sub_estado': 'ASIGNADO'
            },
            {
                'message': 'Un ejecutivo especializado está trabajando para encontrar una fecha disponible de despacho y dar solución a tu caso lo antes posible. En los siguientes días tendremos nueva información para darte.',
                'tipologiaN3': 'Incumplimiento fecha Entrega',
                'estado': 'ABIERTO',
                'sub_estado': 'EN PROCESO'
            },
            {
                'message': 'Tu producto ya tiene asignada una ruta de despacho. Estamos coordinando con el servicio de entrega la fecha en que llegará a la dirección ingresada al momento de tu compra.',
                'tipologiaN3': 'Incumplimiento fecha Entrega',
                'estado': 'ABIERTO',
                'sub_estado': 'RESUELTA'
            },
            {
                'message': 'Tu caso por Despacho atrasado de encuentra finalizado. El producto fue entregado en la dirección ingresada en tu compra. Lamentamos los inconvenientes que esta demora pudo ocacionar.',
                'tipologiaN3': 'Incumplimiento fecha Entrega',
                'estado': 'CERRADO',
                'sub_estado': 'FINALIZADA'
            },
            {
                'message': 'No hemos logrado contactarnos contigo al número que tenemos registrado. Hemos enviado información a tu correo que es importante que respondas para poder continuarcon tu caso de Despacho Atrasado. \n Si no lo ves en tu bandeja de entrada, te recomiendo que revises en correo no deseado.',
                'tipologiaN3': 'Incumplimiento fecha Entrega',
                'estado': 'ABIERTO',
                'sub_estado': 'PENDIENTE GESTION CLIENTE'
            },
            {
                'message': 'Lo sentimos, ocurrió un problema con tu caso de Despacho Atrasado por lo que éste fue anulado. Si aún no recibes tu producto, puedes volver a crear conmigo un nuevo caso en el menú principal seleccionando Ingreso de caso.',
                'tipologiaN3': 'Incumplimiento fecha Entrega',
                'estado': 'CANCELADA',
                'sub_estado': 'ANULADA'
            }
            //---------------
            ,{
                'message': 'Tu caso por Anulación Total de Compra está activa en nuestros sistemas. En los próximos días tendremos nueva información para entregarte. Estamos trabajando para realizar le devolución de tu dinero lo antes posible.',
                'tipologiaN3': 'Anulación de compra total',
                'estado': 'ABIERTO',
                'sub_estado': 'ASIGNADO'
            },
            {
                'message': 'Un ejecutivo especializado está actualmente trabajando en dar solución a tu caso por Anulación Total de Compra y realizar la devolución de tu dinero lo antes posible. En los siguientes días tendremos nueva información para darte.',
                'tipologiaN3': 'Anulación de compra total',
                'estado': 'ABIERTO',
                'sub_estado': 'EN PROCESO'
            },
            {
                'message': 'Estamos trabajando para dar solución a tu caso de Anulación Total de Compra. Pronto te enviaremos la documentación de respaldo a tu correo.\n El plazo de devolución de tu dinero dependerá de tu entidad bancaria: - Tarjeta **CMR** 24 hrs hábiles. - Tarjeta de **Débito Banco**  Falabella: 48 hrs hábiles.- Tarjeta de **Crédito Otros Bancos**: 72 hrs hábiles.- Tarjeta de **Débito Otros Bancos**: te  contactaremos para obtener tus datos bancarios.',
                'tipologiaN3': 'Anulación de compra total',
                'estado': 'ABIERTO',
                'sub_estado': 'RESUELTA'
            },
            {
                'message': 'Tu caso por Anulación Total de Compra se encuentra finalizado. Te hemos enviado el documento de respaldo de la devolución del dinero al correo ingresado en tu compra.',
                'tipologiaN3': 'Anulación de compra total',
                'estado': 'CERRADO',
                'sub_estado': 'FINALIZADA'
            },
            {
                'message': 'No hemos logrado contactarnos contigo al número que tenemos registrado. Hemos enviado información a tu correo que es importante que respondas para poder continuar con tu caso de Anulación Totalde Compra.\n Si no lo ves en tu bandeja de entrada, te recomiendo que revises en tu correo no deseado.',
                'tipologiaN3': 'Anulación de compra total',
                'estado': 'ABIERTO',
                'sub_estado': 'PENDIENTE GESTION CLIENTE'
            },
            {
                'message': 'Lo sentimos, ocurrió un problema con tu caso de Anulación Total de Compra por lo que éste fue anulado. Si aún no recibes tu dinero, puedes volver a crear conmigo un nuevo caso en el menú principal seleccionando **Ingreso de caso**.',
                'tipologiaN3': 'Anulación de compra total',
                'estado': 'CANCELADA',
                'sub_estado': 'ANULADA'
            }
        ]
    }
    
    const limpiarString = (str) => {
        let _str = str.trim()
        return _str.toUpperCase()
    }
    let message = response.data.filter((textoObj) => {
        if (limpiarString(textoObj.tipologiaN3) === limpiarString(args.n3) && limpiarString(textoObj.estado) === limpiarString(args.estado) && limpiarString(textoObj.sub_estado) === limpiarString(args.sub_estado)) {
            return textoObj
        }
    })
    return message.length > 0 ? message[0].message : '';
}
