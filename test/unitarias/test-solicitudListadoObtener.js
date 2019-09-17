/* global describe it */
const chai = require('chai')
chai.should()
require('dotenv').config()
const ss = require('../../functions/ss.js')

describe('The API should work', () => {
  it('Should answer the request for an order', done => {
           var _ss = new ss();
           _ss.rut = '18342711-3' 
          _ss.getSS()
            .then(response => {
            for(var i = 0; i < response.length;i++){
                console.log(response[i].sku + '-' + response[i].numeroSubOrden + '-' + response[i].nivel3)
          }
            done()
          })
          .catch(err=>{
              console.error(err);
          })
  })
})