# Descripción
Hace un registro de cada mensaje que recibe y envia el bot.

## Requisitos

| Paquetes          | comando                                          |
|---------------|------------------------------------------------|
| mongodb | `npm install mongodb --save`  |



# Pasos para implementar el módulo de logs
  * Instala el paquete mongodb usando este comando:  `npm install mongodb --save`
  * Copia y pega la carpeta `logs` en la raíz del proyecto
  * Agrega esta línea de código
  ```bash
    global.logs = require('./logs')
    require('./logs/middleware.js')(bot)
  ``` en tu archivo `app.js`
  * En tu archivo `.env` agrega las siguientes variables de entorno, con la información del proyecto. Ejemplo:
    ```bash
    MONGO_HOST=localhost
    MONGO_PORT=27017
    MONGO_DATABASE=amanda_sales_db
    ```
# Como usar el módulo de Logs
  Simplemente agregas esta función en cada paso de tu dialogo `logs.registerLog(session, args, collectionName)`
  La función espera 3 parametros:
  * **session**: Es la información de sessión del bot framework, Aquí podemos atajar el mensaje que se envia.
  * **args**: Son los argumentos del bot framework . Aqui podemos extraer la información del score de la palabra que se esta recibiendo
  * **collectionName**: Aqui le pasamos el nombre de la colección donde se guardara el log
