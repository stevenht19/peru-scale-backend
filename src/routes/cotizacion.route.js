import pool from '../database.js'
import fs from 'fs'
import { Router } from 'express'
import { sendEmail } from '../utils/nodemailer.js'

const router = Router()

router.post('/emitir/:id', async (req, res) => {
  try {
    const { id } = req.params

    const select = `SELECT solicitante_correo FROM solicitudes_cotizacion where id = ? `

    const [quotationReq] = await pool.query(select, Number(id))

    if (quotationReq[0]) {

      if (!quotationReq[0]?.solicitante_correo) {
        return res.status(403).json({
          error: true,
          message: 'Correo not found'
        })
      }

      const query =
        `UPDATE solicitudes_cotizacion
      SET estado = ?
      WHERE id = ?`

      await pool.query(query, ['atendido', Number(id)])

      const f = req.files.archivo

      const fileStream = {
        stream: fs.createReadStream(f?.tempFilePath),
        filePath: f?.tempFilePath,
        extension: f?.mimetype,
        name: f?.name,
      }

      let fileToSave = []

      if (fileStream) {
        fileToSave.push({
          filename: f.name,
          content: fs.readFileSync(fileStream.stream.path)
        })
      }

      await sendEmail(quotationReq[0].solicitante_correo, `Hemos atendido su solicitud de cotización`, 'Cotizacion de Productos PeruScale', fileToSave)

      return res.json({ message: 'Cotización emitida correctamente' })
    }

  } catch (e) {
    return res.status(500).json({ message: e.message })
  }
})

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
      return res.json({
        error: true,
        message: 'La solicitud ya está siendo atendida por otro asesor'
      })
    }

    const [myTasks] = await pool.query(`SELECT id_asignado FROM solicitudes_cotizacion WHERE id_asignado = ? and estado='pendiente'`, [user_id])

    if (myTasks.length) {
      return res.json({
        error: true,
        message: 'Aún tienes asignada una solicitud pendiente'
      })
    }

    const query =
      `UPDATE solicitudes_cotizacion
    SET id_asignado = ?
    WHERE id = ?`

    await pool.query(query, [Number(user_id), Number(id)])

    return res.json({
      message: 'Asignado correctamente'
    })

  } catch (e) {
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
      ss.capacidadBalanza,
      ss.mensaje,
      ss.id_tipo_servicio,
      ss.precio,
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
      select *, p.imagen, p.nombre, sp.cantidad from solicitud_productos sp
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


router.patch('/servicio/:id/precio', async (req, res) => {
  try {
    const { id } = req.params
    const { price } = req.body

    const query =
      `UPDATE solicitud_servicio
      SET precio = ?
      WHERE id = ?`

    await pool.query(query, [+price, +id])


    return res.status(200).json({ message: 'Precio al servicio asignado' })
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message })
  }
})

router.patch('/productos/precio-unitario', async (req, res) => {
  try {
    const { products } = req.body

    for (let product of products) {
      const editProductQuery = `
          UPDATE solicitud_productos
          SET precio_unitario = ? and descuentos = 1
          WHERE id_producto = ?`;

      await pool.query(editProductQuery, [product.precio_unitario, product.id]);
    }


    return res.status(200).json({ message: 'Productos editados' })
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message })
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
    const result = await pool.query('SELECT solicitudes_cotizacion.*, usuarios.nombres AS nombre_asignado,usuarios.apellidos AS apellidos_asignado FROM solicitudes_cotizacion LEFT JOIN usuarios ON solicitudes_cotizacion.id_asignado = usuarios.id ORDER BY fecha_registro DESC');
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
  const { empresa, medioDePago, cliente, direccion, telefono, dni, id_cliente, correo, products } = req.body;

  try {
    await pool.query('START TRANSACTION');

    const [request] = await pool.query(
      'INSERT INTO solicitudes_cotizacion (empresa, medioDePago, cliente, direccion, telefono, dni, id_cliente, id_asignado, estado, solicitante_correo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [empresa, medioDePago, cliente, direccion, telefono, dni, id_cliente ?? null, null, 'pendiente', correo]
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
    capacidadBalanza,
    solicitante_correo
  } = req.body;

  try {

    await pool.query('START TRANSACTION');

    const [reqService] = await pool.query(
      'INSERT INTO solicitud_servicio (balanzaDescripcion, mensaje, id_tipo_servicio, capacidadBalanza) VALUES (?, ?, ?, ?)',
      [balanzaDescripcion, mensaje, id_tipo_servicio, capacidadBalanza]
    );

    const requestServiceId = reqService.insertId

    await pool.query(
      'INSERT INTO solicitudes_cotizacion (empresa, medioDePago, cliente, direccion, telefono, dni, id_cliente, id_asignado, estado, id_servicio, solicitante_correo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [empresa, medioDePago, cliente, direccion, telefono, dni, id_cliente ?? null, null, 'pendiente', requestServiceId, solicitante_correo]
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

    const [tasks] = await pool.query('SELECT * FROM solicitudes_cotizacion WHERE id_asignado = ? ORDER BY fecha_registro DESC', [Number(id)])
    return res.json(tasks)
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message
    })
  }
})




export default router