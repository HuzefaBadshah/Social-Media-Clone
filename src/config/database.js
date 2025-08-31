const mongoose = require('mongoose');

const connectDB = mongoose.connect('mongodb+srv://501huzefa:9J3dYwaBaFCfKB6d@cluster0.ztkdsln.mongodb.net/devTinder');

module.exports = { connectDB };