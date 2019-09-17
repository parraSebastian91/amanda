const rutFormater = require("./rutFormater")

const siebelFormatDocument = rut => {
  const formatRut = rutFormater(rut)
  if (formatRut.length === 2) {
    const digitoVerificador = formatRut[1].toUpperCase()
    return {
      tipo: "RUT",
      numero: formatRut[0],
      digitoVerificador
    }
  }
  return {
    tipo: "RUT",
    numero: "",
    digitoVerificador: ""
  }
}

module.exports = siebelFormatDocument