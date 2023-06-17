const Upload = require('../models/Upload')
const cloudinary = require('../lib/cloudinary')
const Lesson = require('../models/Lesson')

exports.uploadVideo = async (req, res, next) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path,
      {
        resource_type: 'video',
        folder: 'video'
      }
    )

    const upload = new Upload({
      name: req.file.originalname,
      url: result.url,
      cloudinary_id: result.public_id,
      description: req.body.description
    })

    const savedUpload = await upload.save()

    const { idLesson } = req.params // o puede ser un valor en `req.body` u otra fuente, según cómo esté configurado tu ruta

    const updatedLesson = await Lesson.findByIdAndUpdate(
      idLesson,
      { url: savedUpload.url }, // asumiendo que el modelo de lección tiene un campo `url` que almacena la URL del video
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
