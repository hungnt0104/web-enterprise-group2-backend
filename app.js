var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');



//cors
const cors = require('cors')
//mongoose
const mongoose = require('mongoose')
mongoose.set("strictQuery", false);
//To test on postman
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/Users/users');
var adminRouter = require('./routes/Admin/admin');
var articleRouter = require('./routes/Articles/articles');


var app = express();

//cors
app.use(cors())
mongoose.connect("mongodb+srv://nguyenthanhhungthcneu:GQl4XwL687XLQjBy@cluster0.wqgufee.mongodb.net/WebProject")
.then(()=>console.log("ok"))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/articles', articleRouter);


app.use('/images', express.static(path.join(__dirname, 'public/Images')));
app.use('/pdfs', express.static(path.join(__dirname, 'public/PDFs')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//To test on postman
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(express.json());

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

port = process.env.PORT || 5000
app.listen(port)

module.exports = app;
