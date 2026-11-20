# SaleVicio 2.0 — plan de trabajo

## Estrategia
Evolucionar el MVP v1 sin sustituir React, Express, Neon, Render o Netlify. Mantener historial Git y preservar datos anteriores. Reducir integraciones externas en esta entrega: las noticias son editoriales y los requisitos técnicos se consultan en el sitio oficial.

## Orden técnico
1. **Base de datos:** SQL `003_cuentas_y_comunidad.sql` para cuentas, sesiones, foros y novedades. SQL `004_catalogo.sql` para metadatos y juegos extras. En producción probar primero en una rama Neon.
2. **Backend:** registro, login, sesión revocable; favoritos y reseñas vinculados al usuario; API de hilos, respuestas y novedades.
3. **Frontend:** cliente REST autenticado, modal login, tablero lateral, hero con favoritos o fondo alternativo, catálogo y fichas; biblioteca, foro, news, settings/help.
4. **Estilo y accesibilidad:** identidad azul/amarillo, diseño responsive, controles de teclado y mensajes de estado.
5. **Calidad:** pruebas de lógica criptográfica, casos de API simulados, build React, exploración y pruebas contra Neon.
6. **Publicación:** backup/branch Neon, migraciones 003 y 004, despliegue Render, luego Netlify, verificación en Internet.

## Criterios de aceptación
- Público navega catálogo, reseñas y foros sin registrarse.
- Registrado inicia/cierra sesión, guarda favoritos y publica contenidos con autor.
- Dos cuentas distintas no comparten favoritos.
- Datos persisten al recargar y son enviados por HTTPS a la API propia.
- Enlaces de juegos llevan a páginas oficiales; no hay descarga ilegal.
- Interfaz utilizable desde móvil/desktop.
- Migraciones preservan filas históricas existentes.

## Riesgos y mitigaciones
- **Migración:** respaldar Neon y desplegar backend nuevo solo tras 003/004.
- **Abuso:** límites por IP para creación y autenticación; pendiente moderación/reportes para uso público.
- **Datos cambiantes:** no duplicar precios, requisitos ni noticias de juegos sin fuente verificable.
- **Recursos limitados:** Render/Neon gratuitos pueden entrar en suspensión o tener cuotas.
- **Calidad:** los tests con PostgreSQL simulado no reemplazan la prueba real en Neon/Netlify.

## Próximas iteraciones opcionales
Verificación y recuperación de correo, herramientas de moderación, borrado de cuentas, API licenciada para novedades/metadatos, amigos y notificaciones.
