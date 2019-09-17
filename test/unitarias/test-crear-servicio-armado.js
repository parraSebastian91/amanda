
/* global describe it */
const chai = require('chai')
chai.should()
require('dotenv').config()
const servicio = require('../../functions/servicio-armado.js')
const dialogs = require('../../locale/es/')

describe('The API should work', () => {
    it('Should answer the request for an order', done => {
        var _servicio = new servicio();
        _servicio.orden.info.numero = 5123351442
        _servicio.orden.info.email = 'perezvargascf@gmail.com'
        _servicio.persona.info.rut = '18706985-8'

        _servicio.info.descripcion = 'Esto es una prueba'

        _servicio.buscarRut().then(() => {
            _servicio.getOrden().then(() => {
                _servicio.solicitarArmado()
                    .then(response => {
                        console.log("respuesta:" + _servicio.info.numero)
                        done();
                    })
                    .catch(err => {
                        console.error(err);
                    })
            }).catch(err => {
                console.error(err);
            })
        }).catch(err => {
            console.error(err);
        })



        console.log("fin prueba")
    })
}).timeout(20000);