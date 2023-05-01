const User = require('../models/User')

const sameUser = async (req, res, next) => {
  const { idUser } = req.params

  const userLogged = await User.findById(req.userId)

  if (!userLogged._id.equals(idUser)) {
    return res.status(403).json({ error: 'Solo el usuario original puede ejecutar esta acción' })
  }

  next()
}

module.exports = sameUser
