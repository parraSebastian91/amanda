var supertest = require('supertest'),
    app = require('../../app');

describe('GET /tiendas/get', function () {
    it('responde json sin error', function (done) {
        supertest(app)
            .get('/tiendas/get/?nombre=Temuco')
            .expect(200)
            .end(done);
    });
});

