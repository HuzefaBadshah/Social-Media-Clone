const mongoose = require('mongoose');

const connectDB = mongoose.connect('mongodb+srv://501huzefa:EFUQFPzBHX2KSR8P@cluster0.ztkdsln.mongodb.net/devTinder');

module.exports = { connectDB };