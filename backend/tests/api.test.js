
import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';

import juegosRouter from '../src/routes/juegos.routes.js';
import comunidadRouter from '../src/routes/comunidad.routes.js';
import { pool } from '../src/db/pool.js';

// Aplicación aislada para ejecutar pruebas.
const app = express();
app.use(express.json());
app.use('/api', comunidadRouter);
app.use('/api/juegos', juegosRouter);

// Simula respuestas de PostgreSQL.
// Nunca modifica los datos reales de Neon.
function simularBaseDeDatos(t, respuestas) {
  let indice = 0;

  t.mock.method(pool, 'query', async () => {
    if (indice >= respuestas.length) {
      throw new Error('Consulta SQL inesperada');
    }

    return { rows: respuestas[indice++] };
  });
}

// Catálogo
test('GET /api/juegos devuelve el catálogo', async (t) => {
  simularBaseDeDatos(t, [[
    { id: 1, titulo: 'Juego de prueba' }
  ]]);

  const respuesta = await request(app)
    .get('/api/juegos')
    .expect(200);

  assert.equal(respuesta.body.length, 1);
  assert.equal(respuesta.body[0].titulo, 'Juego de prueba');
});

test('Rechaza identificadores inválidos', async () => {
  const respuesta = await request(app)
    .get('/api/juegos/abc')
    .expect(400);

  assert.equal(respuesta.body.error, 'ID de juego inválido');
});

test('Devuelve 404 cuando el videojuego no existe', async (t) => {
  simularBaseDeDatos(t, [[]]);

  await request(app)
    .get('/api/juegos/999999')
    .expect(404);
});

// Favoritos
test('RN-001: rechaza un favorito duplicado', async (t) => {
  simularBaseDeDatos(t, [
    [{ id: 1 }], // El juego existe.
    [{ id: 1 }], // Usuario demo.
    []           // INSERT no agrega filas por duplicado.
  ]);

  const respuesta = await request(app)
    .post('/api/favoritos')
    .send({ juego_id: 1 })
    .expect(409);

  assert.match(respuesta.body.error, /ya está en favoritos/);
});

test('RN-002: rechaza favoritos de juegos inexistentes', async (t) => {
  simularBaseDeDatos(t, [[]]);

  await request(app)
    .post('/api/favoritos')
    .send({ juego_id: 999999 })
    .expect(404);
});

test('Permite agregar un favorito válido', async (t) => {
  simularBaseDeDatos(t, [
    [{ id: 1 }],
    [{ id: 1 }],
    [{ id: 10 }]
  ]);

  await request(app)
    .post('/api/favoritos')
    .send({ juego_id: 1 })
    .expect(201);
});

// Reseñas
test('RN-003: rechaza puntuaciones fuera de 1 a 5', async () => {
  const respuesta = await request(app)
    .post('/api/juegos/1/resenas')
    .send({
      puntuacion: 8,
      comentario: 'Un comentario suficientemente largo'
    })
    .expect(400);

  assert.match(respuesta.body.error, /puntuación/);
});

test('RN-004: rechaza reseñas demasiado cortas', async () => {
  await request(app)
    .post('/api/juegos/1/resenas')
    .send({
      puntuacion: 5,
      comentario: 'Corto'
    })
    .expect(400);
});

test('Permite publicar una reseña válida', async (t) => {
  simularBaseDeDatos(t, [
    [{ id: 1 }], // Juego existente.
    [{ id: 1 }], // Usuario demo.
    [{
      id: 10,
      puntuacion: 5,
      comentario: 'Excelente videojuego de prueba',
      fecha: '2026-11-19T12:00:00Z'
    }]
  ]);

  const respuesta = await request(app)
    .post('/api/juegos/1/resenas')
    .send({
      puntuacion: 5,
      comentario: 'Excelente videojuego de prueba'
    })
    .expect(201);

  assert.equal(respuesta.body.puntuacion, 5);
  assert.equal(respuesta.body.nombre, 'Visitante demo');
});
