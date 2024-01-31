import j from 'jsonwebtoken'

export async function verifyToken(req, res, next) {
  try {

    const authorization = req.headers.authorization

    if (!authorization) {
      res.status(200).json({
        message: 'Error'
      })
    }

    const token = authorization
    const payload = j.verify(token, 'TOKEN_KEY')
    console.log(payload)
    
    if (!payload) {
      res.status(200).json({
        message: 'Error'
      })
    }

    req.user_id = payload.id

    return next()

  } catch (error) {
    res.status(200).json({
      message: 'Error'
    })
  }
}