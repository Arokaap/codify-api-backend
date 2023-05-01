const { model, Schema } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const categorySchema = new Schema({
  title: String,
  description: String,
  icon: String,
  courses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }]
})

categorySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

categorySchema.plugin(uniqueValidator)

const Category = model('Category', categorySchema)

module.exports = Category
