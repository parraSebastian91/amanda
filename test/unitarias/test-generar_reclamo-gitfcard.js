/* global describe it */
const chai = require('chai')
chai.should()
require('dotenv').config()
const servicio = require('../../functions/ss.js')
const dialogs = require('../../locale/es/')

describe('The API should work', () => {
    it('Should answer the request for an SS', done => {
        var _servicio = new servicio();
        _servicio.info = {"rut":"13313043-8","persona":{"nombre":"","rut":"","existe":false,"apellidoPaterno":"","nacionalidad":"","contador":0},"ServiceRequest":{"nivel1":"Productos, Servicios y Gift Card","nivel2":"Gift Card","nivel3":"Gift Card","descripcion":"esto es una prueba","Attachment":"","sku":"","numeroSuborden":""}};
        _servicio.info.persona.telefono = "992125017"
        _servicio.crear()
            .then(response => {
                console.log("respuesta:" + response)
                done();
            })
            .catch(err => {
                console.error(err);
            })

        console.log("fin prueba")
    })
}).timeout(20000);