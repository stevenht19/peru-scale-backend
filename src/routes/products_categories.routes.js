import {Router} from 'express'
import pool from '../database.js'

const router = Router();

// Ruta para obtener productos por categoría
router.get('/categorias/:idcategoria/productos', async (req, res) => {
    const { idcategoria } = req.params;

    try {
        // Realiza una consulta para obtener productos por categoría
        const query = 'SELECT * FROM productos WHERE idcategoria = ?';
        const result = await pool.query(query, [idcategoria]);

        res.json(result[0]);
    } catch (error) {
        console.error('Error al obtener productos por categoría:', error);
        res.status(500).send('Error interno del servidor');
    }
});

export default router;