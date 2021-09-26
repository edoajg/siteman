'use strict'
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
var underscore = require('underscore-node');
var Report = require('../models/report');
var User = require('../models/user');
var Task = require('../models/task');


function probando(req, res){
  res.status(200).send({
    message: "Hola desde el controlador de publicaciones"});
}

function savePublication(req, res){
  var params = req.body;
  console.log(params);

//  if(!params.text) return res.status(200).send({message: 'debes enviar un texto'});

  var publication = new Report();
  publication.task = params.task;
  publication.file = 'null'
  publication.user = req.user.sub;
  publication.progress = params.progress;
  publication.crew = params.crew;
  publication.workdate = params.workdate;
//  publication.rating = params.rating;
  publication.nextday_task = params.task;
  publication.remarks = params.remarks;
  publication.created_at = moment().unix();
  var taskId = publication.task;
  publication.save((err, publicationStored) =>{
    if(err) return res.status(500).send({message: 'error al guardar la publicacionnnnn'});
    if(!publicationStored) return res.status(500).send({message: 'la publicacion no ha sido guardada'});
  var publicationId = publication.task;
  var suma = 0
    // Script que obtiene y suma los progresos de los reportes con underscore
    Report.find({ task: publicationId }, function(err, totalProgress){
       if (err) {
        console.log('hubo un error');
       }
       console.log(totalProgress);

       let sum = underscore
        .reduce(totalProgress, function(memo, reading){
          return memo + reading.progress;
        }, 0);
        console.log('esta es la suma: ',  sum);
        suma = sum;
    // Actualiza la suma de progress en la bd de task



    Task.findByIdAndUpdate(publicationId, {
      progress: suma
    }, function (err, progressUpdated) {
      if(err){
        console.log(err)
      }else{
        console.log("Progress Updated: ", progressUpdated);
      }
    });

    // Explaination:
    // reduce() accepts an array and a callback function.
    // So, we are passing the array in "results"
    // In the callback function, do not touch "memo" variable
    // Every single object in "results" array will be passed
    // to callback function in the "reading" variable

    });


    return res.status(200).send({publication: publicationStored});


  });

}



function getPublications (req, res){
var page = 1;
  if(req.params.page){
    page = req.params.page;
  }
  var itemsPerPage = 4;
    Report.find().sort('-created_at').populate('user', '-password').populate('crew', '-password').populate('task').populate('nextday_task').paginate(page, itemsPerPage, (err, publications, total) => {
      if(err) return res.status(500).send({message: 'error al devolver publicaciones'});
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
function getReportsForTask (req, res){
console.log('hey');
var page = 1;
var itemsPerPage = 4;
    Report.find({ task: req.params.task })
     .sort('-created_at').populate('user', '-password').populate('crew', '-password').populate('task')
     .paginate(page, itemsPerPage, (err, reports, total) => {
      if(err) return res.status(500).send({message: 'error al devolver publicaciones'});
      if(!reports) return res.status(404).send({message: 'no hay publicaciones'});
      return res.status(200).send({
        total_items: total,
        pages: Math.ceil(total/itemsPerPage),
        page: page,
        items_per_page: itemsPerPage,
        reports
      });
    });


}
function getPublication (req, res){
  var publicationId = req.params.id;
  Report.findById(publicationId, (err, publication) =>  {
    if(err) return res.status(500).send({message: 'error al devolver publicacion'});
    if(!publication) return res.status(404).send({message: 'no hay publicacion'});
    return res.status(200).send({publication});
  }).populate('task').populate('user').populate('nextday_task');
}


function deletePublication (req, res) {
var publicationId = req.params.id;
console.log(publicationId);
Report.find({'user': req.user.sub, '_id': publicationId}).deleteOne((err, publicationRemoved) =>  {
  if(err) return res.status(500).send({message: 'error al borrar publicacion'});
  if(!publicationRemoved) return res.status(404).send({message: 'no hay publicacion'});
  return res.status(200).send({publication: publicationRemoved});
});

// // Script que obtiene y suma los progresos de los reportes con underscore
// Report.find({ task: publicationId }, function(err, totalProgress){
//    if (err) {
//     console.log('hubo un error');
//    }
//    console.log(totalProgress);
//
//    let sum = underscore
//     .reduce(totalProgress, function(memo, reading){
//       return memo + reading.progress;
//     }, 0);
//     console.log('la suma sería: ', sum);

// // Actualiza la suma de progress en la bd de task
//
//
//
// Task.findByIdAndUpdate(publicationId, {
//   progress: sum
// }, function (err, progressUpdated) {
//   if(err){
//     console.log(err)
//   }else{
//     console.log("Progress Updated: ", progressUpdated);
//   }
// });

// Explaination:
// reduce() accepts an array and a callback function.
// So, we are passing the array in "results"
// In the callback function, do not touch "memo" variable
// Every single object in "results" array will be passed
// to callback function in the "reading" variable

//});


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

      Report.findOne({'user': req.user.sub, '_id': publicationId}).exec((err, publication) => {
        if(publication){
          //actualizar el documento de la publicacion
                Report.findByIdAndUpdate(publicationId, {file: file_name}, {new: true}, (err, publicationUpdated) => {
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
  //    return res.status(404).send({message: 'no se han subido archivos'});
    }}


function removeFiles (res, file_path, message){
      fs.unlink(file_path, (err) =>{
        return res.status(404).send({message: message})
      })
      }

function getImageFile(req, res){
    var image_file = req.params.imageFile;
    var path_file = 'uploads/publications/'+image_file;
    fs.exists(path_file, (exists) => {
      if(exists){
        res.sendFile(path.resolve(path_file));
      }else{
        res.status(200).send({message: 'no existe la imagen'});
      }
    });
}

function getReportCounter (req, res) {
    var task_id = req.params.task;
    reportCount(task_id).then((value) => {
        return res.status(200).send(value);
      });
    }

async function reportCount(task_id){
  try{
  var reports = await Report.countDocuments ({"task": task_id}).exec().then(count => {
  //  if(err) return handleError(err);
    return count;
  })
  .catch((err) =>{
    // return handleError(err);
  });

return {
  reports: reports
}
}catch(e){console.log(e);}}

module.exports = {
  probando,
  savePublication,
  getPublications,
  getPublication,
  deletePublication,
  uploadImage,
  getImageFile,
  getReportCounter,
  getReportsForTask
}
