drop DATABASE Peruscale;

CREATE DATABASE Peruscale;

USE Peruscale;

drop table usuarios

CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `correo` varchar(100) NOT NULL,
  `password` varchar(200) DEFAULT NULL,
  `nombres` varchar(200) DEFAULT NULL,
  `apellidos` varchar(200) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `telefono` varchar(200) DEFAULT NULL,
  `dni` varchar(8) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario_registro` varchar(50) DEFAULT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario_actualizacion` varchar(50) DEFAULT NULL,
  `id_rol` int DEFAULT '3',
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo_UK` (`correo`),
  UNIQUE KEY `dni_UK` (`dni`),
  UNIQUE KEY `telefono_UK` (`telefono`),
  KEY `id_rol` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `categorias` (
  `idcategoria` int NOT NULL AUTO_INCREMENT,
  `nombrecategoria` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idcategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `categorias` VALUES (1,'Balanzas de plataforma'),(2,'Pesas patrones'),(3,'Balanzas etiquetadoras'),(4,'Balanzas para animales'),(5,'Balanzas comerciales'),(6,'Celdas'),(7,'Balanzas colgantes');

select * from categorias

CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) DEFAULT NULL,
  `precio` int DEFAULT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `imagen` varchar(100) DEFAULT NULL,
  `beneficio` varchar(100) DEFAULT NULL,
  `idcategoria` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idcategoria` (`idcategoria`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`idcategoria`) REFERENCES `categorias` (`idcategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `productos`
VALUES (1,'Balanza BP 315',1000,'Indicador de peso y plataforma acerada ',10,'https://pesatec.com/wp-content/uploads/2018/08/bp-315-x5-240x240.jpg','Por la compra de 2 balanzas, tienes una instalación gratis',1),(5,'Balanza AD44',1500,'Indicador de peso de plastico y plataforma azul',5,'https://pesatec.com/wp-content/uploads/2018/08/AD44-RD-240.jpg',NULL,1),(6,'Pesa Cilindrica',80,'Pesa cilindrica de bronce de 5  y 8 kg',15,'https://pesatec.com/wp-content/uploads/2018/08/BR-2.jpg','Por la compra de 2 pesas patrones ,tienes 1 servicio de calibración gratis',2),(7,'Pesa rectangular ',200,'Pesa rectagular de fierro  de 20 y 25 kg',10,'https://pesatec.com/wp-content/uploads/2019/04/ff001-1.jpg',NULL,2),(9,'Balanza contadora etiquetadora',600,'Indepeniente de PC , con capacidad de 30 kg x 0.5 g',5,'https://pesatec.com/wp-content/uploads/2018/08/CAT4240p.png',NULL,3),(10,'Balanza Plataforma Etiquetadora',950,'Balanza con capacidad de  30 a 800 kg + precisión de 1  a 100g',8,'https://pesatec.com/wp-content/uploads/2018/08/TPT4240p.png',NULL,3),(12,'Balanza ganado',8000,'Balanza con capacidad de 900 kg de acero inoxidable',2,'https://pesatec.com/wp-content/uploads/2018/08/estructural-2.gif',NULL,4),(13,'Balanza monoriel colgante',3000,'Balanza incorporada al riel para trabajo extremo y larga duración con visor giratorio  360° de gran calidad',5,'https://pesatec.com/wp-content/uploads/2018/08/Monorriel-2.gif',NULL,4),(15,'Balanza A12 GR',2000,'Inidcador de peso y plataforma acerada , con baranda metalica',5,'https://pesatec.com/wp-content/uploads/2018/08/A12-GR-240.jpg',NULL,1),(17,'High Weight – PW P30',300,'Modelo PW-P30 con capacidad de 30 kg x 5g ',10,'https://pesatec.com/wp-content/uploads/2018/08/PWP30P.png',NULL,5)

use PeruScale
drop table solicitudes_cotizacion
drop table solicitud_productos

use PeruScale

select * from  solicitudes_cotizacion
select * from solicitud_productos
select * from tipo_servicios

CREATE TABLE solicitud_servicio(
    id INT AUTO_INCREMENT PRIMARY KEY,
    balanzaDescripcion varchar(200) NOT NULL,
    mensaje varchar(1000)
)

CREATE TABLE solicitudes_cotizacion(
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa varchar(200) NOT NULL,
    medioDePago varchar(200) NOT NULL,
    cliente varchar(200) NOT NULL,
    direccion varchar(200) NOT NULL,
    telefono varchar(200) NOT NULL,
    dni varchar(8) NOT NULL,
    id_cliente INT,
    id_asignado INT,
    id_servicio INT,
    estado ENUM('pendiente', 'cancelado', 'denegado'),
    FOREIGN KEY (id_cliente) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (id_asignado) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (id_servicio) REFERENCES solicitud_servicio(id) ON DELETE SET NULL
);

CREATE TABLE solicitud_productos(
    id INT AUTO_INCREMENT PRIMARY KEY,
    cantidad INT,
    id_producto INT,
    id_solicitud INT NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES productos(id),
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes_cotizacion(id)
)

CREATE TABLE tipo_servicios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion varchar(200)
)
