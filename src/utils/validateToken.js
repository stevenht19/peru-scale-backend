import jwt from 'jsonwebtoken';
import pool from '../database.js'; // Este import parece no utilizarse, asegúrate de que es necesario

export function verifyToken(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        message: 'Acceso no autorizado. Token no proporcionado.'
      });
    }

    // Suponiendo que estás enviando el token en el formato 'Bearer <token>'
    const token = authorization.split(' ')[1];
    const payload = jwt.verify(token, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3JyZW8iOiJjYW1hbGVvbnhAZ21haWwuY29tIiwicGFzc3dvcmQiOiJOZXVyb25hMCoiLCJpYXQiOjE3MDc4MDU5MTQsImV4cCI6MTcwNzgwOTUxNH0.ipHLmPOPX2AT5vMy2h6GtskBlkaUJgUlctilY3P7-M0); // Asegúrate de reemplazar 'tu_clave_secreta_aqui' con tu clave secreta real
    
    if (!payload) {
      return res.status(401).json({
        message: 'Token inválido.'
      });
    }

    req.user = payload;
    req.user_id = payload.id;

    next();

  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido o expirado.'
    });
  }
}
