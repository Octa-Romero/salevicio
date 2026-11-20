import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { pool } from '../db/pool.js';
import { requerirSesion } from '../security/sesion.js';
const router=Router();
const limite=rateLimit({windowMs:3600000,limit:15,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Demasiadas publicaciones. Probá más tarde.'}});
const id=v=>/^\d+$/.test(String(v))&&Number.isSafeInteger(Number(v))&&Number(v)>0;
const error=(res,e)=>{console.error('Foro:',e.message);res.status(500).json({error:'No se pudo consultar la comunidad'});};
router.get('/novedades',async(_req,res)=>{
 try{const r=await pool.query('SELECT id,titulo,resumen,tipo,fuente_url,publicado_en FROM novedades ORDER BY publicado_en DESC,id DESC LIMIT 20');res.json(r.rows);}catch(e){error(res,e);}
});
router.get('/mi/hilos',requerirSesion,async(req,res)=>{
 try{const r=await pool.query(`SELECT h.id,h.titulo,h.contenido,h.juego_id,h.creado_en,j.titulo AS juego_titulo FROM hilos h JOIN juegos j ON j.id=h.juego_id WHERE h.usuario_id=$1 ORDER BY h.creado_en DESC LIMIT 50`,[req.usuario.id]);res.json(r.rows);}catch(e){error(res,e);}
});
router.get('/foros',async(req,res)=>{
 const juego=req.query.juego_id;if(juego!==undefined&&!id(juego))return res.status(400).json({error:'ID de juego inválido'});
 try{const r=await pool.query(`SELECT h.id,h.titulo,h.contenido,h.creado_en,h.juego_id,u.nombre AS autor,j.titulo AS juego_titulo,(SELECT COUNT(*)::integer FROM respuestas_hilo m WHERE m.hilo_id=h.id) AS respuestas FROM hilos h JOIN usuarios u ON u.id=h.usuario_id JOIN juegos j ON j.id=h.juego_id WHERE ($1::integer IS NULL OR h.juego_id=$1) ORDER BY h.creado_en DESC LIMIT 50`,[juego||null]);res.json(r.rows);}catch(e){error(res,e);}
});
router.get('/foros/:id',async(req,res)=>{
 if(!id(req.params.id))return res.status(400).json({error:'ID inválido'});
 try{const r=await pool.query(`SELECT h.id,h.titulo,h.contenido,h.creado_en,h.usuario_id,h.juego_id,u.nombre AS autor,j.titulo AS juego_titulo FROM hilos h JOIN usuarios u ON u.id=h.usuario_id JOIN juegos j ON j.id=h.juego_id WHERE h.id=$1`,[req.params.id]);
 if(!r.rows.length)return res.status(404).json({error:'Hilo no encontrado'});
 const m=await pool.query(`SELECT m.id,m.contenido,m.creado_en,m.usuario_id,u.nombre AS autor FROM respuestas_hilo m JOIN usuarios u ON u.id=m.usuario_id WHERE m.hilo_id=$1 ORDER BY m.creado_en ASC LIMIT 100`,[req.params.id]);res.json({...r.rows[0],mensajes:m.rows});}catch(e){error(res,e);}
});
router.post('/foros',requerirSesion,limite,async(req,res)=>{
 const {titulo,contenido,juego_id}=req.body??{};
 if(!id(juego_id)||typeof titulo!=='string'||titulo.trim().length<8||titulo.trim().length>120||typeof contenido!=='string'||contenido.trim().length<20||contenido.trim().length>2000)return res.status(400).json({error:'Elegí juego, título de 8 a 120 y contenido de 20 a 2000 caracteres'});
 try{const j=await pool.query('SELECT id FROM juegos WHERE id=$1',[juego_id]);if(!j.rows.length)return res.status(404).json({error:'Juego no encontrado'});
 const r=await pool.query('INSERT INTO hilos(juego_id,usuario_id,titulo,contenido) VALUES($1,$2,$3,$4) RETURNING id,juego_id,titulo,contenido,creado_en',[juego_id,req.usuario.id,titulo.trim(),contenido.trim()]);res.status(201).json({...r.rows[0],autor:req.usuario.nombre});}catch(e){error(res,e);}
});
router.post('/foros/:id/respuestas',requerirSesion,limite,async(req,res)=>{
 const contenido=req.body?.contenido;if(!id(req.params.id)||typeof contenido!=='string'||contenido.trim().length<3||contenido.trim().length>1000)return res.status(400).json({error:'La respuesta debe tener entre 3 y 1000 caracteres'});
 try{const h=await pool.query('SELECT id FROM hilos WHERE id=$1',[req.params.id]);if(!h.rows.length)return res.status(404).json({error:'Hilo no encontrado'});
 const r=await pool.query('INSERT INTO respuestas_hilo(hilo_id,usuario_id,contenido) VALUES($1,$2,$3) RETURNING id,contenido,creado_en,usuario_id',[req.params.id,req.usuario.id,contenido.trim()]);res.status(201).json({...r.rows[0],autor:req.usuario.nombre});}catch(e){error(res,e);}
});
router.delete('/foros/:id',requerirSesion,limite,async(req,res)=>{
 if(!id(req.params.id))return res.status(400).json({error:'ID inválido'});
 try{const r=await pool.query('DELETE FROM hilos WHERE id=$1 AND usuario_id=$2 RETURNING id',[req.params.id,req.usuario.id]);if(!r.rows.length)return res.status(404).json({error:'Hilo inexistente o no autorizado'});res.json({mensaje:'Hilo eliminado'});}catch(e){error(res,e);}
});
export default router;
