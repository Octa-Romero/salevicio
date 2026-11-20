import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { pool } from '../db/pool.js';
import { crearHash, verificarHash, passwordValida } from '../security/passwords.js';
import { crearSesion, requerirSesion } from '../security/sesion.js';
const router = Router();
const limitar = (limit, windowMs) => rateLimit({limit, windowMs, standardHeaders:'draft-8', legacyHeaders:false, message:{error:'Demasiados intentos. Probá más tarde.'}});
const nombreValido = n => typeof n==='string' && /^[\p{L}\p{N}_-]{3,30}$/u.test(n);
const emailValido = e => typeof e==='string' && e.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const error500 = (res,e) => { console.error('Error autenticación:',e.message); return res.status(500).json({error:'No se pudo completar la operación'}); };
router.post('/registro',limitar(10,3600000),async(req,res)=>{
  const nombre=typeof req.body?.nombre==='string'?req.body.nombre.trim():'';
  const email=typeof req.body?.email==='string'?req.body.email.trim().toLowerCase():'';
  const password=req.body?.password;
  if(!nombreValido(nombre)||!emailValido(email)||!passwordValida(password)) return res.status(400).json({error:'Usuario de 3 a 30 caracteres, email válido y contraseña de mínimo 12 caracteres'});
  try {
    const hash=await crearHash(password);
    const r=await pool.query('INSERT INTO usuarios(nombre,email,password_hash) VALUES($1,$2,$3) RETURNING id,nombre,email,creado_en',[nombre,email,hash]);
    const sesion=await crearSesion(r.rows[0].id);
    return res.status(201).json({usuario:r.rows[0],...sesion});
  }catch(e){if(e.code==='23505')return res.status(409).json({error:'Ya existe un usuario o correo con esos datos'});return error500(res,e);}
});
router.post('/login',limitar(15,900000),async(req,res)=>{
  const email=typeof req.body?.email==='string'?req.body.email.trim().toLowerCase():'';
  const password=req.body?.password;
  if(!emailValido(email)||typeof password!=='string'||password.length>128) return res.status(400).json({error:'Ingresá un correo y contraseña válidos'});
  try{
    const r=await pool.query('SELECT id,nombre,email,creado_en,password_hash FROM usuarios WHERE LOWER(email)=$1',[email]);
    const u=r.rows[0];
    const valida=u?.password_hash?await verificarHash(password,u.password_hash):await (async()=>{await crearHash(password);return false;})();
    if(!valida)return res.status(401).json({error:'Correo o contraseña incorrectos'});
    const {password_hash,...usuario}=u;
    return res.json({usuario,...await crearSesion(usuario.id)});
  }catch(e){return error500(res,e);}
});
router.get('/me',requerirSesion,(req,res)=>res.json({usuario:req.usuario}));
router.post('/logout',requerirSesion,async(req,res)=>{
  try{await pool.query('DELETE FROM sesiones WHERE token_hash=$1',[req.tokenHash]);res.json({mensaje:'Sesión cerrada'});}catch(e){error500(res,e);}
});
export default router;
