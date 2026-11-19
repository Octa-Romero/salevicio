
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { pool } from '../db/pool.js';

const router = Router();
const NOMBRE_DEMO = 'Visitante demo';

const limiteEscrituras = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Demasiadas operaciones. Intentá más tarde.'
  }
});

function idValido(valor) {
  return /^\d+$/.test(String(valor)) &&
    Number.isSafeInteger(Number(valor)) &&
    Number(valor) > 0 &&
    Number(valor) <= 2147483647;
}

async function obtenerUsuarioDemo() {
  const resultado = await pool.query(
    'SELECT id FROM usuarios WHERE nombre = $1',
    [NOMBRE_DEMO]
  );

  if (!resultado.rows.length) {
    throw new Error('Falta crear el usuario de demostración');
  }

  return resultado.rows[0].id;
}

async function existeJuego(id) {
  const resultado = await pool.query(
    'SELECT id FROM juegos WHERE id = $1',
    [id]
  );

  return resultado.rows.length > 0;
}

function errorServidor(res, error) {
  console.error('Error en comunidad:', error.message);
  return res.status(500).json({
    error: 'Ocurrió un error en el servidor'
  });
}

// GET /api/favoritos
router.get('/favoritos', async (req, res) => {
  try {
    const usuarioId = await obtenerUsuarioDemo();

    const resultado = await pool.query(
      `SELECT j.id, j.titulo, j.genero, j.plataforma
       FROM favoritos f
       JOIN juegos j ON j.id = f.juego_id
       WHERE f.usuario_id = $1
       ORDER BY j.titulo`,
      [usuarioId]
    );

    res.json(resultado.rows);
  } catch (error) {
    errorServidor(res, error);
  }
});

// POST /api/favoritos
router.post('/favoritos', limiteEscrituras, async (req, res) => {
  try {
    const { juego_id } = req.body ?? {};

    if (!idValido(juego_id)) {
      return res.status(400).json({
        error: 'El ID del juego es inválido'
      });
    }

    if (!(await existeJuego(juego_id))) {
      return res.status(404).json({
        error: 'El videojuego no existe'
      });
    }

    const usuarioId = await obtenerUsuarioDemo();

    const resultado = await pool.query(
      `INSERT INTO favoritos (usuario_id, juego_id)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id, juego_id) DO NOTHING
       RETURNING id`,
      [usuarioId, juego_id]
    );

    if (!resultado.rows.length) {
      return res.status(409).json({
        error: 'Este juego ya está en favoritos'
      });
    }

    res.status(201).json({
      mensaje: 'Juego agregado a favoritos'
    });
  } catch (error) {
    errorServidor(res, error);
  }
});

// DELETE /api/favoritos/:id
// El parámetro representa el ID del JUEGO.
router.delete('/favoritos/:id', limiteEscrituras, async (req, res) => {
  try {
    if (!idValido(req.params.id)) {
      return res.status(400).json({
        error: 'ID inválido'
      });
    }

    const usuarioId = await obtenerUsuarioDemo();

    const resultado = await pool.query(
      `DELETE FROM favoritos
       WHERE usuario_id = $1 AND juego_id = $2
       RETURNING id`,
      [usuarioId, req.params.id]
    );

    if (!resultado.rows.length) {
      return res.status(404).json({
        error: 'El juego no está en favoritos'
      });
    }

    res.json({ mensaje: 'Favorito eliminado' });
  } catch (error) {
    errorServidor(res, error);
  }
});

// GET /api/juegos/:id/resenas
router.get('/juegos/:id/resenas', async (req, res) => {
  try {
    const { id } = req.params;

    if (!idValido(id)) {
      return res.status(400).json({
        error: 'ID de juego inválido'
      });
    }

    if (!(await existeJuego(id))) {
      return res.status(404).json({
        error: 'El videojuego no existe'
      });
    }

    const resultado = await pool.query(
      `SELECT r.id, r.puntuacion, r.comentario,
              r.fecha, u.nombre
       FROM resenas r
       JOIN usuarios u ON u.id = r.usuario_id
       WHERE r.juego_id = $1
       ORDER BY r.fecha DESC, r.id DESC
       LIMIT 100`,
      [id]
    );

    res.json(resultado.rows);
  } catch (error) {
    errorServidor(res, error);
  }
});

// POST /api/juegos/:id/resenas
router.post(
  '/juegos/:id/resenas',
  limiteEscrituras,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { puntuacion, comentario } = req.body ?? {};

      if (!idValido(id)) {
        return res.status(400).json({
          error: 'ID de juego inválido'
        });
      }

      if (
        !Number.isInteger(puntuacion) ||
        puntuacion < 1 ||
        puntuacion > 5
      ) {
        return res.status(400).json({
          error: 'La puntuación debe estar entre 1 y 5'
        });
      }

      if (typeof comentario !== 'string') {
        return res.status(400).json({
          error: 'El comentario debe ser texto'
        });
      }

      const texto = comentario.trim();
      const longitud = Array.from(texto).length;

      if (longitud < 10 || longitud > 500) {
        return res.status(400).json({
          error: 'La reseña debe tener entre 10 y 500 caracteres'
        });
      }

      if (!(await existeJuego(id))) {
        return res.status(404).json({
          error: 'El videojuego no existe'
        });
      }

      const usuarioId = await obtenerUsuarioDemo();

      const resultado = await pool.query(
        `INSERT INTO resenas (
           usuario_id, juego_id, puntuacion, comentario
         )
         VALUES ($1, $2, $3, $4)
         RETURNING id, puntuacion, comentario, fecha`,
        [usuarioId, id, puntuacion, texto]
      );

      res.status(201).json({
        ...resultado.rows[0],
        nombre: NOMBRE_DEMO
      });
    } catch (error) {
      errorServidor(res, error);
    }
  }
);

export default router;
