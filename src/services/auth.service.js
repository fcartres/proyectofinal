const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// Generar hash de contraseña
exports.hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(password, salt)
}

// Comparar contraseña con hash
exports.comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash)
}

// Generar token JWT
exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  })
}
