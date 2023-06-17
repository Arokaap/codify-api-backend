const coursesRouter = require('express').Router()
const sameCreator = require('../middleware/sameCreator')
const userExtractor = require('../middleware/userExtractor')
const Category = require('../models/Category')
const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const User = require('../models/User')

// GET ALL COURSES
coursesRouter.get('/', async (request, response) => {
  const courses = await Course.find({}).populate('creator', {
    userName: 1,
    firstName: 1
  }).populate('students', {
    userName: 1,
    firstName: 1
  }).populate('lessons', {
    title: 1,
    description: 1,
    url: 1
  })
  response.json(courses)
})

// GET ONE COURSE
coursesRouter.get('/:idCourse', async (request, response, next) => {
  const { idCourse } = request.params
  try {
    const course = await Course.findById(idCourse)
      .populate('creator', { userName: 1, firstName: 1 })
      .populate('students', { userName: 1, firstName: 1, avatar: 1 })
      .populate('lessons', { title: 1, description: 1, url: 1 })

    if (course) {
      response.json(course)
    } else {
      response.status(404).end()
    }
  } catch (err) {
    next(err)
  }
})

// PATCH COURSE
coursesRouter.patch('/:idCourse', userExtractor, sameCreator, async (request, response, next) => {
  const { idCourse } = request.params
  const courseUpdates = request.body

  const newCourseInfo = {}

  if ('title' in courseUpdates) {
    newCourseInfo.title = courseUpdates.title
  }
  if ('description' in courseUpdates) {
    newCourseInfo.description = courseUpdates.description
  }
  if ('categoryId' in courseUpdates) {
    newCourseInfo.category = courseUpdates.categoryId
  }

  try {
    const updatedCourse = await Course.findByIdAndUpdate(idCourse, newCourseInfo, { new: true, runValidators: true, context: 'query' })
    if (updatedCourse) {
      response.json(updatedCourse)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

// CREATE COURSE
coursesRouter.post('/', userExtractor, async (request, response, next) => {
  const { body } = request
  const { title, description, categoryId, image } = body

  const creator = await User.findById(request.userId)
  const category = await Category.findById(categoryId)

  const course = new Course({
    title,
    description,
    creationDate: new Date(),
    image,
    category: category._id,
    creator: creator._id
  })

  try {
    const savedCourse = await course.save()
    response.json(savedCourse)

    category.courses = category.courses.concat(savedCourse._id)
    await category.save()

    creator.createdCourses = creator.createdCourses.concat(savedCourse._id)
    await creator.save()
  } catch (error) { next(error) }
})

// DELETE COURSE
coursesRouter.delete('/:idCourse', userExtractor, sameCreator, async (request, response, next) => {
  const { idCourse } = request.params

  const course = await Course.findById(idCourse).populate('students')

  if (!course) {
    return response.status(404).end()
  }

  const lessons = await Lesson.find({ course: idCourse })

  console.log(lessons)
  for (const lesson of lessons) {
    await Lesson.findByIdAndDelete(lesson._id)
  }

  for (const user of course.students) {
    user.enrolledCourses = user.enrolledCourses.filter(course => !course.equals(idCourse))
    user.createdCourses = user.createdCourses.filter(course => !course.equals(idCourse))
    await user.save()
  }

  const res = await Course.findByIdAndDelete(idCourse)
  if (res === null) return response.sendStatus(404)

  response.status(204).end()
})

module.exports = coursesRouter
