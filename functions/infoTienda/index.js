const moment = require('moment')
const tiendaEntities = require('./../entities/tienda')
const horariosSucursalesDiciembre = require('./horariosFalabella_122018.json')

module.exports = {
  showInfoTienda(session, tienda) {
    let dateTodayFormat
    let dateTodayWeekDay
    let scheduleToday
    let array_choices_date_list = []
    if (moment() >= moment('2018/12/01') && moment() <= moment('2018/12/31')) {
      moment.updateLocale('en', {
        weekdays: [
          "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"
        ]
      })

      dateTodayFormat = moment().format('DD/MM/YYYY')
      dateTodayWeekDay = moment(dateTodayFormat, 'DD/MM/YYYY').format('dddd D')

      horariosSucursalesDiciembre.SUCURSAL.forEach(function (sucursal, index_sucursal, array_sucursal) {
        if (sucursal.ID == tienda.id) {
          for (var key in sucursal.HORARIO[0]) {
            let fecha = key
            let value = sucursal.HORARIO[0][key]
            fecha = moment(fecha, 'DD/MM/YYYY').format('dddd D')
            fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1)
            if (value == '') {
              value = 'Cerrado por feriado'
            } else {
              if (dateTodayFormat == key) {
                scheduleToday = value
              }
            }
            if (moment().format('DD/MM/YYYY') < moment(key, 'DD/MM/YYYY').format('DD/MM/YYYY')) {
              let aux_array = { 'title': fecha, 'value': value }
              array_choices_date_list.push(aux_array)
            }
          }
        }
      })
    }
    const adressStore = `Ubicada en ${tienda.calle}.`
    const thumbnailResult = tiendaEntities.generateMap(session, tienda, adressStore)
    const reply = new builder.Message(session).addAttachment(thumbnailResult)
    let dateListCardJSON
    let dateListCard
    if (moment() >= moment('2018/12/01') && moment() <= moment('2018/12/31')) {
      dateListCardJSON = {
        "contentType": "application/vnd.microsoft.card.adaptive",
        "content": {
          "type": "AdaptiveCard",
          "body": [
            {
              "type": "TextBlock",
              "text": `El horario de atención de <b>hoy ${dateTodayWeekDay}</b> es de ${scheduleToday} hrs.`
            },
            {
              "type": "TextBlock",
              "text": `\n¿Deseas conocer el horario de otro día de diciembre?\n`
            },
            {
              "type": "Input.ChoiceSet",
              "style": "compact",
              "id": "dias_diciembre",
              "placeholder": "Selecciona un día",
              "choices": array_choices_date_list
            }
          ]
        }
      }
      dateListCard = new builder.Message(session).addAttachment(dateListCardJSON)
    }
    session.send(reply)
    // if (moment() >= moment('2018/12/01') && moment() <= moment('2018/12/31')) {
    //   session.send(dateListCard)
    // } else {
    //   session.send(`${tienda.nombreFantasia} atiende de ${tienda.horarios}.`)
    // }
    //switch (new Date("2019-05-01T07:56:00.123Z").toLocaleDateString()) {
    switch (new Date().toLocaleDateString()) {
      case "2019-5-1":
        session.send('El 1° de Mayo todas nuestras tiendas se encontrarán cerradas por motivos del Día del Trabajador. Recuerda que también puedes revisar todas nuestras ofertas en Falabella.com')
        break
      case "2019-9-17":
        session.send(`${tienda.nombreFantasia} atiende de 11:00 - 20:30.`)
        break
      case "2019-9-18":
        session.send('Hoy 18 de Septiembre todas nuestras tiendas se encontrarán cerradas por motivos de Fiestas Patrias. Recuerda que también puedes revisar todas nuestras ofertas en Falabella.com')
        break
      case "2019-9-19":
        session.send('Hoy 19 de Mayo todas nuestras tiendas se encontrarán cerradas por motivos de Fiestas Patrias. Recuerda que también puedes revisar todas nuestras ofertas en Falabella.com')
        break
      default:
        session.send(`${tienda.nombreFantasia} atiende de ${tienda.horarios}.`)
        break
    }
  },
  showHorarioTienda(session, tienda) {
    let dateTodayFormat
    let dateTodayWeekDay
    let scheduleToday
    let array_choices_date_list = []
    if (moment() >= moment('2018/12/01') && moment() <= moment('2018/12/31')) {
      moment.updateLocale('en', {
        weekdays: [
          "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"
        ]
      })

      dateTodayFormat = moment().format('DD/MM/YYYY')
      dateTodayWeekDay = moment(dateTodayFormat, 'DD/MM/YYYY').format('dddd D')

      horariosSucursalesDiciembre.SUCURSAL.forEach(function (sucursal, index_sucursal, array_sucursal) {
        if (sucursal.ID == tienda.id) {
          for (var key in sucursal.HORARIO[0]) {
            let fecha = key
            let value = sucursal.HORARIO[0][key]
            fecha = moment(fecha, 'DD/MM/YYYY').format('dddd D')
            fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1)
            if (value == '') {
              value = 'Cerrado por feriado'
            } else {
              if (dateTodayFormat == key) {
                scheduleToday = value
              }
            }
            if (moment().format('DD/MM/YYYY') < moment(key, 'DD/MM/YYYY').format('DD/MM/YYYY')) {
              let aux_array = { 'title': fecha, 'value': value }
              array_choices_date_list.push(aux_array)
            }
          }
        }
      })
    }

    let dateListCardJSON
    let dateListCard
    if (moment() >= moment('2018/12/01') && moment() <= moment('2018/12/31')) {
      dateListCardJSON = {
        "contentType": "application/vnd.microsoft.card.adaptive",
        "content": {
          "type": "AdaptiveCard",
          "body": [
            {
              "type": "TextBlock",
              "text": `${tienda.nombreFantasia} atiende <b>hoy ${dateTodayWeekDay}</b> de ${scheduleToday} hrs.`
            },
            {
              "type": "TextBlock",
              "text": `\n¿Deseas conocer el horario de otro día de diciembre?\n`
            },
            {
              "type": "Input.ChoiceSet",
              "style": "compact",
              "id": "dias_diciembre",
              "placeholder": "Selecciona un día",
              "choices": array_choices_date_list
            }
          ]
        }
      }
      dateListCard = new builder.Message(session).addAttachment(dateListCardJSON)
    }

    // if (moment() >= moment('2018/12/01') && moment() <= moment('2018/12/31')) {
    //   session.send(dateListCard)
    // } else {
    //   session.send(`${tienda.nombreFantasia} atiende de ${tienda.horarios}.`)
    // }

    //switch (new Date("2019-09-18T07:56:00.123Z").toLocaleDateString()) {
    switch (new Date().toLocaleDateString()) {
      case "2019-5-1":
        session.send('El 1° de Mayo todas nuestras tiendas se encontrarán cerradas por motivos del Día del Trabajador. Recuerda que también puedes revisar todas nuestras ofertas en Falabella.com')
        break
      case "2019-9-17":
        session.send(`${tienda.nombreFantasia} atiende de 11:00 - 20:30.`)
        break
      case "2019-9-18":
        session.send('Hoy 18 de Septiembre todas nuestras tiendas se encontrarán cerradas por motivos de Fiestas Patrias. Recuerda que también puedes revisar todas nuestras ofertas en Falabella.com')
        break
      case "2019-9-19":
        session.send('Hoy 19 de Mayo todas nuestras tiendas se encontrarán cerradas por motivos de Fiestas Patrias. Recuerda que también puedes revisar todas nuestras ofertas en Falabella.com')
        break
      default:
        session.send(`${tienda.nombreFantasia} atiende de ${tienda.horarios}.`)
        break
    }
  }
}