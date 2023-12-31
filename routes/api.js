'use strict';

const Stock = require("../models/stock.js");
const bcrypt = require("bcrypt");
const https = require("node:https");

async function obtenerStock(stock){
  
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
  
  let responseData = '';

  let call = new Promise((resolve, reject) => {

    https.get(url, function (res) {

      res.on('data', function (chunk) {
        responseData += chunk;
      }).on('end', function () {
          resolve(responseData);
      });

    }).on('error', function (e) {
        reject(e);
    });

  })

  return call.then(data => {

    let {symbol, latestPrice} = JSON.parse(data);

    if (!symbol || !latestPrice) return null;
          
    latestPrice = parseFloat(latestPrice)
  
    return {
      symbol,
      latestPrice
    }

  })




}

async function obtenerLikes(stock){

  let data = await Stock.findOne({
    symbol: stock
  })

  if (!data) {
    data = await Stock.create({ symbol: stock });
  }

  return data

}

async function agregarLike(stock, ipClient){

  let existeLike = false;

  let likesData = await obtenerLikes(stock)

  if(likesData.likes.length){

    for (const like of likesData.likes) {
    
      let ipsIguales= await bcrypt.compare(ipClient, like);

      if(ipsIguales){

        existeLike = true;

        break;
      
      }
      
    }
  }

  if(!existeLike){
    
    let hashedPass = await bcrypt.hash(ipClient, 10);

    await Stock.updateOne(
      { symbol: stock },
      { $push: { likes: hashedPass } }
    )

  }


}


module.exports = function (app) {

  app.route('/api/stock-prices')
  
    .get(async function (req, res){

      let stock = req.query.stock;
      let like = req.query.like;
      let ipClient = req.ips.toString();

      if(!Array.isArray(stock)){

        stock = stock.toUpperCase();
    
        let stockApiData = await obtenerStock(stock)

        if(stockApiData){
          if(like == 'true'){
          
            await agregarLike(stock, ipClient)
            
          }
      
          let likesData = await obtenerLikes(stock)
          
          let stockData = {};
      
          stockData.likes = likesData.likes.length ?? 0;
          stockData.stock = stock;
          stockData.price = stockApiData.latestPrice;
      
          res.status(200).json({stockData})
          
        } else {
          res.status(200).json({stockData: []})
        }
    
     
      } else if (stock.length === 2){  
    
        let stockData = [];

        let existenStocks = true;
    
        for (let elem of stock) {
    
          elem = elem.toUpperCase();
    
          if(like == 'true'){
    
            await agregarLike(elem, ipClient)
    
          }
    
          let likesData = await obtenerLikes(elem)
          
          let stockApiData = await obtenerStock(elem);

          if(stockApiData){
            stockData.push({
              likes : likesData.likes.length ?? 0,
              stock : elem,
              price : stockApiData.latestPrice
            })
          } else{
            existenStocks = false;
          }
    
        }

        if(existenStocks){
          stockData[0].rel_likes = stockData[0].likes - stockData[1].likes
          stockData[1].rel_likes = stockData[1].likes - stockData[0].likes
      
          delete stockData[0].likes
          delete stockData[1].likes
        }
        
        res.status(200).json({stockData})
        
      }
    
    })
  
};
