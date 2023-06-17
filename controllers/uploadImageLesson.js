const Upload = require('../models/Upload')
const cloudinary = require('../lib/cloudinary')
const Lesson = require('../models/Lesson')

exports.uploadImageLesson = async (req, res, next) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path,
      {
        resource_type: 'image',
        folder: 'images'
      }
    )

    const upload = new Upload({
      name: req.file.originalname,
      url: result.url,
      cloudinary_id: result.public_id,
      description: req.body.description
    })

    const savedUpload = await upload.save()

    const { idLesson } = req.params // id del curso para el cual se subirá la imagen

    const updatedLesson = await Lesson.findByIdAndUpdate(
      idLesson,
      { image: savedUpload.url },
      { new: true, runValidators: true, context: 'query' }
    )

    if (updatedLesson) {
      res.status(200).json(updatedLesson)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}
