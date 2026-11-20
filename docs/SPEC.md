# SaleVicio 2.0 — especificación funcional

## Objetivo
Plataforma web responsive de descubrimiento y comunidad gamer que permite consultar un catálogo independiente, reseñar, guardar juegos y debatir por título. La interfaz toma como inspiración general una distribución tipo dashboard (menú lateral, hero y tarjetas), con identidad azul noche/amarillo propia.

## Roles
- **Visitante:** explorar catálogo, fichas, reseñas, hilos y novedades del sitio sin cuenta.
- **Usuario registrado:** además, guardar/quitar favoritos propios, publicar reseñas, crear y responder hilos, ver su biblioteca, configurar tema y cerrar sesión.
- **Usuario demo histórico:** se conserva en base para no borrar datos v1; no puede autenticarse. **No hay rol de administrador en esta versión.**

## Funcionalidades MVP 2.0
1. Registro/login/logout seguro y recuperación de sesión vigente al recargar la pestaña.
2. Catálogo de juegos con filtro por género y búsqueda por título.
3. Fichas con sinopsis redactada por SaleVicio, género, plataforma, desarrollador, año, enlace oficial HTTPS y acceso al foro del juego.
4. Biblioteca: favoritos personales, listado de reseñas propias e hilos iniciados.
5. Reseñas públicas con puntuación y autor; lectura pública, escritura autenticada.
6. Foros por juego: lectura pública, creación y respuestas autenticadas, eliminación de hilos por autor.
7. Novedades editoriales de SaleVicio almacenadas en la BD, sin pretender ser actualizaciones verificadas de los juegos.
8. UI responsive con menú lateral, hero personalizado por favorito o alternativa original, tema claro/oscuro, Settings/Help.

## Reglas de negocio
- **RN-001:** cada usuario tiene como máximo un favorito por juego (constraint `UNIQUE`).
- **RN-002:** favoritos, reseñas e hilos apuntan a juegos existentes.
- **RN-003:** puntuación entera de 1 a 5.
- **RN-004:** comentario de reseña entre 10 y 500 caracteres.
- **RN-005:** enlaces de juegos HTTPS, con salida a sitio oficial.
- **RN-006:** datos persistentes en PostgreSQL asociados al ID de usuario autenticado.
- **RN-007:** arte gráfico de sitio original; no usar portadas licenciadas sin permiso.
- **RN-008:** nombre de cuenta de 3 a 30 letras/números/`_`/`-`, email válido, contraseña >=12 caracteres.
- **RN-009:** correo y nombre únicos sin distinción de mayúsculas; nunca exponer hashes de contraseña al cliente.
- **RN-010:** sesiones individuales aleatorias, caducidad de siete días, revocación en logout.
- **RN-011:** solo el autor puede eliminar un hilo propio.
- **RN-012:** hilo de 8–120 caracteres de título y 20–2000 de mensaje; respuestas de 3–1000 caracteres.
- **RN-013:** no descargar ni vender juegos, no inventar requisitos técnicos o precios; enlazar la información actual a tienda oficial.

## Modelo de datos
Tablas anteriores: `usuarios`, `juegos`, `favoritos`, `resenas`. Extensiones aditivas: `usuarios.email`, `usuarios.password_hash`, `usuarios.creado_en`, `usuarios.biografia`, `juegos.desarrollador`, `juegos.lanzamiento`; tablas nuevas: `sesiones`, `hilos`, `respuestas_hilo`, `novedades`.

## Seguridad y limitaciones explícitas
Hash scrypt con sal, SQL parametrizado, validación, throttling en memoria, bearer token aleatorio cuyo hash se almacena en DB, CORS por origen y HTTPS de hosting. Como MVP no incluye email verificado, reseteo de contraseña, rol admin, moderación, eliminación/exportación de datos ni política legal completa. Evitar altas públicas masivas hasta completar esas medidas.

## No alcance actual
Amigos/seguidores, chat privado, noticias de juegos en tiempo real, compra desde SaleVicio, actualización automática de requisitos, inventario de juegos adquiridos, precios en vivo, scraping de Steam u otras APIs externas.

## Entregables
Código frontend/backend, SQL 003–004, pruebas automatizadas y plan de verificación manual, especificación, guía de despliegue y registro de commits por tarea.
