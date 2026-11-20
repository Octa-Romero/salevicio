import test from 'node:test';
import assert from 'node:assert/strict';
import { crearHash, verificarHash, passwordValida } from '../src/security/passwords.js';

// Seguridad sin dependencias externas ni base de datos.
test('la contraseña nunca se almacena en claro', async () => {
  const clave = 'Clave-de-prueba-SaleVicio-2026';
  const resultado = await crearHash(clave);
  assert.match(resultado, /^scrypt\$32768\$/);
  assert.ok(!resultado.includes(clave));
  assert.equal(await verificarHash(clave, resultado), true);
  assert.equal(await verificarHash('otra-clave-incorrecta', resultado), false);
});
test('cada cuenta recibe una sal criptográfica distinta', async () => {
  const a = await crearHash('Clave-de-prueba-SaleVicio-2026');
  const b = await crearHash('Clave-de-prueba-SaleVicio-2026');
  assert.notEqual(a, b);
});
test('se rechazan claves demasiado cortas y demasiado largas', () => {
  assert.equal(passwordValida('corta'), false);
  assert.equal(passwordValida('123456789012'), true);
  assert.equal(passwordValida('x'.repeat(129)), false);
});
