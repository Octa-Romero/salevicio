
# SaleVicio — Especificación funcional

## 1. Descripción
SaleVicio es una plataforma comunitaria para descubrir videojuegos, consultar reseñas, guardar favoritos y acceder a sus plataformas oficiales.

## 2. Alcance del MVP
- Consultar catálogo de videojuegos.
- Buscar juegos por nombre.
- Consultar detalles y enlaces oficiales.
- Agregar y eliminar favoritos.
- Publicar y consultar reseñas con puntuaciones.
- Persistir la información en PostgreSQL.

El MVP utilizará un usuario de demostración compartido.
No incluye autenticación ni cuentas personales reales.

## 3. Entidades
- Juego: id, titulo, descripcion, genero, plataforma, enlace, imagen.
- Usuario: id, nombre (inicialmente un usuario demo).
- Favorito: id, usuario_id, juego_id.
- Reseña: id, usuario_id, juego_id, puntuacion, comentario, fecha.

## 4. Reglas de negocio
- RN-001: No se puede agregar dos veces el mismo juego a favoritos.
- RN-002: Solo se pueden guardar juegos existentes.
- RN-003: Las puntuaciones deben ser números enteros entre 1 y 5.
- RN-004: Las reseñas deben contener entre 10 y 500 caracteres.
- RN-005: Los enlaces externos deben utilizar HTTPS.
- RN-006: Los datos deben persistir después de recargar la página.
- RN-007: Las imágenes utilizadas deben ser propias o contar con permisos compatibles.

## 5. Endpoints previstos
- GET /api/juegos
- GET /api/juegos/:id
- GET /api/favoritos
- POST /api/favoritos
- DELETE /api/favoritos/:id
- GET /api/juegos/:id/resenas
- POST /api/juegos/:id/resenas

## 6. Restricciones del prototipo
Los favoritos del usuario demo serán compartidos entre visitantes.
Las reseñas serán públicas y no tendrán edición por autor.

No se almacenarán contraseñas ni datos personales reales.

## 7. Funcionalidades futuras
- Registro e inicio de sesión.
- Perfiles personales.
- Likes a reseñas.
- Recomendaciones personalizadas.
- Publicación de juegos independientes.