import pool from '../database.js'
import { Roles } from '../utils/roles.js'

export const verifyRol = (req, res, next) => {
  const userId = req.user_id

  const [user] = pool.query(`SELECT id_rol from usuarios where id=${userId}`)
  
  const userIdFromDatabase = user[0].id_rol

  if (userIdFromDatabase === Roles.ADMIN) {
    return next()
  }

  return res.status(403).json({
    error: true,
    message: 'Unauthoura'
  })
}
