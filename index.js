'use strict'

const http = require('http');
const express = require('express');
const config = require('./config');

const underscore = require('underscore');
const session = require('express-session');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');

GLOBAL.config = config;
GLOBAL.express = express;
GLOBAL.express_validator = expressValidator;
GLOBAL._ = underscore;
GLOBAL.mongoose = mongoose;
GLOBAL.async = require('async');
GLOBAL.ObjectId = mongoose.Types.ObjectId;
GLOBAL.slug = require('slug');

/*locals.meta = {
    title: 'Situs Jual Beli Online Khusus Merchanise Mudah Dan Terpercaya | Pasar Underground',
    description: 'Tempat jual beli online terpercaya di Indonesia, belanja murah, di Pasar Underground'
}*/

app.use(express.static('public'));

app.use(session({
    secret: 'ayimonline-secret',
    resave: false,
    saveUninitialized: true
}));

app.use(function(err, req, res, next){
    if (!err) { return next(); }

    console.error(err);
    return next();
});

// Using the .html extension instead of having to name the views as *.ejs
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);


app.use(function(req, res, next){
  res.locals.session = req.session;
  return next();
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));

app.use(expressValidator());

app.use(function(req, res, next){
  var path = req.path.split('/');

  if (path[1] == 'account' &&
    req.session.login_type == undefined &&
    req.session.user == undefined) {
    return res.redirect('/')
  }

  return next();
});

app.use('/', require('./controllers/front/index'));
app.use('/product', require('./controllers/front/product'));
app.use('/auth', require('./controllers/front/auth'));
app.use('/account/product', require('./controllers/front/account/product'));
app.use('/account/profile', require('./controllers/front/account/profile'));

/*app.use(function(req, res, next){
  if (req.accepts('html')) {
    res.render('template/default/error')
    return;
  }
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }
  // default to plain-text. send()
  res.type('txt').send('Not found');
})*/

var server = http.createServer(app);

server.listen(config.port, function () {
  var host = config.host;
  var port = server.address().port;

  console.log('ayimonline listening http://%s:%s', host, port);
});