const Course = require('../models/Course')
const User = require('../models/User')

const sameCreator = async (req, res, next) => {
  const { idCourse } = req.params
  const { userId } = req

  const course = await Course.findById(idCourse)
  const user = await User.findById(userId)
  console.log(course)

  if (!user._id.equals(course.creator)) {
    return res.status(403).json({ error: 'Solo el usuario creador del curso puede ejecutar esta acción' })
  }

  next()
}

module.exports = sameCreator
