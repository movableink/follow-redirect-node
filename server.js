/**
 * Setup
 * ---------------------------------------------------*/
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var serverPort =  process.env.PORT || 8090;
var serverIpAddress =  '127.0.0.1';
var app = express();

/**
 *  Routes
 * ---------------------------------------------------*/
var trace = require('./routes/trace');

//app.set('views', path.join(__dirname, 'views'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/',express.static(path.join(__dirname, 'public')));
app.use('/trace', trace);

//Catch errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
app.listen(serverPort);
console.log('Server started on port: ',serverPort);
