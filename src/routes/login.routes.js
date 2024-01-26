import { Router } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../database.js'
import { verifyToken } from '../utils/validateToken.js';

const router = Router();

router.get('/login', (req, res) => {
  //res.render('login/login');
});


router.get('/account', verifyToken, async (req, res) => {
  try {
    console.log(req.user_id)
    const [user] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [req.user_id]);
    return res.json({ user: user[0] }) 
  } catch (err) {
    return res.json({ message: err }) 
  }
})

router.post('/register', async (req, res) => {
  const {
    correo,
    password,
    nombres,
    apellidos,
    direccion,
    telefono,
    dni
  } = req.body;

  try {
    const [existingUser] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe.' });
    }
        
    const user = await pool
      .query('INSERT INTO usuarios (correo, password, nombres, apellidos, direccion, telefono, dni) VALUES (?, ?, ?, ?, ?, ?, ?)', [correo, password, nombres, apellidos, direccion, telefono, dni]);

    console.log(user)
    
    const token = jwt.sign({ id: user[0].insertId }, 'TOKEN_KEY', {
      expiresIn: 2000
    })

    res.
      status(201)
      .json({ user: user[0].insertId, message: 'Usuario registrado exitosamente.', token })

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;
    const [user] = await pool.query('SELECT * FROM usuarios WHERE correo = ? AND password = ?', [correo, password]);

    console.log(user)
    
    const token = jwt.sign({ id: user[0].id }, 'TOKEN_KEY', {
      expiresIn: 2000
    })

    if (user.length) {
      // acceso exitoso
      return res.status(201).json({ user: user[0], token });
    } else {
      // Credenciales invalidas
      return res.status(403).json({ message: 'Failed to log in' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;