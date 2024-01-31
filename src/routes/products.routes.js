import { Router } from 'express';
import pool from '../database.js';

const router = Router();

// Ruta para obtener todos los productos
router.get('/productos', async (req, res) => {
        console.log('Request received at /productos');
    try {
        const result = await pool.query('SELECT * FROM productos');
        res.json(result[0]); // Result es un array, y los datos estarán en result[0]
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error interno del servidor');
    }
});

export default router;
