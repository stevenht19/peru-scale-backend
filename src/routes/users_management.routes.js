import { Router } from "express";
import pool from '../database.js'

const router = Router();

//Ruta para obtener los usuario ----------------------


router.get('/roles', async (_req, res) => {
  try {
    const [roles] = await pool.query(`SELECT * FROM roles`)
    return res.status(200).json(roles)
  } catch (error) {
    return res.status(500).json({ message: err });
  }
})

router.get('/admin_usuarios', async (req, res) => {
  try {
    const [usuarios] = await pool.query(`
            SELECT u.id, u.correo, u.nombres, u.apellidos, CONCAT(u.nombres," ",u.apellidos) nombre_completo, 
                   u.direccion, u.telefono, u.dni, u.fecha_registro, u.usuario_registro, 
                   u.fecha_actualizacion, u.usuario_actualizacion, u.id_rol, r.nombre as nombre_rol, 
                   u.estado 
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
        `);

    return res.status(200).json({
      data: usuarios
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});


// Ruta para actualizar un usuario------------------------
router.put('/admin_usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { correo, nombres, apellidos, password, direccion, telefono, dni, id_rol, estado, usuario_actualizacion } = req.body;

  try {
    // Verificar si el correo electrónico existe en la base de datos
    const [existingEmail] = await pool.query(`
            SELECT id FROM usuarios WHERE correo = ? AND id != ?
        `, [correo, id]);

    // Si el correo electrónico existe y pertenece a otro usuario, devuelve un mensaje de error
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: true, message: 'El correo electrónico ya está en uso por otro usuario' });
    }
    // Verificar si el DNI tiene exactamente 8 dígitos
    if (dni.toString().length !== 8 || !(/^\d{8}$/.test(dni))) {
      return res.status(400).json({ error: true, message: 'El DNI debe tener exactamente 8 dígitos numéricos' });
    }


    // Verificar si el DNI existe en la base de datos
    const [existingDNI] = await pool.query(`
            SELECT id FROM usuarios WHERE dni = ? AND id != ?
        `, [dni, id]);

    // Si el DNI existe y pertenece a otro usuario, devuelve un mensaje de error
    if (existingDNI.length > 0) {
      return res.status(400).json({ error: true, message: 'El DNI ya está en uso por otro usuario' });
    }

    // Verificar si el teléfono tiene exactamente 9 dígitos
    if (telefono.toString().length !== 9 || !(/^9\d{8}$/.test(telefono))) {
      return res.status(400).json({ error: true, message: 'El teléfono debe tener exactamente 9 dígitos numéricos' });
    }

    // Verificar si el teléfono existe en la base de datos
    const [existingPhone] = await pool.query(`
            SELECT id FROM usuarios WHERE telefono = ? AND id != ?
        `, [telefono, id]);

    // Si el teléfono existe y pertenece a otro usuario, devuelve un mensaje de error
    if (existingPhone.length > 0) {
      return res.status(400).json({ error: true, message: 'El teléfono ya está en uso por otro usuario' });
    }

    // Actualizar el usuario 
    await pool.query(`
            UPDATE usuarios
            SET correo = ?, nombres = ?, apellidos = ?, direccion = ?, telefono = ?, dni = ?, id_rol = ?, estado = ?, usuario_actualizacion = ?
            WHERE id = ?
        `, [correo, nombres, apellidos, direccion, telefono, dni, id_rol, estado, usuario_actualizacion, id]);

    return res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, message: err });
  }
});



// Ruta para agregar un nuevo usuario-------------------------
router.post('/admin_usuarios', async (req, res) => {
  const { correo, nombres, apellidos, direccion, password, telefono, dni, id_rol, usuario_registro } = req.body;

  try {
    // Verificar si el correo electrónico existe en la base de datos
    const [existingEmail] = await pool.query(`
            SELECT id FROM usuarios WHERE correo = ?
        `, [correo]);

    // Si el correo electrónico ya está en uso, devuelve un mensaje de error
    if (existingEmail.length > 0) {
      return res.status(400).json({  error: true, message: 'El correo electrónico ya está en uso por otro usuario' });
    }

    // Verificar si el DNI tiene exactamente 8 dígitos
    if (dni.toString().length !== 8 || !(/^\d{8}$/.test(dni))) {
      return res.status(400).json({  error: true, message: 'El DNI debe tener exactamente 8 dígitos numéricos' });
    }

    // Verificar si el DNI existe en la base de datos
    const [existingDNI] = await pool.query(`
            SELECT id FROM usuarios WHERE dni = ?
        `, [dni]);

    // Si el DNI ya está en uso, devuelve un mensaje de error
    if (existingDNI.length > 0) {
      return res.status(400).json({ error: true, message: 'El DNI ya está en uso por otro usuario' });
    }

    // Verificar si el teléfono tiene exactamente 9 dígitos
    if (telefono.toString().length !== 9 || !(/^9\d{8}$/.test(telefono))) {
      return res.status(400).json({  error: true, message: 'El teléfono debe tener exactamente 9 dígitos numéricos' });
    }

    // Verificar si el teléfono existe en la base de datos
    const [existingPhone] = await pool.query(`
            SELECT id FROM usuarios WHERE telefono = ?
        `, [telefono]);

    // Si el teléfono ya está en uso, devuelve un mensaje de error
    if (existingPhone.length > 0) {
      return res.status(400).json({ error: true, message: 'El teléfono ya está en uso por otro usuario' });
    }

    // Agregar el nuevo usuario a la base de datos
    const [createdUser] = await pool.query(`
            INSERT INTO usuarios (correo, nombres, apellidos, password, direccion, telefono, dni, id_rol, estado, usuario_registro)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [correo, nombres, apellidos, password, direccion, telefono, dni, id_rol, 'activo', usuario_registro]);

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
        u.id_rol as id_rol,
        r.nombre as nombre_rol,
        u.estado
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.id = ?;`

    const [user] = await pool.query(query, [createdUser.insertId]);

    return res.status(201).json({ message: 'Usuario agregado correctamente', user: user[0] });
  } catch (err) {
    return res.status(500).json({  error: true, message: err });
  }
});

export default router;