
/* global describe it */
const chai = require('chai')
chai.should()
require('dotenv').config()
const servicioOrden = require('../../services/orden.js')
const orden = require('../../functions/orden-compra')


describe('The API should work', () => {
    it('Should answer the request for an order', done => {
        servicioOrden.getOrder('5123529957', 'guachupemartinez77@gmail.com')
            .then(response => {
                console.log("respuesta:" + response)
                done()
            })
            .catch(err=>{
                console.error(err);
            })
    })
})

describe('The API should work', () => {
    it('Should answer the request for an order', done => {
        var _orden = new orden();
        _orden.info.numero = '5123529957';
        _orden.info.email = 'guachupemartinez77@gmail.com';

        if (_orden.esValido()) {
            _orden.getOrden().then(()=>{

                console.log("respuesta:" + _orden.info)
                done();

            });
        }
      
    })
})

// describe('Get order action', () => {
//     const conversationId = 'conversation_id_test'
//     const action = {
//         name: 'getOrderState',
//         parameters: {
//             email: 'teresar1965@yahoo.es',
//             order_id: '5098522137'
//         },
//         type: 'client',
//         result_variable: 'order'
//     }
//     const payload = {
//         'intents': [
//             {
//                 'intent': 'hello',
//                 'confidence': 0.8742280006408691
//             }
//         ],
//         'entities': [],
//         'input': {
//             'text': 'Hello'
//         },
//         'output': {
//             'text': [
//                 'Hi! What can I do for you?'
//             ],
//             'nodes_visited': [
//                 'node_2_1501875253968'
//             ],
//             'log_messages': []
//         },
//         'context': {
//             conversation_id: conversationId,
//             'system': {
//                 'dialog_stack': [
//                     {
//                         'dialog_node': 'root'
//                     }
//                 ],
//                 'dialog_turn_counter': 1,
//                 'dialog_request_counter': 1,
//                 '_node_output_map': {
//                     'node_2_1501875253968': [
//                         0
//                     ]
//                 },
//                 'branch_exited': true,
//                 'branch_exited_reason': 'completed'
//             }
//         }
//     }

//     it('Should return no error and no action', done => {
//         servicioOrden.getOrder(action, payload, (err, result, actions) => {
//             if (err) console.error(err)
//             actions.should.have.a.lengthOf(0)
//             done()
//         })
//     })

//     it('Should return all the info', done => {
//         getOrder(action, payload, (err, result) => {
//             if (err) console.error(err)
//             result.should.have.property('status')
//             result.should.have.property('sub_status')
//             result.should.have.property('delivery')
//             result['delivery'].should.have.property('option')
//             result['delivery'].should.have.property('date')
//             result.should.have.property('address')
//             result['address'].should.have.property('street')
//             result['address'].should.have.property('number')
//             result['address'].should.have.property('department')
//             result['address'].should.have.property('location')
//             result['address'].should.have.property('city')
//             console.log(result)
//             done()
//         })
//     })

//     it('Should return an object with sub_status with the error message when api raises an error', done => {
//         const action = {
//             name: 'getOrderState',
//             parameters: {
//                 email: 'dsads@badmail.es',
//                 order_id: '4323232443'
//             },
//             type: 'client',
//             result_variable: 'order'
//         }
//         getOrder(action, payload, (err, result) => {
//             if (err) console.error(err)
//             result.should.have.property('sub_status')
//             result.sub_status.should.be.a('string')
//             result.sub_status.should.be.equal('ERROR')
//             console.log(result)
//             done()
//         })
//     })
// })
