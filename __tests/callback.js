require('dotenv').config()

const parameters = JSON.parse(process.env.CALLBACK_INFO)
GENESYS.getClienteLlamadaSolicitar(parameters).then(e => console.log(e))