'use strict';

var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var assert = require('assert');
var mongoose = require('mongoose');
var https = require('https');

// Connect to Mongo DB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://sixhackathon2018-db.documents.azure.com:10255/?ssl=true&replicaSet=globaldb',
  {user: 'sixhackathon2018-db', pass: 'API_KEY'},
  function (err, db) {
});

var model = require('./api/models/Model');
var Company = mongoose.model('Company');


// Load company data
var companyData = require('./data/company.json');
Company.collection.insertMany(companyData, function(err,r) {
  assert.equal(null, err);
});

// Load geo location data
var redis = require("redis");
var redisClient = redis.createClient(6380,'sixhackathon2018-red.redis.cache.windows.net', {auth_pass: 'API_KEY', tls: {servername: 'sixhackathon2018-red.redis.cache.windows.net'}});
Company.find({}, function(err, companies) {
  companies.forEach( function(company) {
    var companyName = company.name.split(' ').join('+');
    var url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + companyName + '+in+Zurich&language=en&key=API_KEY';
    https.get(url, res => {
      res.setEncoding('utf8');
      let body = '';
      res.on('data', data => {
        body += data;
      });
      res.on('end', () => {
        body = JSON.parse(body);
        body.results.forEach(function(loc) {
          redisClient.geoadd('Zurich', loc.geometry.location.lng, loc.geometry.location.lat, company.tickersymbol, function(err, reply) {
            //console.log(reply);
          });
        });
      });
    });
  });
});

// Start RESTful API
var app = express();
app.use(cors());

var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb', parameterLimit: 1000000 }));
app.use(bodyParser.json({limit: '50mb', parameterLimit: 1000000}));

var routes = require('./api/routes/Routes');
routes(app);

app.listen(port);

console.log('RESTful API server started on: ' + port);
