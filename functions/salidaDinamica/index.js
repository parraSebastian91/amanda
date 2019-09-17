module.exports = {
  async dialogIntent(session){
    const intentType = await new Promise(async resolve => {
      resolve(await connectionApiLuis.existsInLUIS(session.message.text))
    })
    return intentType.toLowerCase()
    //session.beginDialog(`/${intentType.toLowerCase()}`)
  }
}