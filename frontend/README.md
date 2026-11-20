
# SaleVicio 🎮

Plataforma comunitaria para descubrir, explorar
y reseñar videojuegos.

## Descripción

SaleVicio permite consultar un catálogo de videojuegos,
buscar títulos, acceder a sus plataformas oficiales,
guardar favoritos y publicar reseñas con puntuaciones.

## Tecnologías

- React + Vite
- Node.js + Express
- PostgreSQL + Neon
- Netlify (frontend)
- Render (backend)
- Git + GitHub

## Acceso público

- Frontend: AGREGAR_URL_DE_NETLIFY
- API: AGREGAR_URL_DE_RENDER
- Estado de API: AGREGAR_URL_DE_RENDER/api/health

## Ejecución local

Requisitos: Node.js y npm.

Backend:

    cd backend
    npm ci
    npm run dev

Frontend (otra terminal):

    cd frontend
    npm ci
    npm run dev

Configurar DATABASE_URL en backend/.env.
Los archivos .env no se suben al repositorio.

## Pruebas

Backend:

    cd backend
    npm test

Frontend:

    cd frontend
    npm run build

El informe de pruebas está en docs/TEST_REPORT.md.

## Documentación

- docs/SPEC.md: requisitos y reglas de negocio.
- docs/PLAN.md: planificación.
- docs/TASKS.md: seguimiento de tareas.
- docs/TEST_REPORT.md: pruebas realizadas.
- AGENTS.md: instrucciones para agentes.

## Limitaciones

El prototipo utiliza un usuario de demostración
compartido, sin registro ni autenticación individual.

Los favoritos y reseñas son públicos y compartidos.
No deben ingresarse datos personales.

## Derechos de autor

SaleVicio es un proyecto académico independiente.

Los videojuegos mencionados pertenecen a sus
respectivos titulares. La plataforma dirige a sus
sitios oficiales y no distribuye sus ejecutables.

Se utilizan recursos gráficos propios o autorizados.
