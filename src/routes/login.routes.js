import {Router} from 'express'
import pool from '../database.js'

const router = Router();





router.get('/login', (req, res) => {
    res.render('login/login');
});

router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;
        const [user] = await pool.query('SELECT * FROM usuarios WHERE correo = ? AND password = ?', [correo, password]);

        if (user.length > 0) {
            // acceso exitoso
            res.redirect('/list'); // // Redirigir a la lista de productos o cualquier otra página
        } else {
            // Credenciales invalidas
            res.render('login', { error: 'Invalid correo or password' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



export default router;