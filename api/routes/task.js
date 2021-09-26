'use strict'
var express = require('express');
var TaskController = require('../controllers/Task');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var crypto = require('crypto');
// var multer = require('multer');
// var multipart = require('connect-multiparty');
var path = require('path');

// const storage = multer.diskStorage({
//   destination(req, file, cb){
//      cb(null, './uploads/QAR');},
//   filename(req, file = {}, cb){
//     const { originalname } = file;
//     const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];
//     console.log(fileExtension);
    // cb(null, file.fieldname + "-" + Date.now()+".jpg");

 //
 //     crypto.pseudoRandomBytes(16, function(err, raw){
 //     cb(null, raw.toString('hex') + Date.now() + fileExtension);});
 //   },
 // })


// var mul_upload = multer({storage});

api.get('/probando-task', md_auth.ensureAuth, TaskController.probando);
api.post('/task', md_auth.ensureAuth, TaskController.savePublication);
api.get('/tasks/:page?', md_auth.ensureAuth, TaskController.getPublications);
api.get('/task/:id', md_auth.ensureAuth, TaskController.getPublication);
api.get('/progress/:id', md_auth.ensureAuth, TaskController.calculateProgress);
api.put('/update-task/:id', md_auth.ensureAuth, TaskController.editTask);

// api.delete('/qareport/:id', md_auth.ensureAuth, TaskController.deletePublication);
// api.post('/upload-image-qa/:id', [md_auth.ensureAuth, mul_upload.single('file')], TaskController.uploadImage);
// api.get('/get-image-qa/:imageFile', TaskController.getImageFile);



module.exports = api;
