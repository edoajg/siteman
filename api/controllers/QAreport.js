'use strict'
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

// var Report = require('../models/report');
var QAReport = require('../models/qa_report');
var User = require('../models/user');
var Task = require('../models/task');

function probando(req, res){
  res.status(200).send({
    message: "Hola desde el controlador de QAreports"});
}

function savePublication(req, res){
  var params = req.body;

//  if(!params.text) return res.status(200).send({message: 'debes enviar un texto'});

  var publication = new QAReport();
  publication.task = params.task;
  publication.file = 'null'
  publication.user = req.user.sub;
  publication.number = params.number;
  publication.remarks = params.remarks;
  publication.created_at = moment().unix();
  publication.save((err, publicationStored) =>{
    if(err) return res.status(500).send({message: 'error al guardar la publicacionnnn'});
    if(!publicationStored) return res.status(500).send({message: 'la publicacion no ha sido guardada'});
    return res.status(200).send({qa_report: publicationStored});
  })

}

function getPublications (req, res){
var page = 1;
  if(req.params.page){
    page = req.params.page;
  }
  var itemsPerPage = 4;
    QAReport.find().sort('-created_at').populate('user', '-password').paginate(page, itemsPerPage, (err, publications, total) => {
      if(err) return res.status(500).send({message: 'error al devolver el publicaciones'});
      if(!publications) return res.status(404).send({message: 'no hay publicaciones'});
      return res.status(200).send({
        total_items: total,
        pages: Math.ceil(total/itemsPerPage),
        page: page,
        items_per_page: itemsPerPage,
        publications
      });
    });


}
function getPublication (req, res){
  var publicationId = req.params.id;
  QAReport.findById(publicationId, (err, publication) =>  {
    if(err) return res.status(500).send({message: 'error al devolver publicacion'});
    if(!publication) return res.status(404).send({message: 'no hay publicacion'});
    return res.status(200).send({publication});
  });
}


function deletePublication (req, res) {
var publicationId = req.params.id;
QAReport.find({'user': req.user.sub, '_id': publicationId}).remove((err, publicationRemoved) =>  {
  if(err) return res.status(500).send({message: 'error al borrar publicacion'});
  if(!publicationRemoved) return res.status(404).send({message: 'no hay publicacion'});
  return res.status(200).send({publication: publicationRemoved});
});

}

function uploadImage(req, res){
    var publicationId = req.params.id;
    if(req.file){
      var file_path = req.file.path;
    //  console.log(file_path);
      var file_split = file_path.split('/');
    //  console.log(file_split);
      var file_name = file_split[2];
      var ext_split = file_name.split('.');
      var file_ext = ext_split[1];
    //  console.log(file_ext);

    if(file_ext == 'jpeg' || file_ext == 'jpg' || file_ext == 'gif'){

    QAReport.findOne({'user': req.user.sub, '_id': publicationId}).exec((err, publication) => {
        if(publication){
          //actualizar el documento de la publicacion
                QAReport.findByIdAndUpdate(publicationId, {file: file_name}, {new: true}, (err, publicationUpdated) => {
                  if(err) return res.status(500).send ({message: 'error en la peticion'});
                  if(!publicationUpdated) return res.status(404).send ({message: 'no se ha podido actualizar'});
                  return res.status(200).send({publication: publicationUpdated});
                });
        }else{
          return removeFiles(res, file_path, 'no tienes permiso para actualizar esta publicacion');

        }
      });

    }else{
      return removeFiles(res, file_path, 'extension de archivo no valida');
    }}else{
      return res.status(404).send({message: 'no se han subido archivos'});
    }}


function removeFiles (res, file_path, message){
      fs.unlink(file_path, (err) =>{
        return res.status(404).send({message: message})
      })
      }

function getImageFile(req, res){
    var image_file = req.params.imageFile;
    var path_file = 'uploads/QAR/'+image_file;
    fs.exists(path_file, (exists) => {
      if(exists){
        res.sendFile(path.resolve(path_file));
      }else{
        res.status(200).send({message: 'no existe la imagen'});
      }
    });
}

module.exports = {
  probando,
  savePublication,
  getPublications,
  getPublication,
  deletePublication,
  uploadImage,
  getImageFile
}
