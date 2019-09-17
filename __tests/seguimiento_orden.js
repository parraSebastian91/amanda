require('dotenv').config()

const parameters = [process.env.SEGUIMIENTO_ORDEN_ID, process.env.SEGUIMIENTO_ORDEN_EMAIL]
WEBTRACKING.getOrder(...parameters).then(e => console.log(e))