import { Router } from 'express';
import pool from '../database.js';

const router = Router();

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    res.json(result[0]); // Result es un array, y los datos estarán en result[0]
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).send('Error interno del servidor');
  }
});

router.post('/add', async(req, res)=>{
  try{
      const {nombre, descripcion, precio, beneficio,stock, idcategoria, imagen } = req.body;
      const newProducto = {
          nombre, descripcion, precio, beneficio, stock, idcategoria, imagen
      }
      await pool.query('INSERT INTO productos SET ?', [newProducto]);
      res.status(200).json({ message: 'Producto agregado correctamente'});
      //res.redirect('/list');
  }
  catch(err){
      res.status(500).json({ error: true, message:err.message});
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = +req.params.id
    const result = await pool.query('SELECT * FROM productos where id = ?', [id]);
    res.json(result[0][0]); 
   
  } catch (error) {
    res.status(500).send('Error interno del servidor');
  }
})

export default router;
