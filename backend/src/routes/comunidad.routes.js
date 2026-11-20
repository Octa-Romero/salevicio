import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { pool } from '../db/pool.js';
import { requerirSesion } from '../security/sesion.js';
const router=Router();
const limite=rateLimit({windowMs:3600000,limit:40,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Demasiadas operaciones'}});
const idValido=v=>/^\d+$/.test(String(v))&&Number.isSafeInteger(Number(v))&&Number(v)>0&&Number(v)<2147483648;
const error500=(res,e)=>{console.error('Error comunidad:',e.message);return res.status(500).json({error:'Error del servidor'});};
async function juegoExiste(id){const r=await pool.query('SELECT id FROM juegos WHERE id=$1',[id]);return r.rows.length>0;}
router.get('/favoritos',requerirSesion,async(req,res)=>{
 try{const r=await pool.query(`SELECT j.id,j.titulo,j.descripcion,j.genero,j.plataforma,j.enlace,j.imagen,j.desarrollador,j.lanzamiento
 FROM favoritos f JOIN juegos j ON j.id=f.juego_id WHERE f.usuario_id=$1 ORDER BY f.id DESC`,[req.usuario.id]);res.json(r.rows);}catch(e){error500(res,e);}
});
router.post('/favoritos',requerirSesion,limite,async(req,res)=>{
 const id=req.body?.juego_id;if(!idValido(id))return res.status(400).json({error:'ID de juego inválido'});
 try{if(!await juegoExiste(id))return res.status(404).json({error:'El juego no existe'});
 const r=await pool.query(`INSERT INTO favoritos(usuario_id,juego_id) VALUES($1,$2) ON CONFLICT(usuario_id,juego_id) DO NOTHING RETURNING id`,[req.usuario.id,id]);
 if(!r.rows.length)return res.status(409).json({error:'Este juego ya está en favoritos'});res.status(201).json({mensaje:'Favorito guardado'});}catch(e){error500(res,e);}
});
router.delete('/favoritos/:id',requerirSesion,limite,async(req,res)=>{
 if(!idValido(req.params.id))return res.status(400).json({error:'ID inválido'});
 try{const r=await pool.query('DELETE FROM favoritos WHERE usuario_id=$1 AND juego_id=$2 RETURNING id',[req.usuario.id,req.params.id]);
 if(!r.rows.length)return res.status(404).json({error:'No está en favoritos'});res.json({mensaje:'Favorito eliminado'});}catch(e){error500(res,e);}
});
router.get('/juegos/:id/resenas',async(req,res)=>{
 if(!idValido(req.params.id))return res.status(400).json({error:'ID inválido'});
 try{if(!await juegoExiste(req.params.id))return res.status(404).json({error:'Juego no encontrado'});
 const r=await pool.query(`SELECT r.id,r.usuario_id,r.puntuacion,r.comentario,r.fecha,u.nombre FROM resenas r JOIN usuarios u ON u.id=r.usuario_id WHERE r.juego_id=$1 ORDER BY r.fecha DESC LIMIT 100`,[req.params.id]);res.json(r.rows);}catch(e){error500(res,e);}
});
router.post('/juegos/:id/resenas',requerirSesion,limite,async(req,res)=>{
 const {puntuacion,comentario}=req.body??{};
 if(!idValido(req.params.id))return res.status(400).json({error:'ID inválido'});
 if(!Number.isInteger(puntuacion)||puntuacion<1||puntuacion>5)return res.status(400).json({error:'La puntuación debe estar entre 1 y 5'});
 if(typeof comentario!=='string'||Array.from(comentario.trim()).length<10||Array.from(comentario.trim()).length>500)return res.status(400).json({error:'La reseña debe tener entre 10 y 500 caracteres'});
 try{if(!await juegoExiste(req.params.id))return res.status(404).json({error:'Juego no encontrado'});
 const r=await pool.query(`INSERT INTO resenas(usuario_id,juego_id,puntuacion,comentario) VALUES($1,$2,$3,$4) RETURNING id,puntuacion,comentario,fecha`,[req.usuario.id,req.params.id,puntuacion,comentario.trim()]);res.status(201).json({...r.rows[0],nombre:req.usuario.nombre});}catch(e){error500(res,e);}
});
router.get('/mi/resenas',requerirSesion,async(req,res)=>{
 try{const r=await pool.query(`SELECT r.id,r.juego_id,r.puntuacion,r.comentario,r.fecha,j.titulo AS juego_titulo FROM resenas r JOIN juegos j ON j.id=r.juego_id WHERE r.usuario_id=$1 ORDER BY r.fecha DESC LIMIT 50`,[req.usuario.id]);res.json(r.rows);}catch(e){error500(res,e);}
});
export default router;
