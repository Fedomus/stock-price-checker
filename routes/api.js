'use strict';

const Stock = require("../models/stock.js");
const bcrypt = require("bcrypt");

async function obtenerStock(stock){
  
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;

  let responseData = await fetch(url);

  const { symbol, latestPrice } = await responseData.json();

  if (!symbol || !latestPrice) return null;

  return {
    symbol,
    latestPrice
  }
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
    
        if(like == 'true'){
          
          await agregarLike(stock, ipClient)
          
        }
    
        let likesData = await obtenerLikes(stock)
        
        let stockData = {};
    
        stockData.likes = likesData.likes.length ?? 0;
        stockData.stock = stock;
        stockData.price = stockApiData.latestPrice;
    
        res.json({stockData})
        
      } else if (stock.length === 2){  
    
        let stockData = [];
    
        for (let elem of stock) {
    
          elem = elem.toUpperCase();
    
          if(like == 'true'){
    
            await agregarLike(elem, ipClient)
    
          }
    
          let likesData = await obtenerLikes(elem)
          
          let stockApiData = await obtenerStock(elem);
    
          stockData.push({
            likes : likesData.likes.length ?? 0,
            stock : elem,
            price : stockApiData.latestPrice
          })
    
        }

        stockData[0].rel_likes = stockData[0].likes - stockData[1].likes
        stockData[1].rel_likes = stockData[1].likes - stockData[0].likes
    
        delete stockData[0].likes
        delete stockData[1].likes
        
        res.json({stockData})
        
      }
    
    })
  
};
