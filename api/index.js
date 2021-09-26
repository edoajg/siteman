'use strict'
var mongoose = require('mongoose');
var app = require('./app');
var port = 3801;
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/siteman', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
        .then(() => {
            console.log('connection successssss');
            // server
            app.listen(port, () => {
              console.log('servidor corriendo en http:// localhost:3801');
            });

        })
        .catch(err => console.log(err));
