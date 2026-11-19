
import { useEffect, useState } from 'react';

const API = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

async function leerRespuesta(respuesta) {
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error || 'Error al comunicarse con la API');
  }

  return datos;
}

export function BibliotecaDemo({ onVer, revision }) {
  const [favoritos, setFavoritos] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        const respuesta = await fetch(`${API}/api/favoritos`);
        const datos = await leerRespuesta(respuesta);

        if (activo) {
          setFavoritos(datos);
          setError('');
        }
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => { activo = false; };
  }, [revision]);

  return (
    <section className="biblioteca-demo">
      <h2>♥ Biblioteca de favoritos</h2>
      <p>Biblioteca compartida del usuario de demostración.</p>

      {cargando ? (
        <p>Cargando favoritos...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : favoritos.length === 0 ? (
        <p>Todavía no hay videojuegos favoritos.</p>
      ) : (
        <div className="favoritos-lista">
          {favoritos.map(juego => (
            <button
              key={juego.id}
              onClick={() => onVer(juego.id)}
              className="favorito-item"
            >
              ♥ {juego.titulo} ↗
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export function Comunidad({ juego, onCambioFavoritos }) {
  const [favorito, setFavorito] = useState(false);
  const [resenas, setResenas] = useState([]);
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState('');

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargarComunidad() {
      setCargando(true);
      setError('');
      setMensaje('');

      try {
        const [respuestaFavoritos, respuestaResenas] =
          await Promise.all([
            fetch(`${API}/api/favoritos`),
            fetch(`${API}/api/juegos/${juego.id}/resenas`)
          ]);

        const [favoritos, opiniones] = await Promise.all([
          leerRespuesta(respuestaFavoritos),
          leerRespuesta(respuestaResenas)
        ]);

        if (activo) {
          setFavorito(favoritos.some(f => f.id === juego.id));
          setResenas(opiniones);
        }
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarComunidad();

    return () => { activo = false; };
  }, [juego.id]);

  async function cambiarFavorito() {
    setProcesando(true);
    setError('');
    setMensaje('');

    try {
      const respuesta = await fetch(
        favorito
          ? `${API}/api/favoritos/${juego.id}`
          : `${API}/api/favoritos`,
        {
          method: favorito ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          ...(!favorito && {
            body: JSON.stringify({ juego_id: juego.id })
          })
        }
      );

      await leerRespuesta(respuesta);
      setFavorito(!favorito);

      setMensaje(
        favorito
          ? 'Juego eliminado de favoritos'
          : 'Juego agregado a favoritos'
      );

      onCambioFavoritos?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  async function publicarResena(e) {
    e.preventDefault();

    const texto = comentario.trim();
    const longitud = Array.from(texto).length;

    if (longitud < 10 || longitud > 500) {
      setError('Escribí entre 10 y 500 caracteres.');
      return;
    }

    setProcesando(true);
    setError('');
    setMensaje('');

    try {
      const respuesta = await fetch(
        `${API}/api/juegos/${juego.id}/resenas`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            puntuacion: Number(puntuacion),
            comentario: texto
          })
        }
      );

      const nuevaResena = await leerRespuesta(respuesta);

      setResenas(actuales => [nuevaResena, ...actuales]);
      setComentario('');
      setPuntuacion(5);
      setMensaje('¡Tu reseña se publicó correctamente!');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  if (cargando) {
    return (
      <div className="comunidad">
        Cargando comunidad...
      </div>
    );
  }

  const promedio = resenas.length
    ? (
        resenas.reduce(
          (total, resena) => total + resena.puntuacion,
          0
        ) / resenas.length
      ).toFixed(1)
    : null;

  return (
    <section className="comunidad">
      <div className="comunidad-cabecera">
        <div>
          <h2>Comunidad de jugadores</h2>
          <p>Participá como Visitante demo.</p>
          <p className="aviso-demo">
            Los favoritos y las reseñas son públicos y compartidos.
            No ingreses información personal.
          </p>
        </div>

        <button
          type="button"
          className="btn-favorito"
          onClick={cambiarFavorito}
          disabled={procesando}
        >
          {favorito ? '♥ Quitar favorito' : '♡ Agregar a favoritos'}
        </button>
      </div>

      {error && <p className="aviso-error" role="alert">{error}</p>}
      {mensaje && <p className="aviso-exito" role="status">{mensaje}</p>}

      <div className="comunidad-columnas">
        <div>
          <h3>Escribí tu reseña</h3>

          <form onSubmit={publicarResena} className="resena-form">
            <label htmlFor="puntuacion">
              Puntuación
            </label>

            <select
              id="puntuacion"
              value={puntuacion}
              onChange={e => setPuntuacion(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map(numero => (
                <option key={numero} value={numero}>
                  {numero} ★
                </option>
              ))}
            </select>

            <label htmlFor="comentario">Tu opinión</label>

            <textarea
              id="comentario"
              placeholder="¿Qué te pareció este juegazo?"
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              rows={5}
              maxLength={1000}
              required
            />

            <small>
              Entre 10 y 500 caracteres.
            </small>

            <button
              className="btn-principal"
              type="submit"
              disabled={procesando}
            >
              {procesando ? 'Guardando...' : 'Publicar reseña'}
            </button>
          </form>
        </div>

        <div>
          <h3>
            Reseñas ({resenas.length})
          </h3>

          {promedio && (
            <p className="promedio">
              ★ {promedio} / 5
            </p>
          )}

          {resenas.length === 0 ? (
            <p>Todavía no hay reseñas. ¡Publicá la primera!</p>
          ) : (
            <div className="resenas-lista">
              {resenas.map(resena => (
                <article className="resena-card" key={resena.id}>
                  <div className="resena-cabecera">
                    <strong>{resena.nombre}</strong>
                    <span>{'★'.repeat(resena.puntuacion)}</span>
                  </div>
                  <p>{resena.comentario}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
