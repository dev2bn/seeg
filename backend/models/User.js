const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  numero_compteur: { type: String, required: true, unique: true },
  adress: { type: String, required: true },
  contact: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);