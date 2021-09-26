'use strict'
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

//rutas
var user_routes = require('./routes/user');
var report_routes = require('./routes/report');
var qareport_routes = require('./routes/QAreport');
var task_routes = require('./routes/task');



//middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//cors

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});

//controllers

//rutas
// app.use(express.static(path.join(__dirname, 'client')));
app.use('/', express.static('client', {redirect: false}));

app.use('/api', user_routes);
app.use('/api', report_routes);
app.use('/api', qareport_routes);
app.use('/api', task_routes);
app.get ('*', function(req, res, next) {
  return res.sendfile(path.resolve('client/index.html'));
})

//exportar
module.exports = app;
