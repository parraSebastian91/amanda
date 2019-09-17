/* global describe it */
const chai = require('chai')
chai.should()
require('dotenv').config()
const callback = require('../../functions/callback.js')

describe('The API should work', () => {
  it('Should answer the request for an order', done => {
           var _callback = new callback();
           _callback.info.rut = '18342711-3' 
           _callback.info.nombreCtc = 'Natalia'
           _callback.info.apellidoCtc = 'Osses'
           _callback.info.descNegocio = 'Falabella - Chile'
           _callback.info.idTransaccion = undefined
           _callback.info.documentoCtc = '18342711'
           _callback.info.digitoVer = '3'
           _callback.info.tipoDocumento = '1',
           _callback.info.codigoArea = '9'
           _callback.info.codigoPais = '56'
           _callback.info.contactInfo = '958192474'
           _callback.info.contactInfoType = '4'
           _callback.info.mailCh = 'nataliaosses@outlook.com'

           _callback.requestCallback()
              .then(response => {
                console.log(response.response.Body.clienteLlamadaSolicitarExpResp.respMensaje)
                done()
              })
              .catch(err=>{
                  console.error(err);
              })
  })
})
  