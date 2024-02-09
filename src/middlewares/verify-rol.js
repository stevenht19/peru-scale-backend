// import pool from '../database.js'; 
// // import {Roles} from '../utils/roles.js'
// // verify-rol.js

// import jwt from 'jsonwebtoken';

// export const verifyRol = (req, res, next) => {
//     const token = req.header('Authorization');

//     if (!token) {
//         return res.status(401).json({ message: 'Acceso no autorizado. Token no proporcionado.' });
//     }

//     try {
//         const decoded = jwt.verify(token, 'your_secret_key'); // Reemplaza 'your_secret_key' con tu clave secreta para firmar el token
//         req.user = decoded.user; // Guarda la información del usuario en el objeto de solicitud
//         if (req.user.id_rol === 1) {
//             next();
//         } else {
//             return res.status(403).json({ message: 'Acceso denegado. Permiso insuficiente.' });
//         }
//     } catch (error) {
//         return res.status(401).json({ message: 'Token inválido.' });
//     }
// };





































// // export function authorizeAdmin(req, res, next) {
// //     const { usuario } = req; // Asumiendo que ya has implementado la autenticación y almacenado la información del usuario en req.usuario
    
// //     if (!usuario || usuario.id_rol !== 1) {
// //         if (res && res.status) {
// //             return res.status(403).json({
// //                 error: true,
// //                 message: 'No tiene permisos suficientes para acceder a esta ruta'
// //             });
// //         } else if (next && typeof next === 'function') {
// //             return next();
// //         } else {
// //             // Si ni res ni next están disponibles, simplemente no hagas nada
// //             return;
// //         }
// //     }

// //     return next();
// // }
