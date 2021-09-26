'use strict'
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
var underscore = require('underscore-node');

var Report = require('../models/report');
var QAReport = require('../models/qa_report');
var User = require('../models/user');
var Task = require('../models/task');

function probando(req, res){
  res.status(200).send({
    message: "Hola desde el controlador de Tasks"});
}

function savePublication(req, res){
  var params = req.body;

//  if(!params.text) return res.status(200).send({message: 'debes enviar un texto'});

  var publication = new Task();
  publication.name = params.name;
  // publication.file = 'null'
  publication.user = req.user.sub;
  publication.date_from = params.date_from;
  publication.date_to = params.date_to;
  publication.desc = params.desc;
  publication.assigned_to = params.assigned_to;
  publication.critical = params.critical;
  publication.progress = 0;
  publication.total_qty = params.total_qty;
  publication.meas_unit = params.meas_unit;
  publication.created_at = moment().unix();
  publication.save((err, publicationStored) =>{
    if(err) return res.status(500).send({message: 'error al guardar la publicacion'});
    if(!publicationStored) return res.status(500).send({message: 'la publicacion no ha sido guardada'});
    return res.status(200).send({Task: publicationStored});
  })

}

function getPublications (req, res){
var page = 1;
  if(req.params.page){
    page = req.params.page;
  }
  var itemsPerPage = 4;
    Task.find().sort('-created_at').populate('user', '-password').populate('assigned_to', '-password').paginate(page, itemsPerPage, (err, publications, total) => {
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
  Task.findById(publicationId).populate('user', '-password').populate('assigned_to', '-password').exec(function(err, publication) {
    if(err) return res.status(500).send({message: 'error al devolver publicacion'});
    if(!publication) return res.status(404).send({message: 'no hay publicacion'});
    return res.status(200).send({publication});
  });

  }


function deletePublication (req, res) {
var publicationId = req.params.id;
Task.find({'user': req.user.sub, '_id': publicationId}).remove((err, publicationRemoved) =>  {
  if(err) return res.status(500).send({message: 'error al borrar publicacion'});
  if(!publicationRemoved) return res.status(404).send({message: 'no hay publicacion'});
  return res.status(200).send({publication: publicationRemoved});
});

}
function calculateProgress (req, res) {
console.log('golaaaa q sasasasaddfff');
var publicationId = req.params.id;
var suma = 0;
Report.find({ task: publicationId}, function(err, totalProgress){
   if (err) {
    console.log('hubo un error');
  }
  //return res.status(200).send({publication: totalProgress});
  console.log('total progress: ', totalProgress);

   let sum = underscore
    .reduce(totalProgress, function(memo, reading){

      return memo + reading.progress;

    }, 0);
    console.log('la suma sería: ', sum);
    suma = sum;



// Actualiza la suma de progress en la bd de task

Task.findByIdAndUpdate(publicationId, {
    progress: suma  },
  function (err, progressUpdated) {
  if(err){
    console.log(err)
  }else{
    console.log("Progress Updateddddd: ", progressUpdated);
    return res.status(200).send({publication: progressUpdated});
  }
});
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

    Task.findOne({'user': req.user.sub, '_id': publicationId}).exec((err, publication) => {
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
function editTask(req, res){
  console.log('hola edit task');
  console.log(req.body.name);
  var taskId = req.body._id;
  var update = req.body;
  Task.findByIdAndUpdate(taskId, update, {new:true}, (err, taskUpdated) => {
        if(err) return res.status(500).send({message: 'error en la peticion'});
        if(!taskUpdated) return res.status(404).send({message: 'no se ha podido editar la tarea'});
        return res.status(200).send({task: taskUpdated});
  });

  // borrar propiedad password


  //controlar usuarios duplicados


}



module.exports = {
  probando,
  savePublication,
  getPublications,
  getPublication,
  deletePublication,
  uploadImage,
  getImageFile,
  calculateProgress,
  editTask
}
