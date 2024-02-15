// Al principio de tu archivo verify-rol.js
import jwt from 'jsonwebtoken';
import pool from '../database.js'; 
import { Roles } from '../utils/roles.js';

// Asegúrate de tener esto en la parte superior del archivo donde cargas todas tus dependencias.
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export const verifyRol = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Acceso no autorizado. Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded.user;
        
        if (req.user.id_rol === Roles.Admin) {
            next();
        } else {
            return res.status(403).json({ message: 'Acceso denegado. Permiso insuficiente.' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido.' });
    }
};
