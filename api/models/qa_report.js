'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var QAReportSchema = Schema({
  task: String,
//  task: { type: Schema.ObjectId, ref: 'Task' },
  user: { type: Schema.ObjectId, ref: 'User'},
  created_at: String,
  number: Number,
  file: Array,
  remarks: String,
  progress: String,
  // nextday_task: { type: Schema.ObjectId, ref: 'Task' }
});

module.exports = mongoose.model('QAReport', QAReportSchema);
