const categoriesRouter = require('express').Router()
const userExtractor = require('../middleware/userExtractor')
const Category = require('../models/Category')

// GET ALL
categoriesRouter.get('/', async (request, response) => {
  const categories = await Category.find({}).populate('courses', {
    title: 1,
    description: 1,
    icon: 1
  })
  response.json(categories)
})

// GET ONE COURSE
categoriesRouter.get('/:idCategory', async (request, response, next) => {
  const { idCategory } = request.params
  try {
    const category = await Category.findById(idCategory)
    category ? response.json(category) : response.status(404).end()
  } catch (err) {
    next(err)
  }
})

// CREATE CATEGORY
categoriesRouter.post('/', async (request, response, next) => {
  const { body } = request
  const { title, description, icon } = body

  const category = new Category({
    title,
    description,
    icon
  })

  try {
    const savedCategory = await category.save()
    response.json(savedCategory)
  } catch (error) { next(error) }
})

// PATCH CATEGORY
categoriesRouter.patch('/:idCategory', userExtractor, async (request, response, next) => {
  const { idCategory } = request.params
  const categoryUpdates = request.body

  const newCategoryInfo = {}

  if ('title' in categoryUpdates) {
    newCategoryInfo.title = categoryUpdates.title
  }
  if ('description' in categoryUpdates) {
    newCategoryInfo.description = categoryUpdates.description
  }
  if ('icon' in categoryUpdates) {
    newCategoryInfo.icon = categoryUpdates.icon
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(idCategory, newCategoryInfo, { new: true, runValidators: true, context: 'query' })
    if (updatedCategory) {
      response.json(updatedCategory)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

// DELETE CATEGORY
categoriesRouter.delete('/:idCategory', userExtractor, async (request, response, next) => {
  const { idCategory } = request.params

  const res = await Category.findByIdAndDelete(idCategory)
  if (res === null) return response.sendStatus(404)

  response.status(204).end()
})

module.exports = categoriesRouter
