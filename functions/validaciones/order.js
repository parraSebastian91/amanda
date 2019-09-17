module.exports = {
  order(orderNumber) {
    const reg = /([0-9])+/
    const quanty = orderNumber.length <= 12 && orderNumber.length >= 10
    if (reg.test(orderNumber) && quanty) return true
    return false
  }
}