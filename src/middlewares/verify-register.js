import pool from '../database.js';

export async function verifyRegister(req, res, next) {
  try {
    const { correo } = req.body

    const [existingEmail] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

    if (existingEmail.length) {
      return res.status(403).json({
        error: true,
        message: 'Ya existe una cuenta con ese correo'
      })
    }
        
    return next()

  } catch (error) {
    res.status(200).json({
      error: true,
      message: error.message
    })
  }
}