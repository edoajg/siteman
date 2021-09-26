'use strict'
var express = require('express');
var ReportController = require('../controllers/report');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var crypto = require('crypto');
var multer = require('multer');
// var multipart = require('connect-multiparty');
var path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb){
     cb(null, './uploads/publications');},
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

api.get('/probando-pub', md_auth.ensureAuth, ReportController.probando);
api.post('/publication', md_auth.ensureAuth, ReportController.savePublication);
api.get('/publications/:page?', md_auth.ensureAuth, ReportController.getPublications);
api.get('/reports/:task?', md_auth.ensureAuth, ReportController.getReportsForTask);
api.get('/publication/:id', md_auth.ensureAuth, ReportController.getPublication);
api.delete('/publication/:id', md_auth.ensureAuth, ReportController.deletePublication);
api.post('/upload-image-pub/:id', [md_auth.ensureAuth, mul_upload.single('file')], ReportController.uploadImage);
api.get('/get-image-pub/:imageFile', ReportController.getImageFile);
api.get('/reports-count/:task', md_auth.ensureAuth, ReportController.getReportCounter);




module.exports = api;
