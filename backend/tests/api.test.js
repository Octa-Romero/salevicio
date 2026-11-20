import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { hashToken } from '../src/security/sesion.js';
import { pool } from '../src/db/pool.js';
import juegosRouter from '../src/routes/juegos.routes.js';
import comunidadRouter from '../src/routes/comunidad.routes.js';
import authRouter from '../src/routes/auth.routes.js';
import forosRouter from '../src/routes/foros.routes.js';

// Suite aislada: sustituye consultas SQL, nunca escribe en Neon.
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/juegos', juegosRouter);
app.use('/api', comunidadRouter);
app.use('/api', forosRouter);

const token = Buffer.alloc(32, 7).toString('base64url');
const auth = { Authorization: `Bearer ${token}` };
const usuario = { id: 12, nombre: 'Tester', email: 'tester@example.com', creado_en: '2026-11-20T00:00:00.000Z' };

// En cada caso comprobamos la consulta y sus parámetros cuando hace falta.
function simular(t, pasos) {
  let indice = 0;
  t.mock.method(pool, 'query', async (sql, parametros = []) => {
    assert.ok(indice < pasos.length, `Consulta no esperada: ${String(sql).slice(0, 80)}`);
    const paso = pasos[indice++];
    if (paso.sql) assert.match(String(sql), paso.sql);
    if (paso.params) assert.deepEqual(parametros, paso.params);
    if (paso.error) throw Object.assign(new Error(paso.error), { code: paso.code });
    return { rows: paso.rows ?? [] };
  });
  return () => assert.equal(indice, pasos.length, 'Se ejecutaron todas las consultas previstas');
}
function sesion(rows = [usuario]) {
  return { sql: /FROM sesiones s JOIN usuarios/, params: [hashToken(token)], rows };
}

