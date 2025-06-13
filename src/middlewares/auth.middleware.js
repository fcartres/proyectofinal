const jwt = require("jsonwebtoken")

// Middleware para verificar token JWT
exports.verifyToken = (req, res, next) => {
  console.log("JWT_SECRET utilizado para verificación:", process.env.JWT_SECRET);
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" })
  }
}

// Middleware para verificar rol de conductor
exports.isConductor = (req, res, next) => {
  if (!req.user || req.user.tipoUsuario !== "conductor") {
    return res.status(403).json({ error: "Acceso denegado. Se requiere rol de conductor" })
  }
  next()
}

// Middleware para verificar rol de padre
exports.isPadre = (req, res, next) => {
  if (!req.user || req.user.tipoUsuario !== "padre") {
    return res.status(403).json({ error: "Acceso denegado. Se requiere rol de padre" })
  }
  next()
}
