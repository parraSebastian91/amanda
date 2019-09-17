
/* global describe it */
const chai = require('chai')
chai.should()
require('dotenv').config()
const servicio = require('../../functions/reclamo.js')
const dialogs = require('../../locale/es/')

describe('The API should work', () => {
    it('Should answer the request for an SS', done => {
        var _servicio = new servicio();
        _servicio.orden.info.numero = 5123351442
        _servicio.orden.info.email = 'perezvargascf@gmail.com'
        _servicio.persona.info.rut = '18706985-8'

        _servicio.setNivel1("Boletas y Cobros");
        _servicio.setNivel2("Anulación Compra Par");
        _servicio.setNivel3("Anulación Compra Par");
        //  _servicio.info.nivel3 = _servicio.getNivel3DesdeMenu("Anulación de compra parcial");

        _servicio.info.descripcion = 'Esto es una prueba'

        _servicio.buscarRut().then(() => {
            _servicio.getOrden().then(() => {

                _servicio.info.productosReclamados = _servicio.orden.info.subordenes[0].productos;

                _servicio.gerenarReclamo()
                    .then(response => {
                        console.log("respuesta:" + _servicio.info.numero)
                        done();
                    }).catch(err => {
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