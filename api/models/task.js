'use strict'
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TaskSchema = Schema({
  name: String,
  user: { type: Schema.ObjectId, ref: 'User' },
  created_at: String,
  date_from: Date,
  date_to: Date,
  desc: String,
  assigned_to: { type: Schema.ObjectId, ref: 'User' },
  critical: Boolean,
  progress: Number,
  total_qty: Number,
  meas_unit: String,
//  last_edt: String
});

module.exports = mongoose.model('Task', TaskSchema);
