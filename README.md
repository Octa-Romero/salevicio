# SaleVicio 2.0 🎮

**Plataforma comunitaria independiente** para descubrir videojuegos, crear una biblioteca personal, escribir reseñas y conversar en foros por juego. Diseño responsive azul noche y amarillo, con ilustraciones gráficas originales en CSS/SVG.

## Estado del proyecto

**Versión 2.0 — código preparado para despliegue; todavía no publicado ni validado contra Neon real.** La versión anterior puede seguir funcionando en Netlify/Render hasta que se apliquen las migraciones y se despliegue esta versión.

### Incluido

- Exploración pública de juegos, búsqueda y filtro por género.
- Fichas: descripción original, género, plataforma, desarrollador, año y enlace a tienda oficial HTTPS.
- Acceso a requisitos de sistema desde la página oficial del juego (no se almacenan especificaciones cambiantes).
- Registro e inicio de sesión individuales; tokens de sesión revocables.
- Biblioteca privada de favoritos, reseñas del usuario y sus hilos.
- Foros por juego, respuestas y eliminación de hilos propios.
- Reseñas públicas con autor, puntuación del 1 al 5 y validaciones.
- Hero con destacado gráfico del juego favorito (si existe) o arte genérico de SaleVicio.
- Novedades **editoriales de la plataforma**, sin inventar actualizaciones de videojuegos.
- Apariencia clara/oscura guardada por navegador, ayuda y enlace para informar problemas en GitHub.
- Adaptación a pantallas de escritorio, tablet y celular.

### No incluido todavía

- Noticias automáticas de estudios/desarrolladoras, precios en tiempo real, API externa de metadatos, scraping de portadas, descarga de juegos, amigos/mensajería, correo de recuperación, verificación de email, moderación avanzada ni administración.
- Publicación automática de esta versión en tus servicios existentes. Se debe desplegar después de migrar la base.

## Arquitectura

```text
Netlify (React + Vite)
        | HTTPS / REST + bearer token
Render (Node.js + Express)
        | SQL parametrizado / TLS
Neon (PostgreSQL)
```

El navegador consulta la API propia de SaleVicio: **no necesitamos una API externa** para catálogo editorial, registro, favoritos, reseñas, hilos ni noticias del sitio. Las actualizaciones reales de juegos se podrán añadir en una versión futura con una fuente autorizada, y las especificaciones del sistema se consultan en los enlaces oficiales.

## Estructura

```text
frontend/           React, estilos, assets originales
backend/src/        API, rutas, autenticación y acceso a PostgreSQL
backend/sql/        Esquema original + migraciones no destructivas
backend/tests/      Pruebas unitarias y de rutas (BD simulada)
docs/               Especificación, tareas, pruebas y guía de despliegue
AGENTS.md           Convenciones de trabajo
```

## Instalar y ejecutar localmente

Requisitos: **Node.js 22 o superior**, npm y una base PostgreSQL de desarrollo. En dos terminales:

**Backend:**

```bash
cd backend
npm ci
cp .env.example .env
# Editar .env para agregar tu DATABASE_URL de Neon (nunca subir el .env)
npm run dev
```

**Frontend:**

```bash
cd frontend
npm ci
cp .env.example .env
# VITE_API_URL=http://localhost:3000
npm run dev
```

En Windows/Git Bash también funciona `cp`. El frontend suele abrir en `http://localhost:5173` y el backend en `http://localhost:3000`.

**Atención:** el backend 2.0 requiere que apliques previamente `backend/sql/003_cuentas_y_comunidad.sql` y `backend/sql/004_catalogo.sql` en la base elegida. No ejecutes `001`/`002` de nuevo sobre producción: esos archivos documentan el esquema inicial. Leé **[docs/DEPLOY_V2.md](docs/DEPLOY_V2.md)** antes de tocar Neon.

## Variables de entorno

| Servicio | Nombre | Ejemplo / propósito |
|---|---|---|
| Backend | `DATABASE_URL` | Cadena privada PostgreSQL, por ejemplo obtenida en Neon. **Secreta.** |
| Backend | `FRONTEND_URL` | `https://salevicio.netlify.app` — origen exacto, sin `/` final |
| Backend | `NODE_ENV` | `production` en Render |
| Frontend | `VITE_API_URL` | `https://salevicio-api.onrender.com` — URL pública de la API |

