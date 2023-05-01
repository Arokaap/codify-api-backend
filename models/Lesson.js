const { model, Schema } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const lessonSchema = new Schema({
  title: String,
  description: String,
  course: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Course'
  },
  url: String
})

lessonSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

lessonSchema.plugin(uniqueValidator)

const Lesson = model('Lesson', lessonSchema)

module.exports = Lesson
