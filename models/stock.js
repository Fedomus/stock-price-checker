const mongoose = require('mongoose');
const {Schema, model, set, connect} = mongoose;

require('dotenv').config();

const uri = process.env.MONGO_URI;

// futura migracion a mongoose 7
set("strictQuery", false);

connect(uri).catch(err => console.log(err));

const StockSchema = new Schema({
  symbol: {type: String, require: true},
  likes: [String],
});


module.exports = model("stock", StockSchema);