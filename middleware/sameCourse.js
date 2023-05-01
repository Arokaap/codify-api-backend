
const Course = require('../models/Course')

const sameCourse = async (req, res, next) => {
  const { courseId } = req.params

  const course = await Course.findById(courseId)

  if (!course) {
    return res.status(404).json({ error: 'Course not found' })
  }

  // Verificar si el usuario autenticado es el creador del curso
  if (!course.creator.equals(req.userId)) {
    return res.status(403).json({ error: 'Solo el creador del curso puede realizar esta acción con la lección' })
  }

  next()
}

module.exports = sameCourse
