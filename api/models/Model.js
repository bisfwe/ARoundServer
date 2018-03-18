'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompanySchema = new Schema({
  name: {
    type: String,
    required : true
  },
  tickersymbol: {
    type: String,
    required : true,
    dropDups: true,
    unique: true
  },
  products: [{
    type: String
  }]
});

// var ProductSchema = new Schema({
//   name: {
//     type: String,
//     required : true
//   },
//   tickersymbol: {
//     type: String,
//     required : true,
//     dropDups: true,
//     unique: true
//   }
// });

module.exports = {
  Company: mongoose.model('Company', CompanySchema),
//  Product: mongoose.model('Product', ProductSchema)
};
