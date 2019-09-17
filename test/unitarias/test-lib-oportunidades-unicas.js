
const filtros = require('../../functions/filtros/filtros');
const switchModelLuis = require('../../sales/switchModelLuis.js')
global.botText = require('../../bot_text') // Variable para mensajes
global._ = require('lodash')
const axios = require('axios')
const expect = require('chai').expect


 describe('Responde oportunidades unicas', () => {
    it('Devulve arreglo', async done => {

        ATGNameFilter = 'Género';
        ATGNavState = `/falabella-cl/category/cat1480002/Ver-Todo-Jugueteria`;

        let result = await new Promise(async resolve => {
            resolve(await ATGFilters(
                ATGNavState,
                ATGNameFilter
            ))
        });

        result = filtros.oportunidadUnica(result);

        expect(result.length).to.greaterThan(0);
   
        done();
    })

})

async function ATGFilters(navState, nameFilter) {

    const data = encodeURIComponent(`{"navState": "${navState}","currentPage":1}`);
    const endpoint = botText.host + botText.path + data
    const headers = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    try {
      const { data: r } = await axios.get(endpoint, headers)
      console.log('r.stater.stater.stater.stater.stater.stater.stater.stater.stater.stater.stater.stater.stater.stater.stater.stater.stater.state')
      console.log(r.state)
      return r.state.resultList;
      console.log('f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1f1')
      console.log(f1)
      return f1[0]
    } catch(err) {
      console.log(err)
    }
  }