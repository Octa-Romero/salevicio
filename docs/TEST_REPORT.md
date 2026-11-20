
# SaleVicio — Informe de pruebas

## 1. Objetivo
Verificar que las funcionalidades esenciales del prototipo
cumplen los requisitos y reglas de negocio establecidos
en la especificación funcional.

## 2. Entorno
- Backend: Node.js + Express.
- Frontend: React + Vite.
- Base de datos: PostgreSQL (Neon).
- Herramientas: node:test, Supertest y navegador web.

## 3. Pruebas automatizadas

Las pruebas se encuentran en backend/tests/api.test.js.

| ID | Caso | Resultado |
|---|---|---|
| P001 | Consultar catálogo | Pendiente |
| P002 | Rechazar ID inválido | Pendiente |
| P003 | Consultar juego inexistente | Pendiente |
| P004 | Rechazar favorito duplicado | Pendiente |
| P005 | Rechazar favorito inexistente | Pendiente |
| P006 | Agregar favorito válido | Pendiente |
| P007 | Rechazar puntuación inválida | Pendiente |
| P008 | Rechazar comentario corto | Pendiente |
| P009 | Publicar reseña válida | Pendiente |

## 4. Pruebas manuales

| ID | Caso | Resultado |
|---|---|---|
| M001 | Abrir catálogo en navegador | Pendiente |
| M002 | Buscar videojuegos | Pendiente |
| M003 | Filtrar por género | Pendiente |
| M004 | Consultar ficha individual | Pendiente |
| M005 | Abrir enlace oficial | Pendiente |
| M006 | Guardar y quitar favoritos | Pendiente |
| M007 | Publicar una reseña | Pendiente |
| M008 | Recargar y comprobar persistencia | Pendiente |
| M009 | Verificar diseño móvil | Pendiente |
| M010 | Compilar frontend | Pendiente |

## 5. Evidencia
Registrar los comandos ejecutados y sus resultados.

- npm test: pendiente.
- npm run build: pendiente.
- Comprobación de persistencia en Neon: pendiente.
- Comprobación del despliegue público: pendiente.

## 6. Limitaciones
El prototipo utiliza un usuario de demostración compartido.

Las pruebas automatizadas simulan respuestas de PostgreSQL.
Por lo tanto, no sustituyen las pruebas manuales de
persistencia contra la base de datos real.

La aplicación todavía requiere comprobar su despliegue,
seguridad y funcionamiento desde Internet.

## 7. Conclusión
Completar después de ejecutar y evaluar todas las pruebas.
