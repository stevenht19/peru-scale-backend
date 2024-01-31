import { Router } from 'express';
import pool from '../database.js';

const router = Router();

// Ruta para agregar una nueva categoría
router.post('/categorias/add', async (req, res) => {
    console.log('Request received at POST /categorias/add');
    
    try {
        const { nombrecategoria } = req.body;

        // Verificar si el nombre de la categoría ya existe en la base de datos
        const existingCategory = await pool.query('SELECT * FROM categorias WHERE nombrecategoria = ?', [nombrecategoria]);
        if (existingCategory[0].length > 0) {
            return res.status(400).json({ error: 'La categoría ya existe.' });
        }

        // Insertar la nueva categoría en la base de datos
        const result = await pool.query('INSERT INTO categorias (nombrecategoria) VALUES (?)', [nombrecategoria]);

        res.status(201).json({ id: result.insertId, nombrecategoria });
    } catch (error) {
        console.error('Error al agregar categoría:', error);
        res.status(500).send('Error interno del servidor');
    }
});



// Ruta para obtener categorias
router.get('/categorias', async (req, res) => {
        console.log('Request received at /categorias');
    try {
        const result = await pool.query('SELECT * FROM categorias');
        res.json(result[0]); // Result es un array, y los datos estarán en result[0]
    } catch (error) {
        console.error('Error al obtener categorias:', error);
        res.status(500).send('Error interno del servidor'); 
    }
});

export default router;
