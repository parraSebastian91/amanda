
/* global describe it */
const chai = require('chai')
chai.should()
require('dotenv').config()
const ss = require('../../functions/ss.js')

describe('The API should work', () => {
    it('Should answer the request for an order', done => {
        var _ss = new ss();
        _ss.info = { "rut": "", "persona": { "nombre": "OSVALDO", "rut": "13313043-8", "existe": true, "apellidoPaterno": "MARTINEZ", "nacionalidad": "Chilena", "contador": 0, "apellidoMaterno": "SEGUEL", "ciudad": null, "codigoPostal": null, "direccion": "  ", "fechaNacimiento": "07/06/1977", "pais": null, "region": null, "sexo": "M", "telefono": null, "tipoCliente": "Cliente", "tipoIdentificacion": "RUT" }, "ServiceRequest": { "nivel1": "Productos, Servicios y Gift Card", "nivel2": "Servicio Armado de Muebles", "nivel3": "Solicitud de armado", "descripcion": "misma dirección en la que agendaste el despacho", "numeroOrdenCompra": "5123529957", "Attachment": "", "sku": "", "numeroSuborden": "144013943636" } };
        //_ss.info = {"auth":{"bearer":"Ru31rwj13S528GZhpqfR04TtItS3g2vm23znbvXaZn7yyG29CwciZw"},"json":true,"headers":{"idServicio":"ServicioSolicitudCrear"},"strictSSL":false,"body":{"Header":{"country":"CL","commerce":"Falabella","channel":"Web"},"Body":{"CreateServiceRequest":{"Account":{"organizacion":"Falabella - Chile","documento":{"tipo":"RUT","numero":"18706985","digitoVerificador":"8"},"nombre":"CAMILA FERNANDA","nacionalidad":"Chilena","apellidoMaterno":"VARGAS","apellidoPaterno":"PEREZ","ListOfTelefono":{"Telefono":[{"codigoPais":"","codigoArea":"","numero":null,"origen":"3355667788"}]},"ServiceRequest":{"nivel1":"Boletas y Cobros","nivel2":"Anulación de compra parcial","nivel3":"Anulación de compra parcial","canal":"Asistente Virtual","descripcion":"esto es una prueba","numeroOrdenCompra":"5123351442","sku":"880884219","numeroSuborden":"144013909949","Attachment":""}}}}}}
        return _ss.crear().then(_ => {

            console.log("respuesta:" + _.numero)
                done();
        });

        console.log("fin prueba")
    })
}).timeout(20000);