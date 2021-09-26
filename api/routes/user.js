'use strict'
var express = require('express');
var UserController = require('../controllers/user');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
//var multipart = require('connect-multiparty');
//var md_upload = multipart({uploadDir: './uploads/users}'});

var crypto = require('crypto');
var multer = require('multer');
var path = require('path');

//
const storage = multer.diskStorage({
  destination(req, file, cb){
     cb(null, './uploads/users');},
  filename(req, file = {}, cb){
    const { originalname } = file;
    const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];
    console.log(fileExtension);
    // cb(null, file.fieldname + "-" + Date.now()+".jpg");


     crypto.pseudoRandomBytes(16, function(err, raw){
     cb(null, raw.toString('hex') + Date.now() + fileExtension);});
   },
 })

 var mul_upload = multer({storage});
 //var mul_upload = multer({ storage: storage }).single('image');
// var mul_upload = multer({storage: storage, fileFilter: helpers.imageFilter });

api.get('/home', UserController.home);
api.get('/pruebas', md_auth.ensureAuth, UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
api.get('/users/:page?',  md_auth.ensureAuth, UserController.getUsers);
api.get('/allusers',  md_auth.ensureAuth, UserController.getUsersAll);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, mul_upload.single('image')], UserController.uploadImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile);




//si quiero hacer opcional el parametro le pongo un signo de interrogacion al final user/:id? asi


module.exports = api;
