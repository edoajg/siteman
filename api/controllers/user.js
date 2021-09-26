'use strict'
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');
var Report = require('../models/report')


//METODOS HOME Y PRUEBA
function pruebas (req, res){
  res.status(200).send({
    message: 'acción de pruebas en el servidor nodejs'
  });
}
function home (req, res){
  res.status(200).send({
    message: 'ola mundo'
  });
}
//METODO REGISTRO
function saveUser(req, res){
var params = req.body;
var user = new User();
if(params.name && params.surname &&
    params.nick && params.email && params.password){

      user.name = params.name;
      user.surname = params.surname;
      user.nick = params.nick;
      user.email = params.email;
      user.role = 'ROLE_USER';
      user.image = null;
//controlar usuarios duplicados
      User.find({ $or: [
                          {email: user.email.toLowerCase()},
                          {nick: user.nick.toLowerCase()}
                        ]}).exec((err, users) => {
                          if(err) return res.status(500).send({message: 'Error en la peticion de usuarios'});
                          if(users && users.length >= 1) {
                            return res.status(200).send({message: 'El usuario ya existe'});
                          }else{

                            // cifra y guarda los datos
                            bcrypt.hash(params.password, null, null, (err, hash) => {
                              user.password = hash;
                              user.save((err, userStored) => {
                                if(err) return res.status(500).send({message: 'Error al guardar el usuario'});
                                if(userStored){
                                  res.status(200).send({user: userStored});
                                }else{
                                  res.status(404).send({message: 'No se ha registrado el usuario'});
                                }
                            });
                          });

                          }
                        });


    }else{
      res.status(200).send({
        message: 'Envia todos los campos necesarios!'
      });
    }

}
//METODO LOGIN
function loginUser(req, res){
    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({email: email}, (err, user) => {
      if(err) return res.status(500).send({message: 'Error en la petición'});
      console.log(user);
      if(user){
        bcrypt.compare(password, user.password, (err, check) => {
          if(check){
            //devolver datos de usuarios
            if(params.gettoken){
                    //generar y devolver token
                    console.log(params.gettoken);
                    return res.status(200).send({
                      token: jwt.createToken(user)
                    });
            }else{
                  //devolver datos de usuario

            }
            user.password = undefined;
            return res.status(200).send({user})
          }else{
            return res.status(404).send({message: 'El usuario no se ha podido identificar'});
          }
        });
      }else{
        return res.status(404).send({message: 'El usuario no se ha podido identificar!'});
      }
    });
}

//METODO Q DEVUELVE LOS DATOS DEL USUARIO
const getUser = (req, res) => {
   let userId = req.params.id;
   //cuando llega dato por url se usa params, cuando llega por post o put se usa body
   User.findById(userId, (err, user) => {
     if(err) return res.status(500).send({message: 'error en la peticion'});
     if(!user) return res.status(404).send({message: 'usuario no existe'});
     return res.status(200).send({user});

    // followThisUser(req.user.sub, userId).then((value) => {
    //   user.password = undefined;
    //   return res.status(200).send({user,
    //     following: value.following,
    //     followed: value.followed});
    //  })
   });
}

// identity_user_id es el user logeado con el token, user_id es el que llega por la url


 // async function followThisUser(identity_user_id, user_id) {
 //    var following = await Follow.findOne({"user": identity_user_id, "followed": user_id})
 //    .exec()
 //    .then((follow) => {return follow;})
 //    .catch((err) => {return handleError(err)});
 //
 //
 //    var followed = await Follow.findOne({"user": user_id, "followed": identity_user_id})
 //    .exec()
 //    .then((follow) => {console.log(follow); return follow;})
 //    .catch((err) => {return handleError(err)});
 //
 //    return {following: following, followed: followed}
 //    }


// DEVOLVER LISTADO DE USUARIOS PAGINADOS

function getUsers(req, res){
  let identity_user_id = null;
  if(req.user){
  identity_user_id = req.user.sub };
  var page = 1;
  if (req.params.page){
    page = req.params.page
  }
  var itemsPerPage = 5;


// modelo User metodo find para sacar todo lo de la bd


  User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
      if(err) return res.status(500).send({message: 'error en la peticion'});
      if(!users) return res.status(404).send({message: 'usuarios no existen'});
  //    console.log(users);
      if(identity_user_id != null){
        return res.status(200).send({
          users,
          total,
          pages: Math.ceil(total/itemsPerPage)
      });
    }else{
      return res.status(200).send({
        users,
        total,
        pages: Math.ceil(total/itemsPerPage)
      });
    }


  });
   };

