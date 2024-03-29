import e, { Router } from 'express'
import jwt from 'jsonwebtoken'
import pool from '../database.js'
import { verifyToken } from '../utils/validateToken.js';
import { sendEmail } from '../utils/nodemailer.js';
import { verifyRegister } from '../middlewares/verify-register.js';

const router = Router();

router.get('/usuarios', async (req, res) => {
  try {

    const query = `SELECT 
    u.id, 
    u.correo, 
    u.password,
    u.nombres, 
    u.apellidos, 
    u.direccion, 
    u.telefono, 
    u.dni, 
    u.fecha_registro,
    u.usuario_registro,
    u.fecha_actualizacion,
    u.usuario_actualizacion,
    r.nombre as nombre_rol,
    u.estado
  FROM usuarios u
  JOIN roles r ON u.id_rol = r.id_rol;`

    const [usuarios] = await pool.query(query);

    return res.status(200).json({
      data: usuarios
    })
  } catch (err) {
    return res.status(500).json({ message: err })
  }
})

router.get('/login', (req, res) => {
  //res.render('login/login');
});

router.get('/account', verifyToken, async (req, res) => {
  const query = `SELECT 
    u.id, 
    u.correo, 
    u.password,
    u.nombres, 
    u.apellidos, 
    u.direccion, 
    u.telefono, 
    u.dni, 
    u.fecha_registro,
    u.usuario_registro,
    u.fecha_actualizacion,
    u.usuario_actualizacion,
    r.nombre as nombre_rol,
    u.estado
    FROM usuarios u
    JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.id = ?;`

  try {
    const [user] = await pool.query(query, [req.user_id]);
    if (user[0].estado === 'activo') {
      return res.json({ user: user[0] })
    } else {
      return res.status(403).json({ err: 'Unauthorized' })
    }
  } catch (err) {
    return res.json({ message: err })
  }
})

router.post('/register', verifyRegister, async (req, res) => {
  const {
    correo,
    password,
    nombres,
    apellidos,
    direccion,
    telefono,
    dni,
  } = req.body;

  try {
    // Verificar si el correo o el teléfono o dni ya existen en la base de datos wasaaaa :V
    const [existingEmail] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

    if (!correo.includes('@')) {
      return res.status(400).json({ error: true, message: 'El correo debe contener el símbolo "@".' });
    }

    if (existingEmail.length > 0) {
      return res.status(400).json({ error: true, message: 'El correo ya está registrado.' });
    }

    const token = jwt.sign({ correo, password }, 'TOKEN_KEY', {
      expiresIn: 3600
    })

    await sendEmail(correo, `
      <h2>Verifica tu cuenta de PeruScale</h2>
      Gracias por registrarte! Solo cuentas con una hora para verificar tu cuenta  <br /> Para verificar tu cuenta haz click en este link: <br />
      <a href=https://peru-scale.vercel.app/verify?token=${token}>
        Verificar Cuenta
      </a>
    `, 'Confirmación de Cuenta')

    return res.status(200).json({
      token,
      message: 'Correo enviado'
    })

  } catch (err) {
    // Manejar errores especificos, por ejemplo, duplicidad de clave única
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.message.includes('correo')) {
        return res.status(400).json({ error: true, message: 'El correo ya está registrado.' });
      } else if (err.message.includes('telefono')) {
        return res.status(400).json({ error: true, message: 'El teléfono ya está registrado.' });
      } else if (err.message.includes('dni')) {
        return res.status(400).json({ error: true, message: 'El DNI ya está registrado.' });
      }
    }
    console.error(err);
    // Otros errores
    res.status(500).json({ error: true, message: err.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;
    const [user] = await pool.query('SELECT * FROM usuarios WHERE correo = ? AND password = ?', [correo, password]);


    if (user.length) {
      if (user[0]?.estado === 'inactivo') {
        return res.status(403).json({ error: true, message: 'Unauthorized' });
      }

      // Obtener el nombre del rol asociado con el ID del rol del usuario
      const [role] = await pool.query('SELECT nombre FROM roles WHERE id_rol = ?', [user[0].id_rol]);

    
      // Actualizar usuario_registro con el nombre del rol
      await pool.query('UPDATE usuarios SET usuario_registro = ? WHERE id = ?', [role[0].nombre, user[0].id]);

      // acceso exitoso

      const token = jwt.sign({ id: user[0].id }, 'TOKEN_KEY', {
        expiresIn: 2000
      })

      return res.status(201).json({ user: user[0], token });
    } else {
      // Credenciales invalidas
      return res.status(403).json({ error: true, message: 'Failed to log in' });
    }
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});



router.post('/recover', verifyToken, async (req, res) => {
  try {
    const { password } = req.body
    await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [password, req.user_id])

    return res.status(200).json({
      message: 'Password Actualizado Correctamente'
    })
  } catch (_) {
    return res.status(500).json({
      error: true,
      message: 'Ocurrio un error'
    })
  }

})

