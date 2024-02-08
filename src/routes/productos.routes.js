import {Router} from 'express'
import pool from '../database.js'

const router = Router();

router.get('/add', (req,res)=>{
    res.render('productos/add');
});

router.post('/add', async(req, res)=>{
    try{
        const {nombre, descripcion, precio, beneficio } = req.body;
        const newProducto = {
            nombre, descripcion, precio, beneficio, stock, categoria, idcategoria, imagen
        }
        await pool.query('INSERT INTO productos SET ?', [newProducto]);
        //res.redirect('/list');
    }
    catch(err){
        res.status(500).json({ error: true, message:err.message});
    }
});

router.get('/list', async(req, res)=>{
    try{
        const [result] = await pool.query('SELECT * FROM productos');
        res.render('productos/list', {productos: result});
    }
    catch(err){
        res.status(500).json({ error: true, message:err.message});
    }
});

router.get('/edit/:id', async(req, res)=>{
    try{
        const {id} = req.params;
        const [producto] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
        const productoEdit = producto[0];
        res.render('productos/edit', {producto: productoEdit});
    }
    catch(err){
        res.status(500).json({error: true, message:err.message});
    }
})

router.post('/edit/:id', async(req, res)=>{
    try{
        const {nombre, descripcion, precio} = req.body;
        const {id} = req.params;
        const editProducto = {nombre, descripcion, precio};
        await pool.query('UPDATE productos SET ? WHERE id = ?', [editProducto, id]);
        res.redirect('/list');
    }
    catch(err){
        res.status(500).json({error: true, message:err.message});
    }
})


router.get('/delete/:id', async(req, res)=>{
    try{
        const {id} = req.params;
        await pool.query('DELETE FROM productos WHERE id = ?', [id]);
        res.redirect('/list');
    }
    catch(err){
        res.status(500).json({error: true, message:err.message});
    }
});
export default router;