function getUsersAll(req, res){
     let identity_user_id = null;
     if(req.user){
     identity_user_id = req.user.sub };

   // modelo User metodo find para sacar todo lo de la bd


     User.find().sort('_id').find(function (err, users) {
         if(err) return res.status(500).send({message: 'error en la peticion'});
         if(!users) return res.status(404).send({message: 'usuarios no existen'});
        console.log('users');
         if(identity_user_id != null){
           return res.status(200).send({
             users,
         });
       }else{
         return res.status(200).send({
           users,
         });
       }


     });
      };



//EDICION DE DATOS DE USUARIOS

// async function followUserIds(user_id) {
//   var following = await Follow.find({"user": user_id}).select({'_id':0,'__v':0, 'user':0}).exec().then((follows)=> {
//     var follows_clean = [];
//     follows.forEach ((follow) => {
//       follows_clean.push(follow.followed);
//     });
//     console.log(follows_clean);
//     return follows_clean;
//   });
//   var followed = await Follow.find({"followed": user_id}).select({'_id':0,'__v':0, 'followed':0}).exec().then((follows) => {
//     var follows_clean = [];
//     follows.forEach ((follow) => {
//       follows_clean.push(follow.user);
//     });
//     return follows_clean;
//   }).catch((err) => {
//     return handleError(err);
//   });
//
//   return {
//     following: following,
//     followed: followed,
//   }
// }


//contador de seguidores y estadisticas

// function getCounters (req, res) {
//     var userId = req.user.sub;
//     if(req.params.id){
//         userId = req.params.id }
//       getCountFollow(userId).then((value) => {
//         return res.status(200).send(value);
//       });
//     }


// async function getCountFollow(user_id){
//   try{
//   var following = await Follow.countDocuments ({"user": user_id}).exec().then(count => {
//   //  if(err) return handleError(err);
//     return count;
//   })
//   .catch((err) =>{
//     return handleError(err);
//   });
//   var followed = await Follow.countDocuments({"followed": user_id}).exec().then(count => {
//   // if(err) return handleError(err);
//   return count;
// })
// .catch((err) => {
//   return handleError(err);
// });
// var publications = await Publication.countDocuments({'user': user_id}).exec().then(count => {
//   return count;
// }).catch((err) => {
//   return handleError (err);
// });
//
// return {
//   following: following,
//   followed: followed,
//   publications: publications
// }
// }catch(e){console.log(e);}}

function updateUser(req, res){
  var userId = req.params.id;
  var update = req.body;

  // borrar propiedad password

  delete update.password;
  if(userId != req.user.sub){
    return res.status(500).send({message: 'No tienes permiso para actualizar los datos del usuario'});
  }
  //controlar usuarios duplicados
        User.find({ $or: [
                            {email: update.email.toLowerCase()},
                            {nick: update.nick.toLowerCase()}
                          ]}).exec((err, users) => {
                            var user_isset = false;
                            users.forEach((user) => {
                              if(user && user._id != userId) user_isset = true;});

                            if(user_isset) return res.status(404).send({message: 'los datos ya están en uso'});

                            User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => {
                                  if(err) return res.status(500).send({message: 'error en la peticion'});
                                  if(!userUpdated) return res.status(404).send({message: 'no se ha podido actualizar el usuario'});
                                  return res.status(200).send({user: userUpdated});
                            });
                          })

}


//subir archivos de imagen/avatar de usuarios

function uploadImage(req, res){
    var userId = req.params.id;
    if(req.file){
      var file_path = req.file.path;
      console.log(file_path);
      var file_split = file_path.split('/');
      console.log(file_split);
      var file_name = file_split[2];
      var ext_split = file_name.split('.');
      var file_ext = ext_split[1];
      console.log(file_ext);

    if(userId != req.user.sub){
      return removeFiles(res, file_path, 'ID de usuario no valida')
    }
    if(file_ext == 'jpeg' || file_ext == 'jpg' || file_ext == 'gif'){
      User.findByIdAndUpdate(userId, {image: file_name}, {new: true}, (err, userUpdate) => {
        if(err) return res.status(500).send ({message: 'error en la peticion'});
        if(!userUpdate) return res.status(404).send ({message: 'no se ha podido actualizar'});
        return res.status(200).send({user: userUpdate});
      })
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
    var path_file = 'uploads/users/'+image_file;
    fs.exists(path_file, (exists) => {
      if(exists){
        res.sendFile(path.resolve(path_file));
      }else{
        res.status(200).send({message: 'no existe la imagen'});
      }
    });
}


module.exports = {
  home,
  pruebas,
  saveUser,
  loginUser,
  getUser,
  getUsers,
  getUsersAll,
//  getCounters,
  updateUser,
  uploadImage,
  getImageFile
}
