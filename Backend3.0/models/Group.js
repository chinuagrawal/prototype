const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  groupCode: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Group', groupSchema);
