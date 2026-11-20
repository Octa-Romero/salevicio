# SaleVicio 2.0 — guía de despliegue sin perder datos

**Importante:** el código dentro del ZIP no modifica tu Neon, Render o Netlify por sí solo. Primero crear un respaldo de la base y probar en una rama de Neon o una base de prueba. Nunca compartir una cadena `DATABASE_URL` con contraseña ni subir archivos `.env`.

## 1. Preparar Git (todavía no hagas push)

Esta entrega incluye la carpeta `.git` con commits locales nuevos. **No hagas `git push` hasta completar el respaldo y las migraciones SQL**: Render y Netlify pueden tener despliegue automático al recibir nuevos commits. Si no hubo nuevos commits en GitHub desde el ZIP original, extraer el ZIP y revisar en Git Bash:

```bash
git status
git log --oneline -12
```

Si hiciste cambios en GitHub después de pasarme el ZIP, primero reconciliar esos cambios (no forzar `push` ni sobrescribirlos). Esta entrega no realizó `git push` en tu cuenta. El momento seguro para subir cambios es el paso 3, una vez que la base esté migrada.

## 2. Migrar PostgreSQL de Neon (antes de cambiar el backend)

1. Ingresar a Neon y localizar la base usada por `DATABASE_URL` de Render.
2. Crear una rama de prueba de Neon o una copia/backup según las opciones de tu plan. Probar allí primero si es posible.
3. En **SQL Editor**, ejecutar completo `backend/sql/003_cuentas_y_comunidad.sql`.
4. Después ejecutar completo `backend/sql/004_catalogo.sql`.
5. Comprobar:

```sql
SELECT COUNT(*) AS juegos FROM juegos;
SELECT COUNT(*) AS usuarios FROM usuarios;
SELECT COUNT(*) AS sesiones FROM sesiones;
SELECT COUNT(*) AS hilos FROM hilos;
SELECT COUNT(*) AS novedades FROM novedades;
```

**Ambos archivos usan `BEGIN`/`COMMIT` y son aditivos**. No eliminan `usuarios`, `juegos`, `favoritos`, `resenas` ni los datos del usuario demo. La migración `004` agrega juegos y noticias iniciales editoriales. Si aparece un error, detenerse: no borrar tablas ni aplicar cambios al azar.

## 3. Publicar los commits en GitHub (tras migrar Neon)

Desde la carpeta con el historial Git de esta entrega:

```bash
git push origin main
```

**Atención:** el push puede iniciar automáticamente los despliegues de Render y Netlify. Por eso los scripts `003` y `004` se aplican antes. Si hay cambios remotos nuevos, no usar `--force`; integrar los cambios o consultar antes de continuar.

## 4. Actualizar backend Render

- Servicio existente: **salevicio-api**.
- Root directory: `backend`.
- Build command: `npm ci`.
- Start command: `npm start`.
- Variables de entorno:
  - `DATABASE_URL`: URL privada de Neon con contraseña actual.
  - `NODE_ENV=production`.
  - `FRONTEND_URL=https://salevicio.netlify.app` (reemplazar por dominio real si cambió; sin barra final).

Si tu conexión ya usa `sslmode=verify-full`, no necesitás modificar Neon. Implementar un nuevo despliegue desde el commit 2.0.

**Probar primero:**

- `GET https://salevicio-api.onrender.com/api/health` → `status:ok`.
- `GET https://salevicio-api.onrender.com/api/health/db` → `database:connected`.
- `GET https://salevicio-api.onrender.com/api/juegos` → JSON con títulos.
- `GET https://salevicio-api.onrender.com/api/novedades` → JSON con novedades.

Si un endpoint falla, abrir **Render → Logs**; no publicar el frontend nuevo hasta que el backend responda correctamente.

## 5. Actualizar frontend Netlify

- Proyecto existente: **salevicio**.
- Repositorio: `Octa-Romero/salevicio`.
- Base directory: `frontend`.
- Build command: `npm run build`.
- Publish directory: `dist` (relativo a `frontend`).
- Environment variable: `VITE_API_URL=https://salevicio-api.onrender.com`.

Realizar **un nuevo deploy** desde `main` para compilar el React actualizado. `VITE_API_URL` debe existir durante el build, no solo después.

## 6. Pruebas funcionales finales (navegador + Insomnia)

1. Abrir SaleVicio, consultar juegos, ficha y enlace HTTPS.
2. Crear una cuenta con nombre (3–30), correo y contraseña de 12+ caracteres.
3. Cerrar sesión; iniciar nuevamente con la misma cuenta.
4. Guardar y eliminar un favorito; comprobar que persiste tras recargar.
5. Escribir una reseña de 1–5 estrellas y 10–500 caracteres.
6. Crear un hilo dentro de un juego y responderlo; comprobar la autoría.
7. Ver biblioteca personal con favoritos, reseñas e hilos.
8. Probar con una segunda cuenta para confirmar que los favoritos son individuales.
9. Comprobar diseño en celular (F12 → vista móvil) y tema claro/oscuro.
10. Verificar que GETs públicos no requieren registro, pero los POST protegidos responden `401` sin bearer token.

### Insomnia: ejemplo de registro

```http
POST https://salevicio-api.onrender.com/api/auth/registro
Content-Type: application/json

{"nombre":"UsuarioPrueba","email":"prueba@example.com","password":"ClavePruebaLarga-2026"}
```

Usar **un email propio controlado** si la prueba se realiza en producción, no direcciones de terceros. Después incluir `Authorization: Bearer TU_TOKEN` para las rutas protegidas. No guardar tokens en capturas ni compartirlos.

## 7. Pendientes para una apertura a público general

La v2 es una base para seguir trabajando. Antes de anunciarla como plataforma de cuentas de producción: verificar e implementar confirmación y recuperación de email, términos y privacidad, moderación/reportes y borrado de cuentas/datos; configurar monitorización y revisar límites, protecciones XSS y políticas CSP; evaluar imágenes y fuentes autorizadas. Sin esto, usarla como beta controlada.

## Solución de problemas

- **`Cannot GET /` en Render:** normal; utilizar rutas `/api/...`.
- **`database: unavailable`:** revisar `DATABASE_URL` y Logs de Render.
- **`Failed to fetch` en Netlify:** verificar `VITE_API_URL` al compilar y que `FRONTEND_URL` sea origen `https://...` exacto en Render.
- **`relation "sesiones" does not exist`:** faltó aplicar SQL `003` a la **misma base** que usa Render.
- **`column "desarrollador" does not exist`:** faltó aplicar SQL `004`.
- **Primer acceso lento:** Render puede iniciar tras inactividad en el plan gratuito.
