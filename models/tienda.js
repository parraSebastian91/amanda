module.exports.tienda = class tienda {
  constructor(nombre) {
    this.nombre = nombre || ''
    this.contador = 0;
  }

  cargar(columns) {
    this.id = columns[0].value; // id_tienda
    this.nombre = columns[1].value; // nombre_tienda
    this.codPais = columns[2].value; // cod_pais
    this.codRegion = columns[3].value; // cod_region
    this.provincia = columns[4].value; // provincia
    this.gerente = columns[5].value; // gerente
    this.urlFotoGerente = columns[6].value; // url_foto_gerente
    this.contacto = columns[7].value; // contacto
    this.mailContacto = columns[8].value; // mail_contacto
    this.codigoLocal = columns[9].value; // cod_local
    this.nombreFantasia = columns[10].value; // nombre_fantasia
    this.calle = columns[11].value; // calle
    this.longitude = columns[12].value; // longitud
    this.latitude = columns[13].value; // latitud
    this.urlGeoTienda = columns[14].value; // url_geotienda
    this.utlFotoTienda = columns[15].value; // url_foto_tienda
    this.urlMapa = columns[16].value; // url_mapa
    this.horarios = columns[17].value; // horarios
    this.jefeServicio = columns[18].value; // jefe_servicio
    this.jefeServicioCorreo = columns[19].value; // jefe_servicio_correo

  }

}
module.exports.columns = function() {
  return 'id_tienda' +
    ', nombre_tienda' +
    ', cod_pais' +
    ', cod_region' +
    ', provincia' +
    ', gerente' +
    ', url_foto_gerente' +
    ', contacto' +
    ', mail_contacto' +
    ', cod_local' +
    ', nombre_fantasia' +
    ', calle' +
    ', longitud' +
    ', latitud' +
    ', url_geotienda' +
    ', url_foto_tienda' +
    ', url_mapa' +
    ', horarios' +
    ', jefe_servicio' +
    ', jefe_servicio_correo'
}