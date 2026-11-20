import { randomBytes, createHash } from 'node:crypto';
import { pool } from '../db/pool.js';
export const hashToken = token => createHash('sha256').update(token).digest('hex');
export async function crearSesion(usuarioId) {
  const token = randomBytes(32).toString('base64url');
  const expira_en = new Date(Date.now() + 7 * 86400000);
  await pool.query('INSERT INTO sesiones(usuario_id,token_hash,expira_en) VALUES($1,$2,$3)', [usuarioId, hashToken(token), expira_en]);
  return { token, expira_en: expira_en.toISOString() };
}
export async function requerirSesion(req, res, next) {
  const token = /^Bearer ([\w-]{43})$/.exec(req.get('authorization') || '')?.[1];
  if (!token) return res.status(401).json({ error: 'Iniciá sesión para continuar' });
  try {
    const r = await pool.query(`SELECT u.id,u.nombre,u.email,u.creado_en FROM sesiones s JOIN usuarios u ON u.id=s.usuario_id
      WHERE s.token_hash=$1 AND s.expira_en>NOW() AND u.password_hash IS NOT NULL`, [hashToken(token)]);
    if (!r.rows.length) return res.status(401).json({ error: 'Sesión vencida o inválida' });
    req.usuario = r.rows[0]; req.tokenHash = hashToken(token); next();
  } catch (e) { console.error('Error de sesiones:',e.message); res.status(503).json({error:'Servicio de sesiones no disponible'}); }
}
