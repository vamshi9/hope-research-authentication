if(process.env.NODE_ENV !== 'production'){
  require('dotenv').load();
}

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');

// routes
const routes = require('./api/routes/index');
const users = require('./api/routes/users');

// mongoose connection
const uri = process.env.MONGO_URI
mongoose.connect(uri,{
    useNewUrlParser: true
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      message: 'Sorry there is some issue with databse connection. Please check you internet.',
      error:err
    });
  });
mongoose.Promise= global.Promise; 


const app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(port, _ => {
  console.log(`Server is running on ${port}`);
})

module.exports = app;
