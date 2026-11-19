
import { Router } from 'express';
import { pool } from '../db/pool.js';

const router = Router();

// GET /api/juegos
// Consultar el catálogo y buscar por nombre.
router.get('/', async (req, res) => {
  try {
    const buscar = req.query.buscar ?? '';

    if (typeof buscar !== 'string' || buscar.length > 80) {
      return res.status(400).json({
        error: 'Búsqueda inválida'
      });
    }

    const resultado = await pool.query(
      `SELECT id, titulo, descripcion, genero,
              plataforma, enlace, imagen
       FROM juegos
       WHERE titulo ILIKE $1
       ORDER BY id ASC
       LIMIT 50`,
      [`%${buscar.trim()}%`]
    );

    res.json(resultado.rows);

  } catch (error) {
    console.error('Error al consultar juegos:', error.message);

    res.status(500).json({
      error: 'No se pudo consultar el catálogo'
    });
  }
});

// GET /api/juegos/:id
// Consultar los detalles de un juego.
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
      return res.status(400).json({
        error: 'ID de juego inválido'
      });
    }

    const resultado = await pool.query(
      `SELECT id, titulo, descripcion, genero,
              plataforma, enlace, imagen
       FROM juegos
       WHERE id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: 'Videojuego no encontrado'
      });
    }

    res.json(resultado.rows[0]);

  } catch (error) {
    console.error('Error al consultar juego:', error.message);

    res.status(500).json({
      error: 'No se pudo obtener el videojuego'
    });
  }
});

export default router;
