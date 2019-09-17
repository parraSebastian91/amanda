const subOrders = (array, srch) => {
  let arr = []
  if (typeof array !== "undefined" && array !== null && array.length > 0) {
    arr = array.map(i => i).find(_ => _.id === srch)
  }
  return arr
}

module.exports = subOrders