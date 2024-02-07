import { Router } from "express";
import pool from '../database.js'

const router = Router();

//Ruta para obtener los usuario 


router.get('/admin_usuarios', async (req, res) => {
    try {
        const [usuarios] = await pool.query(`
            SELECT u.id, u.correo, CONCAT(u.nombres," ",u.apellidos) nombre_completo, 
                   u.direccion, u.telefono, u.dni, u.fecha_registro, u.usuario_registro, 
                   u.fecha_actualizacion, u.usuario_actualizacion, r.nombre as nombre_rol, 
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




// Ruta para actualizar un usuario
router.put('/admin_usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { correo, nombres, apellidos, direccion, telefono, dni, id_rol, estado } = req.body;

    try {
        // Verificar si el correo electrónico existe en la base de datos
        const [existingEmail] = await pool.query(`
            SELECT id FROM usuarios WHERE correo = ? AND id != ?
        `, [correo, id]);

        // Si el correo electrónico existe y pertenece a otro usuario, devuelve un mensaje de error
        if (existingEmail.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está en uso por otro usuario' });
        }
         // Verificar si el DNI tiene exactamente 8 dígitos
         if (dni.toString().length !== 8 || !(/^\d{8}$/.test(dni))) {
            return res.status(400).json({ message: 'El DNI debe tener exactamente 8 dígitos numéricos' });
        }


        // Verificar si el DNI existe en la base de datos
        const [existingDNI] = await pool.query(`
            SELECT id FROM usuarios WHERE dni = ? AND id != ?
        `, [dni, id]);

        // Si el DNI existe y pertenece a otro usuario, devuelve un mensaje de error
        if (existingDNI.length > 0) {
            return res.status(400).json({ message: 'El DNI ya está en uso por otro usuario' });
        }

          // Verificar si el teléfono tiene exactamente 9 dígitos
        if (telefono.toString().length !== 9 ||  !(/^9\d{8}$/.test(telefono))) {
            return res.status(400).json({ message: 'El teléfono debe tener exactamente 9 dígitos numéricos' });
        } 

        // Verificar si el teléfono existe en la base de datos
        const [existingPhone] = await pool.query(`
            SELECT id FROM usuarios WHERE telefono = ? AND id != ?
        `, [telefono, id]);

        // Si el teléfono existe y pertenece a otro usuario, devuelve un mensaje de error
        if (existingPhone.length > 0) {
            return res.status(400).json({ message: 'El teléfono ya está en uso por otro usuario' });
        }

        // Actualizar el usuario 
        await pool.query(`
            UPDATE usuarios
            SET correo = ?, nombres = ?, apellidos = ?, direccion = ?, telefono = ?, dni = ?, id_rol = ?, estado = ?
            WHERE id = ?
        `, [correo, nombres, apellidos, direccion, telefono, dni, id_rol, estado, id]);

        return res.status(200).json({ message: 'Usuario actualizado correctamente' });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});




export default router;