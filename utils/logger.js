const { createLogger, format, transports } = require('winston')
//const moment = require('moment')
// Para crear achivo en local se debe descomentar new transports.File

const logger = createLogger({
  format: format.combine(
    format.simple(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf((info) =>
      `[ ${info.timestamp} ${info.level} # ${info.message}]`
    )
  ),
  transports: [
    // new transports.File({
    //   maxsize: 5120000,
    //   maxFiles: 2,
    //   filename: `${__dirname}/../logs/logger-txt/amandalog_${moment().format("YYMMDDMMSS")}.log`,
    //   level: 'debug',
    // }),
    new transports.Console({
      level: 'info'
    })
  ]
})

module.exports = logger