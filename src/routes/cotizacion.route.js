import pool from '../database.js'
import { Router } from 'express'

const router = Router()

router.patch('/asignar/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { user_id } = req.body
  
    if (!id || !user_id) return res.json({
      error: true,
      message: 'Bad Request'
    })

    const [quotationReq] = await pool.query(`SELECT id_asignado FROM solicitudes_cotizacion WHERE id = ?`, [id])

    if (quotationReq[0].id_asignado) {
      res.json({
        error: true,
        message: 'La solicitud ya está siendo atendida por otro asesor'
      })
    }
    const query = 
    `UPDATE solicitudes_cotizacion
    SET id_asignado = ?
    WHERE id = ?`

    await pool.query(query, [Number(user_id), Number(id)])

    res.json({
      message: 'Asignado correctamente'
    })

  } catch(e) {
    return res.json({
      error: true,
      message: e.message
    })
  }

})

router.get('/servicios', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT * FROM tipo_servicios');
    return res.json(result)

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'Error al agregar servicio' });
  }
})

router.get('/solicitudes/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (isNaN(id)) {
      return res.status(400).json({
        error: true,
        message: 'Error obteniendo el detalle de la solicitud'
      })
    }

    const query = `SELECT
      sc.*,
      u_asignado.nombres AS nombre_asignado,
      u_asignado.apellidos AS apellidos_asignado,
      ss.balanzaDescripcion,
      ss.mensaje,
      ss.id_tipo_servicio,
      ts.descripcion as descripcion_servicio
    FROM
      solicitudes_cotizacion sc
    LEFT JOIN
      usuarios u_asignado ON sc.id_asignado = u_asignado.id
    LEFT JOIN
      solicitud_servicio ss ON sc.id_servicio = ss.id
    LEFT JOIN
    tipo_servicios ts ON ss.id_tipo_servicio = ts.id
    WHERE sc.id = ?`

    const [requests] = await pool.query(query, [Number(id)])
    const request = requests[0] 

    if (!request.id_servicio) {
      const productsQuery = `
      select p.imagen, p.nombre, sp.cantidad from solicitud_productos sp
      INNER JOIN productos as p ON sp.id_producto = p.id
      where id_solicitud = ?`

        const [products] = await pool.query(productsQuery, [Number(id)])

      return res.json({ data: request, products })
    }

    return res.json({ data: request })
  } catch (error) {
    return res.status(500).json(error)
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

router.get('/solicitud_productos', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT * FROM solicitud_productos');
    return res.json(result)

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'Error al agregar servicio' });
  }
})

router.get('/solicitudes_cotizacion', async (req, res) => {
  try {
    const result = await pool.query('SELECT solicitudes_cotizacion.*, usuarios.nombres AS nombre_asignado, usuarios.apellidos AS apellidos_asignado FROM solicitudes_cotizacion LEFT JOIN usuarios ON solicitudes_cotizacion.id_asignado = usuarios.id');
    return res.json(result[0])

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
    id_tipo_servicio,
    capacidadBalanza
  } = req.body;

  try {

    await pool.query('START TRANSACTION');

    const [reqService] = await pool.query(
      'INSERT INTO solicitud_servicio (balanzaDescripcion, mensaje, id_tipo_servicio, capacidadBalanza) VALUES (?, ?, ?, ?)',
      [balanzaDescripcion, mensaje, id_tipo_servicio, capacidadBalanza]
    );

    const requestServiceId = reqService.insertId

    await pool.query(
      'INSERT INTO solicitudes_cotizacion (empresa, medioDePago, cliente, direccion, telefono, dni, id_cliente, id_asignado, estado, id_servicio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [empresa, medioDePago, cliente, direccion, telefono, dni, id_cliente ?? null, null, 'pendiente', requestServiceId]
    );

    await pool.query('COMMIT');

    res.json({ message: 'Solicitud de cotización y productos insertados con éxito.' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
});

router.get('/pendientes/:id', async (req, res) => {
  try {
    const { id } = req.params

    const [tasks] = await pool.query('SELECT * FROM solicitudes_cotizacion WHERE id_asignado = ?', [Number(id)])
    return res.json(tasks)
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message
    })
  }
})


export default router