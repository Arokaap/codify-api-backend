const { model, Schema } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new Schema({
  userName: {
    type: String,
    require: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  email: {
    type: String,
    require: true,
    unique: true
  },
  passwordHash: String,
  registrationDate: Date,
  avatar: String,
  enrolledCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

userSchema.plugin(uniqueValidator)

const User = model('User', userSchema)

module.exports = User
