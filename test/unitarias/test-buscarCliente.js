
/*   global describe it */
const chai = require('chai')
chai.should()
require('dotenv').config()
const servicio = require('../../functions/persona.js')

describe('The API should work', () => {
    it('Debe responder correctamente el servicio buscar cliente', done => {
        
        var _servicio = new servicio();
        _servicio.info.rut = '13315454-K'
        _servicio.buscarPorRut()
            .then(() => {
                if (_servicio.info.nombre.length>0
                    && _servicio.info.apellidoPaterno.length>0
                    && _servicio.info.nacionalidad.length>0)
                     done();
                     
                console.log("respuesta:" + _servicio.info)
            })
            .catch(err => {
                console.error(err);
            })
    })
}).timeout(10000);