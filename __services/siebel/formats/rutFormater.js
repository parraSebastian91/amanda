const formatRut = rut => {
  const result = rut.replace(/-/g, "").replace(/\./g, "")
  return [result.slice(0, -1), result.slice(-1).toUpperCase()]
}

module.exports = formatRut