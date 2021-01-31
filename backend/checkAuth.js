const jwt = require('jsonwebtoken')

function checkAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  jwt.verify(token, process.env.ASSCESS_TOKEN_SECRET, (err, user) => {
    if (!user) res.status(401)
    req.user = user
    next()
  })
}

module.exports = checkAuth
