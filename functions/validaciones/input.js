const menuTextosPalabrasSuelta = require("./menuTextosPalabrasSueltas.json")
const { consultarLuis } = require('../../utils')

module.exports = {
    sanitizeStrLuis(str) {
        // // Se reemplazan las tildes
        // str = str.replace(/[ÀÁÂÃÄÅ]/g, "A")
        // str = str.replace(/[àáâãäå]/g, "a")
        // str = str.replace(/[ÈÉÊË]/g, "E")
        // str = str.replace(/[èéêë]/g, "e")
        // str = str.replace(/[ÌÍÎÏ]/g, "I")
        // str = str.replace(/[ìíîï]/g, "i")
        // str = str.replace(/[ÒÓÔÕÖ]/g, "O")
        // str = str.replace(/[òóôõö]/g, "o")
        // str = str.replace(/[ÙÚÛÜ]/g, "U")
        // str = str.replace(/[ùúûü]/g, "u")
        // str = str.replace(/[Çç]/g, "c")
        // // Se reemplazan los signos de puntuación.
        // str = str.replace(/[¿?¡!]/g, '')

        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    },
    hasBadWords(string) {
        return string.toLowerCase()
            .split(' ')
            .filter((word) => {
                return !!~badWords.indexOf(word)
            })
            .length > 0
    },
    async noRecuerdaOC(txt) {
        
        // try {
        // let _string = string.toLowerCase().trim().replace(' ', '')
        // let arr = arrayListNoRecuerdaOC.map((word) => {
        //     let _word = word.trim().replace(' ', '')
        //     return _word == _string
        // })
        //return !!~arr.indexOf(true)
        // } catch (error) {
        //     console.log(error)
        //     return false
        // }

        var result = await consultarLuis(txt)
        return (result.toLowerCase() == 'no_me_sirve' || result.toLowerCase() == 'orden_compra_cliente_no_la_tiene') ? true : false
    },
    validateRisas(risas) {
        try {
            var reg = /(?:[ji,k,h]+(?:[j,h]?[aeus]?)+j?)/
            var result = risas.match(reg)
            return result != null && result[0].length == result.input.length
        } catch (error) {
            return false
        }
    },
    palabraCorta(string) {
        try {
            if (string.split(" ").length == 1) {
                return string.toLowerCase()
                    .split(' ')
                    .filter((word) => {
                        return !!~shortWords.indexOf(word)
                    })
                    .length > 0
            }
        } catch (error) {
            console.log(error)
            return false
        }
    },
    menuPalabrasCortas(palabras) {
        let menu
        menuTextosPalabrasSuelta.forEach(function (element) {
            if (element.fraseCliente == palabras) {
                console.log(element)
                menu = element
            }
        })
        return menu
    },
    validaProducto(string) {
        return (string.split(" ").length <= 2)
    },
    diccionarioPalabrasNada(string) {
        try {
            let stringPalabraNada = string.toLowerCase().trim().replace(' ', '')
            let arrListPalabraNada = arrayListPalabrasNada.map((word) => {
                let palabraNada = word.trim().replace(' ', '')
                return palabraNada == stringPalabraNada
            })
            return !!~arrListPalabraNada.indexOf(true)
        } catch (error) {
            console.log(error)
            return false
        }
    },
    statusQuiebre(estatusBO) {
        try {
          let estatus = estatusBO.toLowerCase().trim()
          return (estatus == statusQuiebreBO)
        } catch (error) {
          console.log(error)
          return false
        }
      }

}

var statusQuiebreBO = [
  'ofrecer opciones',
  'deriva a bo'
]

var shortWords = [
    'reclamo',
    'despacho',
    'compra',
    'producto',
    'devolver',
    'cambiar',
    'anular'
]
var badWords = [
    'andate a la chucha',
    'aweona',
    'aweonao',
    'callate fea',
    'chupa el pico',
    'chupalo',
    'concha tu madre',
    'conchetumare',
    'ctm',
    '.l.',
    'ahuenao',
    'culia',
    'culiao',
    'enojona',
    'estupido',
    'fea',
    'fuck you',
    'hijo de puta',
    'hueon',
    'hueona',
    'idiota',
    'la come moco',
    'loca',
    'maraca',
    'mensa',
    'mierda',
    'muerete',
    'no me agradas',
    'pao',
    'pavo',
    'pene',
    'perkin',
    'perkinazo',
    'pesao',
    'pudrete',
    'puta',
    'ql',
    'ridicula',
    'saco wea',
    'te gusta el loly',
    'te gusta por el chico',
    'te odio',
    'tontito',
    'tonta',
    'tonto',
    'vales caca',
    'weon',
    'weona',
    'wuona',
    'una mierda'
]
var arrayListNoRecuerdaOC = [
    'no lo se',
    'no tengo idea',
    'no se cual es',
    'que es eso',
    'que es eso?',
    'no me lo se',
    'ni idea',
    'me pillaste',
    'no lo tengo',
    'n lo tengo',
    'pucha no me acuerdo',
    'no cacho',
    'donde lo veo',
    'donde sale eso',
    'no me acuerdo',
    'no se de donda se saca eso',
    'de donde puedo sacar el numero de la orden',
    'no recuerdo el numero',
    'de donde lo saco',
    'no se',
    'dame el numero de mi orden'
]

var arrayListPalabrasNada = [
    'en nada',
    'nada',
    'naaaaaaaaada',
    'no me ayudas',
    'no me ayudaste en nada',
    'no quiero nada',
    'no sabes nada',
    'ya no quiero nada',
    'no me ayudaste',
    'no quiero tu ayuda'
]