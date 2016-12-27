require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var cors = require('cors');

require('./api/models/db');
require('./api/models/redisClient');
require('./api/config/passport');

var api = require('./api/routes/index');

var app = express();

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(helmet());

if(process.env.NODE_ENV !== 'production'){
  var corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200,
    credentials: true
  };
  app.use(cors(corsOptions));
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app')));


/**
* Request debug logger
*/
app.use(function(req, res, next){
  // console.log(req.query);
  // console.log(req.body);
  // req.session.key = 'bar';
  next();
});

app.use('/api', api);

/**
* Send NG2 index once ready
*/

// app.use(function(req, res){
//   res.sendFile(path.join(__dirname, 'app', 'index.html'));
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/**
* error handlers
*/

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message : err.message,
      error : err
    })
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

module.exports = app;