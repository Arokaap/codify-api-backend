const router = require('express').Router()
const uploadController = require('../controllers/upload')
const uploadImageController = require('../controllers/uploadImage')
const uploadImageLessonController = require('../controllers/uploadImageLesson')
const uploadImageUserController = require('../controllers/uploadImageUser')

const storage = require('../lib/multer')

router.post('/uploadVideo/:idLesson', storage.single('file'), uploadController.uploadVideo)
router.post('/uploadImageCourse/:idCourse', storage.single('file'), uploadImageController.uploadImage)
router.post('/uploadImageLesson/:idLesson', storage.single('file'), uploadImageLessonController.uploadImageLesson)
router.post('/uploadImageUser/:idUser', storage.single('file'), uploadImageUserController.uploadImageUser)

module.exports = router
