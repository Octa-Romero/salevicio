import { randomBytes, scrypt as callback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(callback);
const opts = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
export const passwordValida = p => typeof p === 'string' && p.length >= 12 && p.length <= 128 && Buffer.byteLength(p, 'utf8') <= 512;
export async function crearHash(password) {
  const salt = randomBytes(16).toString('base64url');
  const hash = await scrypt(password, salt, 64, opts);
  return `scrypt$32768$${salt}$${hash.toString('base64url')}`;
}
export async function verificarHash(password, valor) {
  if (typeof valor !== 'string' || typeof password !== 'string') return false;
  const [algoritmo, costo, salt, hash] = valor.split('$');
  if (algoritmo !== 'scrypt' || costo !== '32768' || !salt || !hash) return false;
  try {
    const esperado = Buffer.from(hash, 'base64url');
    if (esperado.length !== 64) return false;
    const real = await scrypt(password, salt, 64, opts);
    return timingSafeEqual(real, esperado);
  } catch { return false; }
}
