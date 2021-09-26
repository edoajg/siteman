'use strict'
var express = require('express');
var QAReportController = require('../controllers/QAreport');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var crypto = require('crypto');
var multer = require('multer');
// var multipart = require('connect-multiparty');
var path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb){
     cb(null, './uploads/QAR');},
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

api.get('/probandooo-pub', md_auth.ensureAuth, QAReportController.probando);
api.post('/qa-report', md_auth.ensureAuth, QAReportController.savePublication);
api.get('/qareports/:page?', md_auth.ensureAuth, QAReportController.getPublications);
api.get('/qareport/:id', md_auth.ensureAuth, QAReportController.getPublication);
api.delete('/qareport/:id', md_auth.ensureAuth, QAReportController.deletePublication);
api.post('/upload-image-qa/:id', [md_auth.ensureAuth, mul_upload.single('file')], QAReportController.uploadImage);
api.get('/get-image-qa/:imageFile', QAReportController.getImageFile);



module.exports = api;
