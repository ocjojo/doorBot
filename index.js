(function(){
	'use strict';

	var config = require('./config.json'),
		DoorBot = require('./lib/doorbot'),
		bodyParser = require('body-parser'),
		exphbs  = require('express-handlebars'),
		express = require('express'),
		app = express();

	var doorbot;

	app.engine('handlebars', exphbs());
	app.set('view engine', 'handlebars');

	app.use( bodyParser.json() );       // to support JSON-encoded bodies
	app.use( bodyParser.urlencoded({     // to support URL-encoded bodies
		extended: true
	}) );

	app.get('/', function (req, res) {

		res.render('log', {
			log: doorbot.getLog(),
			helpers: {
				formatDate: function(date){
					return date
					.replace(/T/, ' ')
  					.replace(/\..+/, '');
				}
			}
		});
	});

	app.listen(config.port, function () {
		doorbot = new DoorBot(config);
		console.log(`DoorBot listening on port ${config.port}!`);
	});

})();