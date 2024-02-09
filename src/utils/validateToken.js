import j from 'jsonwebtoken'
import pool from '../database.js'

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
    
    if (!payload) {
      res.status(200).json({
        message: 'Error'
      })
    }

    req.user = payload
    req.user_id = payload?.id

    return next()

  } catch (error) {
    res.status(200).json({
      message: 'Error'
    })
  }
}