test('GET /api/juegos devuelve catálogo público', async t => {
  const done = simular(t, [{ sql: /FROM juegos/, params: ['%%'], rows: [{ id: 1, titulo: 'Hollow Knight' }] }]);
  const res = await request(app).get('/api/juegos').expect(200);
  assert.equal(res.body[0].titulo, 'Hollow Knight'); done();
});
test('GET /api/juegos busca por nombre de forma parametrizada', async t => {
  const done = simular(t, [{ sql: /ILIKE \$1/, params: ['%Celeste%'], rows: [] }]);
  await request(app).get('/api/juegos?buscar=Celeste').expect(200); done();
});
test('GET /api/juegos/:id rechaza ID inválido', async () => {
  await request(app).get('/api/juegos/abc').expect(400);
});
test('GET /api/juegos/:id devuelve 404 si falta', async t => {
  const done = simular(t, [{ sql: /WHERE id = \$1/, params: [999], rows: [] }]);
  await request(app).get('/api/juegos/999').expect(404); done();
});
test('POST /api/auth/registro valida contraseñas cortas', async () => {
  const res = await request(app).post('/api/auth/registro').send({ nombre: 'Tester', email: 'tester@example.com', password: 'corta' }).expect(400);
  assert.match(res.body.error, /12 caracteres/);
});
test('POST /api/auth/registro crea usuario y sesión', async t => {
  const done = simular(t, [
    { sql: /INSERT INTO usuarios/, rows: [usuario] },
    { sql: /INSERT INTO sesiones/, rows: [] },
  ]);
  const res = await request(app).post('/api/auth/registro').send({ nombre: 'Tester', email: 'tester@example.com', password: 'una-clave-muy-segura-2026' }).expect(201);
  assert.equal(res.body.usuario.nombre, 'Tester');
  assert.equal(typeof res.body.token, 'string'); done();
});
test('POST /api/auth/registro rechaza nombre/correo duplicados', async t => {
  const done = simular(t, [{ sql: /INSERT INTO usuarios/, error: 'unique_violation', code: '23505' }]);
  await request(app).post('/api/auth/registro').send({ nombre: 'Tester', email: 'tester@example.com', password: 'una-clave-muy-segura-2026' }).expect(409); done();
});
test('POST /api/auth/login rechaza contraseña incorrecta', async t => {
  const done = simular(t, [{ sql: /FROM usuarios WHERE LOWER\(email\)/, rows: [] }]);
  await request(app).post('/api/auth/login').send({ email: 'nadie@example.com', password: 'una-clave-muy-segura' }).expect(401); done();
});
test('GET /api/auth/me exige bearer token', async () => {
  await request(app).get('/api/auth/me').expect(401);
});
test('GET /api/auth/me devuelve el usuario de la sesión', async t => {
  const done = simular(t, [sesion()]);
  const res = await request(app).get('/api/auth/me').set(auth).expect(200);
  assert.equal(res.body.usuario.id, usuario.id); done();
});
test('GET /api/favoritos exige iniciar sesión', async () => {
  await request(app).get('/api/favoritos').expect(401);
});
test('GET /api/favoritos usa el ID del usuario autenticado', async t => {
  const done = simular(t, [sesion(), { sql: /FROM favoritos f/, params: [usuario.id], rows: [] }]);
  await request(app).get('/api/favoritos').set(auth).expect(200); done();
});
test('POST /api/favoritos rechaza IDs incorrectos', async t => {
  const done = simular(t, [sesion()]);
  await request(app).post('/api/favoritos').set(auth).send({ juego_id: 'abc' }).expect(400); done();
});
test('POST /api/favoritos rechaza juegos inexistentes', async t => {
  const done = simular(t, [sesion(), { sql: /SELECT id FROM juegos/, rows: [] }]);
  await request(app).post('/api/favoritos').set(auth).send({ juego_id: 999 }).expect(404); done();
});
test('POST /api/favoritos detecta duplicado', async t => {
  const done = simular(t, [sesion(), { sql: /SELECT id FROM juegos/, rows: [{ id: 1 }] }, { sql: /INSERT INTO favoritos/, params: [usuario.id, 1], rows: [] }]);
  await request(app).post('/api/favoritos').set(auth).send({ juego_id: 1 }).expect(409); done();
});
test('POST /api/favoritos agrega un favorito personal', async t => {
  const done = simular(t, [sesion(), { sql: /SELECT id FROM juegos/, rows: [{ id: 1 }] }, { sql: /INSERT INTO favoritos/, params: [usuario.id, 1], rows: [{ id: 1 }] }]);
  await request(app).post('/api/favoritos').set(auth).send({ juego_id: 1 }).expect(201); done();
});
test('POST /api/juegos/:id/resenas rechaza puntuación inválida', async t => {
  const done = simular(t, [sesion()]);
  await request(app).post('/api/juegos/1/resenas').set(auth).send({ puntuacion: 8, comentario: 'Un comentario suficientemente largo' }).expect(400); done();
});
test('POST /api/juegos/:id/resenas exige comentario de 10 caracteres', async t => {
  const done = simular(t, [sesion()]);
  await request(app).post('/api/juegos/1/resenas').set(auth).send({ puntuacion: 5, comentario: 'Corto' }).expect(400); done();
});
test('POST /api/juegos/:id/resenas publica reseña con autor', async t => {
  const done = simular(t, [sesion(), { sql: /SELECT id FROM juegos/, rows: [{ id: 1 }] }, { sql: /INSERT INTO resenas/, params: [usuario.id, '1', 5, 'Excelente juego de prueba'], rows: [{ id: 30, comentario: 'Excelente juego de prueba', puntuacion: 5 }] }]);
  const res = await request(app).post('/api/juegos/1/resenas').set(auth).send({ puntuacion: 5, comentario: 'Excelente juego de prueba' }).expect(201);
  assert.equal(res.body.nombre, 'Tester'); done();
});
test('GET /api/foros es público', async t => {
  const done = simular(t, [{ sql: /FROM hilos h/, params: [null], rows: [] }]);
  await request(app).get('/api/foros').expect(200); done();
});
test('POST /api/foros exige autenticación', async () => {
  await request(app).post('/api/foros').send({}).expect(401);
});
test('POST /api/foros valida título y contenido', async t => {
  const done = simular(t, [sesion()]);
  await request(app).post('/api/foros').set(auth).send({ juego_id: 1, titulo: 'Corto', contenido: 'No' }).expect(400); done();
});
test('POST /api/foros crea un hilo ligado a un juego', async t => {
  const done = simular(t, [sesion(), { sql: /SELECT id FROM juegos/, rows: [{ id: 1 }] }, { sql: /INSERT INTO hilos/, rows: [{ id: 4, titulo: 'Qué opinan de Hollow Knight', juego_id: 1 }] }]);
  const res = await request(app).post('/api/foros').set(auth).send({ juego_id: 1, titulo: 'Qué opinan de Hollow Knight', contenido: 'Me gusta el diseño de niveles y la música del juego.' }).expect(201);
  assert.equal(res.body.autor, 'Tester'); done();
});
