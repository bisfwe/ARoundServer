'use strict';
const https = require('https');
const querystring = require('querystring');
var mongoose = require('mongoose');

const host = 'vision.googleapis.com';
const apiKey = 'API_KEY'

const redis = require("redis");
const redisClient = redis.createClient(6380,'sixhackathon2018-red.redis.cache.windows.net', {auth_pass: 'API_KEY', tls: {servername: 'sixhackathon2018-red.redis.cache.windows.net'}});

// Connect to Mongo DB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://sixhackathon2018-db.documents.azure.com:10255/?ssl=true&replicaSet=globaldb',
  {user: 'sixhackathon2018-db', pass: 'API_KEY'},
  function (err, db) {
});

exports.hello_world = function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hei maailma! :)');
};


exports.process_location = function(req, res) {
  redisClient.georadius('Zurich', req.body.longitude, req.body.latitude, '200', 'm', function(err, reply) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(reply ? JSON.stringify(reply) : JSON.stringify([]));
  });
}


exports.process_image = function(req, res) {
  // build request object for post to Google API, return recognized logo and matching WebContent
  var postObject = {
      requests:[
          {
            image: {content: req.body.image},
            features:[
              {
                type:"LOGO_DETECTION",
                maxResults:10
              },
              {
                type:"WEB_DETECTION",
                maxResults:3
              }
            ]
          }
        ]
    };
  performRequest('/v1/images:annotate', 'POST', postObject, function(response) {
    var logos = [];
    var queries = [];
    var model = require('../models/Model');
    // Query company table
    const Company = mongoose.model('Company');
    if(response.responses && response.responses[0] && response.responses && response.responses[0].logoAnnotations){
      const logoAnnotations = response.responses[0].logoAnnotations;
      for (var i = 0; i < logoAnnotations.length; i++) {
        var annotation = logoAnnotations[i];
        var company = Company.findOne({$or: [{'name': annotation.description}, {'products': annotation.description}]}).exec();
        company.then((function(res) {
          var logo = {tickersymbol: res.tickersymbol, name: res.name, search: annotation.description, products: res.products};
          logos.push(logo);
        }).bind(annotation))
        queries.push(company);
      }
      Promise.all(queries).then(() => {
        logoAnnotations.forEach(ann => {
          var logo = logos.find(l => l.name === ann.description || l.products.indexOf(ann.description)>-1);
          ann.tickersymbol = logo.tickersymbol;
          ann.officialName = logo.name;
        })
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(logoAnnotations ? JSON.stringify(logoAnnotations) : JSON.stringify([]));
      })
    } else {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify([]));
    }

  })
}


// perform request to google API
function performRequest(endpoint, method, data, success) {
  var dataString = JSON.stringify(data);
  var headers = {};
  endpoint += '?' + querystring.stringify({key: apiKey});

  if (method == 'POST') {
    headers = {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    };
  }
  var options = {
    host: host,
    path: endpoint,
    method: method,
    headers: headers
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      var responseObject = JSON.parse(responseString);
      success(responseObject);
    });
  });

  req.write(dataString);
  req.end();
}
