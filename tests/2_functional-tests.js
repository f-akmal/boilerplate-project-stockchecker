/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http')
const chai = require('chai')
const assert = chai.assert
const server = require('../server')

chai.use(chaiHttp)

suite('Functional Tests', function () {

  suite('GET /api/stock-prices => stockData object', function () {

    test('1 stock', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog' })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.stock, 'goog')
          assert.exists(res.body.price)
          assert.exists(res.body.likes)
          done()
        })
    })

    test('1 stock with like', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog', like: true })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.body.stock, 'goog')
          assert.exists(res.body.price)
          assert.exists(res.body.likes)
          done()
        })
    })

    test('1 stock with like again (ensure likes arent double counted)', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog', like: true })
        .end((err, res) => {
          const { likes } = res.body
          chai.request(server)
            .query({ stock: 'goog', like: true })
            .end((err, res) => {
              assert.equal(res.status, 200)
              assert.equal(res.body.stock, 'goog')
              assert.exists(res.body.price)
              assert.equal(res.body.likes, likes)
              done()
            })
        })
    })

    test('2 stocks', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['goog', 'msft'] })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          res.body.forEach(body => {
            assert.exists(body.stock)
            assert.exists(body.price)
            assert.exists(body.rel_likes)
          })
          done()
        })
    })

    test('2 stocks with like', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['goog', 'msft'], like: true })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          res.body.forEach(body => {
            assert.exists(body.stock)
            assert.exists(body.price)
            assert.exists(body.rel_likes)
          })
          done()
        })
    })
  })
})
