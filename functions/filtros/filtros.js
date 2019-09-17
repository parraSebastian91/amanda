const obtenerTipoDespacho = (subOrden) => {
  const SO_anulacion_denegada = []
  const SO_anulacion_ok = []
  // const SO_retiro_Tienda = []
  // const SO_Home_delivery = []
  // const SO_isDelivered_false = []
 
  // Object.values(subOrden).forEach(so => {
  //   if (so.delivery_status.is_delivered) {
  //     ((typeof so.address !== 'undefined' && so.address) ? SO_Home_delivery : SO_retiro_Tienda).push(so)
  //   } else {
  //     SO_isDelivered_false.push(so)
  //   }
  // });
 
  // const SO_Despacho = {
  //   SO_retiro_Tienda,
  //   SO_Home_delivery,
  //   SO_isDelivered_false
  // }
  //return SO_Despacho
   Object.values(subOrden).forEach(so => {
    if (!so.delivery_status.is_delivered) {
      let OLR = so.macro_steps.some((i)=>{
        return i.status == 'Orden lista para retiro'
      })
      let OE = so.macro_steps.some((i)=>{
        return i.status == 'Orden entregada'
      })
     if(OLR && !OE){SO_anulacion_denegada.push(so)}
    } else{
      SO_anulacion_ok.push(so)
    }
  });
    const SO_Despacho = {
      SO_anulacion_denegada,
      SO_anulacion_ok
  }
 
  return SO_Despacho
 }

module.exports = {
  oportunidadUnica: function (lista) {
    let resultado = lista.filter(_ => {
      if (_.prices.filter(p => p.opportunidadUnica).length > 0)
        return _;
    })
    return resultado;
  },
  obtenerTipoDespacho
}