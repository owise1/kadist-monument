var express = require('express');
var app     = express();

var config = require('./config.js')

app.use(express.static(__dirname + '/public'));


app.listen(config.port);
console.log('Listening on port ' + (config.port + ''));
