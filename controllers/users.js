const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/User')
const Course = require('../models/Course')
const userExtractor = require('../middleware/userExtractor')
const sameUser = require('../middleware/sameUser')

// GET ALL
usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('enrolledCourses', {
    title: 1,
    description: 1,
    creationDate: 1
  }).populate('createdCourses', {
    title: 1,
    description: 1,
    creationDate: 1
  })
  response.json(users)
})

// GET ONE USER
usersRouter.get('/:idUser', async (request, response, next) => {
  const { idUser } = request.params
  try {
    const user = await User.findById(idUser).populate('enrolledCourses', {
      title: 1,
      description: 1,
      creationDate: 1
    }).populate('createdCourses', {
      title: 1,
      description: 1,
      creationDate: 1
    })
    user ? response.json(user) : response.status(404).end()
  } catch (err) {
    next(err)
  }
})

// PATCH USER
usersRouter.patch('/:idUser', userExtractor, sameUser, async (request, response, next) => {
  const { idUser } = request.params
  const userUpdates = request.body

  const newUserInfo = {}

  // Añade aquí los campos que deseas permitir actualizar
  if ('userName' in userUpdates) {
    newUserInfo.userName = userUpdates.userName
  }
  if ('firstName' in userUpdates) {
    newUserInfo.firstName = userUpdates.firstName
  }
  if ('lastName' in userUpdates) {
    newUserInfo.lastName = userUpdates.lastName
  }
  if ('email' in userUpdates) {
    newUserInfo.email = userUpdates.email
  }
  if ('password' in userUpdates) {
    newUserInfo.password = userUpdates.password
  }
  if ('avatar' in userUpdates) {
    newUserInfo.avatar = userUpdates.avatar
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(idUser, newUserInfo, { new: true, runValidators: true, context: 'query' })
    if (updatedUser) {
      response.json(updatedUser)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

// CREATE USER
usersRouter.post('/', async (request, response, next) => {
  const { body } = request
  const { userName, firstName, lastName, email, password } = body

  if (!userName || !firstName || !lastName || !email || !password) {
    return response.status(400).json({ error: 'No todos los datos han sido rellenados' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    userName,
    firstName,
    lastName,
    email,
    avatar: null,
    passwordHash
  })

  try {
    const savedUser = await user.save()
    response.json(savedUser)
  } catch (error) { next(error) }
})

// DELETE USER
usersRouter.delete('/:idUser', userExtractor, sameUser, async (request, response, next) => {
  const { idUser } = request.params

  try {
    const user = await User.findById(idUser).populate('enrolledCourses')

    if (!user) {
      return response.status(404).end()
    }

    for (const course of user.enrolledCourses) {
      course.students = course.students.filter(student => !student.equals(idUser))
      await course.save()
    }

    await Course.deleteMany({ creator: idUser })

    await User.findByIdAndDelete(idUser)

    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

// ENROLL USER IN COURSE
usersRouter.put('/:idUser/enroll/:courseId', userExtractor, sameUser, async (request, response, next) => {
  const { idUser, courseId } = request.params

  try {
    const user = await User.findById(idUser)
    const course = await Course.findById(courseId)

    if (!user || !course) {
      return response.status(404).json({ error: 'User or course not found' })
    }
    if (user.enrolledCourses.includes(courseId)) {
      return response.status(400).json({ error: 'User already enrolled in the course' })
    }
    if (course.creator.equals(idUser)) {
      return response.status(400).json({ error: 'User is creator of course' })
    }

    user.enrolledCourses = user.enrolledCourses.concat(course._id)
    await user.save()

    course.students = course.students.concat(user._id)
    await course.save()

    response.json({
      message: 'User enrolled in the course successfully',
      user,
      course
    })
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter
