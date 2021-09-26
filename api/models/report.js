'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ReportSchema = Schema({

  task: { type: Schema.ObjectId, ref: 'Task'},
  user: { type: Schema.ObjectId, ref: 'User'},
  created_at: String,
  workdate: String,
  progress: Number,
  crew: [{ type: Schema.ObjectId, ref: 'User'}],
//  rating: Number,
  file: Array,
  remarks: String,
  // nextday_task: { type: Schema.ObjectId, ref: 'Task'}
});

module.exports = mongoose.model('Report', ReportSchema);
