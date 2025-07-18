const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  kycCode: { type: String, required: true },
  groupCode: { type: String, required: true },
  aadharNumber: String,
  panCard: String,
  userName: String
});

module.exports = mongoose.model('KYC', kycSchema);
