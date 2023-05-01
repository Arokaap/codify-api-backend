const { model, Schema } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const courseSchema = new Schema({
  title: String,
  description: String,
  creationDate: Date,
  category: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Category'
  },
  creator: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  lessons: [{
    type: Schema.Types.ObjectId,
    ref: 'Lesson'
  }]
})

courseSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

courseSchema.plugin(uniqueValidator)

const Course = model('Course', courseSchema)

module.exports = Course