router.post('/verify-account', verifyToken, async (req, res) => {
  try {
    const { correo, password } = req.user
    const { nombres, apellidos, dni, direccion, telefono } = req.body

    if (!correo.includes('@')) {
      return res.status(400).json({ error: true, message: 'El correo debe contener el símbolo "@".' });
    }

    // Validar que el teléfono tenga exactamente 9 dígitos y sea numérico
    if (!/^\d{9}$/.test(telefono)) {
      return res.status(400).json({ error: true, message: 'El teléfono debe contener exactamente 9 dígitos y ser numérico.' });
    }

    // Validar que el DNI tenga exactamente 8 dígitos y sea numérico
    if (!/^\d{8}$/.test(dni)) {
      return res.status(400).json({ error: true, message: 'El DNI debe contener exactamente 8 dígitos y ser numérico.' });
    }

    const [existingEmail] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    const [existingPhone] = await pool.query('SELECT * FROM usuarios WHERE telefono = ?', [telefono]);
    const [existingDNI] = await pool.query('SELECT * FROM usuarios WHERE dni = ?', [dni]);

    if (existingEmail.length > 0) {
      return res.status(400).json({ error: true, message: 'El correo ya está registrado' });
    }

    if (existingPhone.length > 0) {
      return res.status(400).json({ error: true, message: 'El teléfono ya está registrado.' });
    }

    if (existingDNI.length > 0) {
      return res.status(400).json({ error: true, message: 'El DNI ya está registrado.' });
    }

    const [user] = await pool.query('INSERT INTO usuarios (correo, password, nombres, apellidos, direccion, telefono, dni) VALUES (?, ?, ?, ?, ?, ?, ?)', [correo, password, nombres, apellidos, direccion, telefono, dni]);

    const token = jwt.sign({ id: user.insertId }, 'TOKEN_KEY', {
      expiresIn: 2000
    })

    return res.status(200).json({ message: 'Registro Exitoso', token });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message
    })
  }
})

router.post('/recover-password', async (req, res) => {
  try {
    const { correo } = req.body

    if (!correo) {
      res.status(403).json({
        error: true,
        message: 'Error'
      })
    }

    const email = correo?.trim()

    const [user] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

    if (!user) {
      return res.status(403).json({
        error: true,
        message: 'Error'
      })
    }

    const token = jwt.sign({ id: user[0].id }, 'TOKEN_KEY', {
      expiresIn: 2000
    })

    await sendEmail(email, `
      Para modificar tu contraseña haz click en este link: <br />
      <a href=https://peru-scale.vercel.app/recover?token=${token}>
        Recupera aquí
      </a>
    `)

    return res.status(200).json({
      message: 'Email sent successfully'
    })

  } catch (e) {
    return res.status(404).json({
      error: true,
      message: e.message
    })
  }
})





export default router;