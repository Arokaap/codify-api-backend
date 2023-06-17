const lessonsRouter = require('express').Router()
const sameCreator = require('../middleware/sameCreator')
const userExtractor = require('../middleware/userExtractor')
const Course = require('../models/Course')
const Lesson = require('../models/Lesson')

// GET ALL LESSONS
lessonsRouter.get('/', async (request, response) => {
  const lessons = await Lesson.find({}).populate('course', {
    title: 1,
    description: 1,
    creationDate: 1
  })
  response.json(lessons)
})

// GET ONE COURSE
lessonsRouter.get('/:idLesson', async (request, response, next) => {
  const { idLesson } = request.params
  try {
    const lesson = await Lesson.findById(idLesson)
    lesson ? response.json(lesson) : response.status(404).end()
  } catch (err) {
    next(err)
  }
})

// CREATE LESSON
lessonsRouter.post('/:idCourse', userExtractor, sameCreator, async (request, response, next) => {
  const { body } = request
  const { title, description, url, image } = body
  const { idCourse } = request.params

  try {
    const course = await Course.findById(idCourse)

    const lesson = new Lesson({
      title,
      description,
      url,
      image,
      creationDate: new Date(),
      course: course._id
    })

    const savedLesson = await lesson.save()

    course.lessons = course.lessons.concat(savedLesson._id)
    await course.save()

    response.json(savedLesson)
  } catch (error) {
    next(error)
  }
})

// PATCH LESSON
lessonsRouter.patch('/:idCourse/update/:idLesson', userExtractor, sameCreator, async (request, response, next) => {
  const { idLesson } = request.params
  const lessonUpdates = request.body

  const newLessonInfo = {}

  if ('title' in lessonUpdates) {
    newLessonInfo.title = lessonUpdates.title
  }
  if ('description' in lessonUpdates) {
    newLessonInfo.description = lessonUpdates.description
  }
  if ('url' in lessonUpdates) {
    newLessonInfo.url = lessonUpdates.url
  }

  if ('image' in lessonUpdates) {
    newLessonInfo.image = lessonUpdates.image
  }

  try {
    const updatedLesson = await Lesson.findByIdAndUpdate(idLesson, newLessonInfo, { new: true, runValidators: true, context: 'query' })
    if (updatedLesson) {
      response.json(updatedLesson)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

// DELETE LESSON
lessonsRouter.delete('/:idCourse/delete/:idLesson', userExtractor, sameCreator, async (request, response, next) => {
  const { idCourse, idLesson } = request.params

  // Encuentra el curso al que pertenece la lección
  const course = await Course.findById(idCourse)

  if (!course) {
    return response.status(404).json({ error: 'Course not found' })
  }

  // Elimina la referencia a la lección en el arreglo de lecciones del curso
  course.lessons = course.lessons.filter(lesson => !lesson.equals(idLesson))

  // Guarda el curso actualizado
  await course.save()

  // Elimina la lección
  const res = await Lesson.findByIdAndDelete(idLesson)
  if (res === null) return response.sendStatus(404)

  response.status(204).end()
})

module.exports = lessonsRouter
