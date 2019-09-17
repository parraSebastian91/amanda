module.exports = (sku) => {
  var reg = /(cod|sku)?\s*?\d{7,9}/
  if (!reg.test(sku.trim())) return false
  return true
}
