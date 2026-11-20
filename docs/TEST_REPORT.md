# SaleVicio 2.0 — informe de verificaciones

**Estado: revisión de código terminada; pruebas de integración y despliegue pendientes.** Este documento distingue lo ejecutado de lo preparado para que no parezca que la nueva versión ya se probó contra Neon.

## Verificado en este entorno

- `node --check` en los archivos JS del backend y tests: **sin errores de sintaxis**.
- Análisis de los 7 archivos `.jsx`/`.js` de React con el transpilador TypeScript JSX: **sin errores sintácticos**.
- `node --test backend/tests/passwords.test.js`: **3/3 pruebas aprobadas** (hash y verificación con scrypt; sal distinta en cada hash; longitud válida de contraseña).
- Comprobación de que los archivos `.env` reales no están en el repositorio: pendiente de repetir justo antes de la publicación.

## Preparado, no ejecutado acá

Se sustituyó la suite antigua (basada en usuario demo compartido) por `backend/tests/api.test.js`. Usa Supertest y mocks de `pool.query`, sin alterar Neon. Cubre catálogo, búsqueda parametrizada, registro, duplicados, login inválido, acceso autenticado, favoritos por usuario, validaciones de reseñas, autor de reseña, foros públicos y creación protegida.

**No se puede marcar como «aprobada»**: la instalación `npm ci` no completó en este entorno (dependencias externas no disponibles). También falta correr `npm run build` y `npm run lint` de frontend. Ejecutar en PC:

```bash
cd backend
npm ci
npm test
cd ../frontend
npm ci
npm run build
npm run lint
```

Registrar resultados reales al finalizar, corregir errores antes de desplegar y no asumir éxito por la revisión sintáctica.

## Pruebas manuales pendientes después de SQL 003/004 y deploy

| Caso | Esperado |
|---|---|
| Catálogo y filtros | Muestra juegos y filtra por nombre y género |
| Ficha y enlaces | Enlace HTTPS válido y requisitos consultados en tienda oficial |
| Registro | Crea cuenta con contraseña >=12 y no admite duplicados |
| Login/logout | Recupera sesión válida y la revoca al cerrar |
| Favoritos | Guardar/quitar persiste tras recargar |
| Dos usuarios | Bibliotecas diferentes, sin filtrar datos de otro usuario |
| Reseñas | Rango 1–5, longitud 10–500, autor correcto |
| Foros | Hilo y respuesta, filtro por juego, eliminación solo por autor |
| Noticias | Publicaciones editoriales, no noticias inventadas |
| Móvil y escritorio | Menú, tarjetas y formularios utilizables |
| Apariencia | Claro/oscuro y preferencia guardada |
| Errores de API | 400/401/404/409/503 apropiados |
| Recarga y privacidad | Sesión/favoritos persistentes solo para usuario activo |

## Limitaciones

Las pruebas de rutas usan mocks de PostgreSQL, no prueban conexiones TLS, integridad real de migraciones, concurrencia, rendimiento, CORS desde Netlify ni un usuario real en producción. El MVP no incorpora recuperación/verificación de correo ni moderación robusta. Se recomienda beta controlada antes de hacer público el registro.
