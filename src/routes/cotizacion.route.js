import pool from '../database.js'
import { Router } from 'express'

const router = Router()

router.get('/servicios', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT * FROM tipo_servicios');
    return res.json(result)

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'Error al agregar servicio' });
  }
})

router.get('/solicitud_servicios', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT * FROM solicitud_servicio');
    return res.json(result)

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'Error al agregar servicio' });
  }
})




router.post('/servicios/agregar', async (req, res) => {
  try {

    const { descripcion } = req.body;

    if (!descripcion) {
      return res.status(400).json({ error: 'La descripción del servicio es requerida' });
    }

    const [result] = await pool.query('INSERT INTO tipo_servicios (descripcion) VALUES (?)', [descripcion]);

    res.json({ id: result.insertId, mensaje: 'Servicio agregado exitosamente' });
  } catch (error) {
    console.error('Error al agregar servicio:', error);
    res.status(500).json({ error: 'Error al agregar servicio' });
  }
});


router.post('/solicitar', async (req, res) => {
  const { empresa, medioDePago, cliente, direccion, telefono, dni, id_cliente, products } = req.body;

  try {
    await pool.query('START TRANSACTION');

    const [request] = await pool.query(
      'INSERT INTO solicitudes_cotizacion (empresa, medioDePago, cliente, direccion, telefono, dni, id_cliente, id_asignado, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [empresa, medioDePago, cliente, direccion, telefono, dni, id_cliente ?? null, null, 'pendiente']
    );

    const requestId = request.insertId
    const insertProductQuery = `INSERT INTO solicitud_productos (cantidad, id_producto, id_solicitud) VALUES ${products.map(() => '(?, ?, ?)').join(', ')}`

    await pool.query(insertProductQuery, products.map((product) => [product.quantity, product.id, requestId]).flat());

    await pool.query('COMMIT');

    return res.json({ message: 'Solicitud de cotización y productos insertados con éxito.' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
});

router.post('/solicitar-servicio', async (req, res) => {
  const {
    empresa,
    medioDePago,
    cliente,
    direccion,
    telefono,
    dni,
    id_cliente,
    balanzaDescripcion,
    mensaje,
    id_tipo_servicio
  } = req.body;

  try {

    await pool.query('START TRANSACTION');

    const [request] = await pool.query(
      'INSERT INTO solicitudes_cotizacion (empresa, medioDePago, cliente, direccion, telefono, dni, id_cliente, id_asignado, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [empresa, medioDePago, cliente, direccion, telefono, dni, id_cliente ?? null, null, 'pendiente']
    );

    const requestId = request.insertId

    await pool.query(
      'INSERT INTO solicitud_servicio (balanzaDescripcion, mensaje, id_solicitud, id_tipo_servicio) VALUES (?, ?, ?, ?)',
      [balanzaDescripcion, mensaje, requestId, id_tipo_servicio]
    );

    await pool.query('COMMIT');

    res.json({ message: 'Solicitud de cotización y productos insertados con éxito.' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
});


export default router