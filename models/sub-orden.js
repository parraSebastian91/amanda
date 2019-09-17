module.exports.subOrden = class subOrden {
  constructor(obj) {
    if (!obj)
      return

    this.direccion = new direccionOrden(obj.address)
    this.estado = new estadoEntrega(obj.delivery_status)
    this.id = obj.id
    this.macroPasos = obj.macro_steps.map(_ => new pasoOrden(_))
    this.microPasos = obj.micro_steps.map(_ => new pasoOrden(_))
    this.productos = obj.products.map(_ => new productoOrden(_))
    this.receptor = new receptorOrden(obj.receiver)
  }
}

class receptorOrden {
  constructor(obj) {
    if (!obj)
      return
    this.nombre = obj.name
    this.apellido = obj.last_name
  }
}

class productoOrden {
  constructor(obj) {
    if (!obj)
      return
    this.id = obj.id
    this.sku = obj.sku
    this.descripcion = obj.description
    this.marca = obj.brand
    this.urlImagen = obj.image_url
    this.tangible = obj.is_tangible
    this.precio = obj.price
    this.tamanio = obj.size
    this.url = obj.url
  }
}

class pasoOrden {
  constructor(obj) {
    if (!obj)
      return
    this.fecha = obj.date
    this.estado = obj.status

  }
}

class estadoEntrega {
  constructor(obj) {
    if (!obj)
      return
    this.fecha = obj.date
    this.rangoFecha = obj.date_range
    this.fechaInicial = obj.initial_date
    this.roto = obj.is_broken
    this.cancelado = obj.is_canceled
    this.retrasado = obj.is_delayed
    this.entregado = obj.is_delivered
    this.reAgendado = obj.is_rescheduled
    this.opcion = obj.option
    this.fechaReAgendamiento = obj.rescheduled_date
  }
}

class direccionOrden {
  constructor(obj) {
    if (!obj)
      return
    this.ciudad = obj.city
    this.departamento = obj.department
    this.location = obj.location
    this.numero = obj.number
    this.region = obj.region
    this.calle = obj.street
  }
}