var supertest = require('supertest'),
  app = require('../../app');

describe('GET /reclamos/add', function() {
  it('Guarda un reclamo sin error', function(done) {
    supertest(app)
      .get('/reclamos/add?a=string&b=2')
      .expect(422)
      .end(done);
  })
})