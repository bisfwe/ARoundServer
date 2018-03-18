'use strict';

module.exports = function(app) {
  var c = require('../controllers/Controller');

  app.route('/api')
    .get(c.hello_world)
    .post(c.hello_world);


  app.route('/image')
    .post(c.process_image);
    // no other requests supported
  app.route('/location')
    .post(c.process_location);
};
