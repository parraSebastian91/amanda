
const validateRut = require('../../functions/validadores').validarRut
const expect = require('chai').expect

describe('ValidateRut action', () => {
    it('Should validate a valid rut', done => {
        result = validateRut({ rut: '18855995-6' });
        expect(result).to.be.equal(true)
        done()
    })

    it('Should validate a valid rut', done => {
        result = validateRut({ rut: '18855995-4' });
        expect(result).to.be.equal(false)
        done()
    })

    it('Should validate a valid rut', done => {
        result = validateRut({ rut: '' });
        expect(result).to.be.equal(false)
        done()
    })
})
