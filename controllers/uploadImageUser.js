const Upload = require('../models/Upload')
const cloudinary = require('../lib/cloudinary')
const User = require('../models/User')

exports.uploadImageUser = async (req, res, next) => {
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

    const { idUser } = req.params // id del curso para el cual se subirá la imagen

    const updatedUser = await User.findByIdAndUpdate(
      idUser,
      { avatar: savedUpload.url },
      { new: true, runValidators: true, context: 'query' }
    )

    if (updatedUser) {
      res.status(200).json(updatedUser)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}
