const chaiHttp = require('chai-http');
const chai = require('chai');
const server = require('../server');

const {assert, use} = chai;

use(chaiHttp);

describe('Functional Tests', function() {
    
    describe('GET /api/stock-prices return stockData object', function() {
      
        it('1 stock', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .send({stock: 'goog'})
            .end(function(err, res){
                
                assert.equal(res.status, 200)
                assert.typeOf(res.body, 'object')
                assert.property(res.body, 'stockData');

                assert.property(res.body.stockData, 'stock')
                assert.property(res.body.stockData, 'price')
                assert.property(res.body.stockData, "likes")

                assert.typeOf(res.body.stockData.price, "number")
                assert.typeOf(res.body.stockData.likes, "number")
                
            })

            done()
        })
        
        it('1 stock with like', function(done) {
          chai.request(server)
            .get('/api/stock-prices')
            .send({ stock: 'goog', like: 'true' })
            .end(function(err, res){

                assert.equal(res.status, 200)
                
                assert.property(res.body, 'stockData')
                assert.property(res.body.stockData, 'stock')
                assert.property(res.body.stockData, 'price')
                assert.property(res.body.stockData, 'likes')
                assert.typeOf(res.body.stockData.price, 'number')
                assert.typeOf(res.body.stockData.likes, 'number')
    
            });

            done()
        });
        
        it('1 stock with like again', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .send({ stock: 'goog', like: 'true' })
            .end(function(res){
  
                assert.equal(res.status, 200)
                assert.property(res.body, 'stockData')
                assert.property(res.body.stockData, 'stock')
                assert.property(res.body.stockData, 'price')
                assert.property(res.body.stockData, 'likes')
                assert.typeOf(res.body.stockData.price, 'number')
                assert.typeOf(res.body.stockData.likes, 'number')
    
            })

            done()
        })
        
        it('2 stocks', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .send({ stock: ['goog', 'msft'] })
            .end(function(res){

                assert.equal(res.status, 200)
                assert.property(res.body, 'stockData')
                assert.isArray(res.body.stockData)
                assert.property(res.body.stockData[0], 'stock')
                assert.property(res.body.stockData[0], 'price')
                assert.property(res.body.stockData[0], 'rel_likes')
                assert.typeOf(res.body.stockData[0].price, 'number')
                assert.typeOf(res.body.stockData[0].rel_likes, 'number')
                
                assert.property(res.body.stockData[1], 'stock')
                assert.property(res.body.stockData[1], 'price')
                assert.property(res.body.stockData[1], 'rel_likes')
                assert.isNumber(res.body.stockData[1].price)
                assert.isNumber(res.body.stockData[1].rel_likes)
 
            })

            done()
        })
        
        it('2 stocks with like', function(done) {
            chai.request(server)
            .get('/api/stock-prices')
            .send({ stock: ['goog', 'msft'], like: 'true' })
            .end(function(res){
  
                assert.equal(res.status, 200)
                assert.property(res.body, 'stockData')
                assert.isArray(res.body.stockData)
                assert.property(res.body.stockData[0], 'stock')
                assert.property(res.body.stockData[0], 'price')
                assert.property(res.body.stockData[0], 'rel_likes')
                assert.isNumber(res.body.stockData[0].price)
                assert.isNumber(res.body.stockData[0].rel_likes)
                
                assert.property(res.body.stockData[1], 'stock')
                assert.property(res.body.stockData[1], 'price')
                assert.property(res.body.stockData[1], 'rel_likes')
                assert.isNumber(res.body.stockData[1].price)
                assert.isNumber(res.body.stockData[1].rel_likes)

            });

            done()
        }); 
    });
});