`DATABASE_URL` nunca va en Netlify, en GitHub ni en archivos de frontend. Las variables `VITE_` son públicas y se incorporan **al compilar** React: si se modifican en Netlify, volver a desplegar.

## Endpoints REST

| Método | Endpoint | Acceso |
|---|---|---|
| GET | `/api/health` | Público |
| GET | `/api/health/db` | Público; verifica conectividad |
| GET | `/api/juegos?buscar=...` | Público |
| GET | `/api/juegos/:id` | Público |
| POST | `/api/auth/registro` | Público; `{ "nombre", "email", "password" }` |
| POST | `/api/auth/login` | Público; `{ "email", "password" }` |
| GET | `/api/auth/me` | Autenticado |
| POST | `/api/auth/logout` | Autenticado |
| GET, POST | `/api/favoritos` | Autenticado; POST `{ "juego_id": 1 }` |
| DELETE | `/api/favoritos/:id` | Autenticado |
| GET | `/api/juegos/:id/resenas` | Público |
| POST | `/api/juegos/:id/resenas` | Autenticado; `{ "puntuacion": 5, "comentario": "..." }` |
| GET | `/api/mi/resenas` | Autenticado |
| GET | `/api/mi/hilos` | Autenticado |
| GET | `/api/foros?juego_id=...` | Público |
| GET | `/api/foros/:id` | Público |
| POST | `/api/foros` | Autenticado; `{ "juego_id", "titulo", "contenido" }` |
| POST | `/api/foros/:id/respuestas` | Autenticado; `{ "contenido" }` |
| DELETE | `/api/foros/:id` | Solo autor |
| GET | `/api/novedades` | Público |

Para rutas autenticadas: encabezado `Authorization: Bearer <token>`. La respuesta de `/api/auth/registro` o `/api/auth/login` incluye un token generado aleatoriamente.

## Seguridad básica

- Hash de contraseñas con **scrypt**, sal aleatoria y comparación resistente a timing; nunca texto plano.
- Contraseña de al menos 12 caracteres; limitación de intentos de login, registro y publicaciones.
- Tokens opacos aleatorios: **la base almacena SHA-256 del token**, fecha de expiración de 7 días y revocación en logout.
- Token del navegador en `sessionStorage` (se elimina al cerrar la pestaña/sesión de navegador según su comportamiento). No se usa una cookie que se envíe automáticamente en solicitudes de terceros.
- SQL parametrizado, validaciones, CORS restringido y headers HTTP de endurecimiento.
- El usuario demo anterior permanece en la base para conservar datos antiguos, pero **no tiene contraseña** y no se puede usar para iniciar sesión.

**Alcance de seguridad:** esta versión es un MVP funcional, no un servicio de cuentas plenamente auditado. Antes de invitar a usuarios reales conviene añadir confirmación de correo, recuperación de contraseña, política de privacidad, mecanismos de reporte/moderación, eliminación/exportación de datos, límites persistentes y observabilidad. No recopilar datos sensibles.

## Pruebas

```bash
cd backend
npm ci
npm test
cd ../frontend
npm ci
npm run build
npm run lint
```

Ver resultados comprobados y pendientes en **[docs/TEST_REPORT.md](docs/TEST_REPORT.md)**.

## Publicar la versión 2.0

Ver **[docs/DEPLOY_V2.md](docs/DEPLOY_V2.md)**. **Orden: copia/ramificación de Neon → SQL 003 → SQL 004 → despliegue Render → probar API → despliegue Netlify → probar el flujo completo.** No necesitás crear otra base. Los cambios solo se aplican cuando vos los subís y desplegás.

## Enlaces

- Web existente (v1 hasta nuevo despliegue): https://salevicio.netlify.app
- Backend existente: https://salevicio-api.onrender.com/api/health
- GitHub: https://github.com/Octa-Romero/salevicio

## Derechos de autor

SaleVicio es una plataforma independiente no afiliada a estudios ni tiendas. Los nombres de juegos se usan como referencia informativa. No aloja juegos, assets oficiales, archivos de instalación ni carátulas de terceros: las imágenes de las tarjetas son composiciones gráficas propias. Los links apuntan a tiendas oficiales para consultar disponibilidad, detalles y requisitos.
