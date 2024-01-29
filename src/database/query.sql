CREATE DATABASE Peruscale;

USE Peruscale;

CREATE TABLE productos(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    precio INT
)

SELECT * FROM productos;

CREATE TABLE usuarios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    correo varchar(100) UNIQUE KEY NOT NULL,
    password varchar(200),
    nombres varchar(200),
    apellidos varchar(200),
    direccion varchar(200),
    telefono varchar(200),
    dni varchar(8)
)