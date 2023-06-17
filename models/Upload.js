const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UploadSchema = new Schema({
  name: String,
  url: String,
  cloudinary_id: String,
  description: String
})

const Upload = mongoose.model('upload', UploadSchema)
module.exports = Upload
