
import { Router } from "express";
import pool from '../database.js'

const router = Router();
// Ruta para actualizar cuenta------------------------
router.put('/client_usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const {  nombres, apellidos, correo, telefono, direccion } = req.body;

    try {
        // Verificar si el correo electrónico existe en la base de datos
        const [existingEmail] = await pool.query(`
            SELECT id FROM usuarios WHERE correo = ? AND id != ?
        `, [correo, id]);

        // Si el correo electrónico existe y pertenece a otro usuario, devuelve un mensaje de error
        if (existingEmail.length > 0) {
            return res.status(400).json({ message: 'El correo electrónico ya está en uso por otro usuario' });
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

        // Actualizar la cuenta  
        await pool.query(`
            UPDATE usuarios
            SET  nombres = ?, apellidos = ?, correo = ?, direccion = ?, telefono = ?
            WHERE id = ?
        `, [ nombres, apellidos, correo, telefono, direccion, id]);

        return res.status(200).json({ message: 'Usuario actualizado correctamente' });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});


export default router;