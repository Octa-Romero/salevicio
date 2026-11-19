
import { useEffect, useState } from 'react';
import './App.css';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '');

function TarjetaJuego({ juego, onVer }) {
  return (
    <article className="juego-card">
      <div className={`juego-poster poster-${juego.id % 4}`}>
        <span className="poster-etiqueta">{juego.genero}</span>

        <div className="poster-centro">
          <span className="poster-simbolo">✦</span>
          <h3>{juego.titulo}</h3>
        </div>
      </div>

      <div className="juego-info">
        <span className="plataforma">{juego.plataforma}</span>
        <h3>{juego.titulo}</h3>
        <p>{juego.descripcion}</p>

        <button
          className="btn-detalle"
          onClick={() => onVer(juego.id)}
        >
          Ver videojuego <span>↗</span>
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [juegos, setJuegos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [genero, setGenero] = useState('Todos');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [intentos, setIntentos] = useState(0);

  const [vista, setVista] = useState('catalogo');
  const [juegoActivo, setJuegoActivo] = useState(null);
  const [detalleCargando, setDetalleCargando] = useState(false);
  const [detalleError, setDetalleError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function cargarCatalogo() {
      setCargando(true);
      setError('');

      try {
        const respuesta = await fetch(`${API_URL}/api/juegos`, {
          signal: controller.signal
        });

        if (!respuesta.ok) {
          throw new Error('No se pudo obtener el catálogo');
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
          throw new Error('La API devolvió datos inválidos');
        }

        setJuegos(datos);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarCatalogo();

    return () => controller.abort();
  }, [intentos]);

  async function verJuego(id) {
    setVista('detalle');
    setJuegoActivo(null);
    setDetalleError('');
    setDetalleCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/juegos/${id}`);

      if (!respuesta.ok) {
        throw new Error('No se pudo obtener el videojuego');
      }

      const datos = await respuesta.json();
      setJuegoActivo(datos);
    } catch (err) {
      setDetalleError(err.message);
    } finally {
      setDetalleCargando(false);
    }
  }

  function volverCatalogo() {
    setVista('catalogo');
    setJuegoActivo(null);
  }

  const generos = [
    'Todos',
    ...new Set(juegos.map(j => j.genero).filter(Boolean))
  ];

  const juegosFiltrados = juegos.filter(juego => {
    const coincideNombre = juego.titulo
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideGenero =
      genero === 'Todos' || juego.genero === genero;

    return coincideNombre && coincideGenero;
  });

  return (
    <div className="app">
      <header className="header">
        <div className="contenedor nav">
          <button className="logo" onClick={volverCatalogo}>
            <span className="logo-icono">S</span>
            <span>Sale<span className="texto-acento">Vicio</span></span>
          </button>

          <div className="nav-derecha">
            <span className="nav-subtitulo">
              Tu comunidad gamer
            </span>
            <button className="btn-nav" onClick={volverCatalogo}>
              Catálogo
            </button>
          </div>
        </div>
      </header>

      <main className="contenedor">
        {vista === 'catalogo' ? (
          <>
            <section className="hero">
              <div className="hero-contenido">
                <span className="eyebrow">BIENVENIDO A SALEVICIO</span>
                <h1>
                  Encontrá tu próximo
                  <span className="texto-acento"> juegazo.</span>
                </h1>
                <p>
                  Explorá videojuegos, descubrí nuevas aventuras
                  y encontrá dónde jugarlos.
                  Una comunidad hecha por y para gamers.
                </p>
                <a className="btn-principal" href="#catalogo">
                  Explorar videojuegos ↓
                </a>
              </div>
              <div className="hero-decoracion" aria-hidden="true">
                <span>SV</span>
              </div>
            </section>

            <section id="catalogo" className="catalogo">
              <div className="seccion-titulo">
                <div>
                  <span className="eyebrow">EXPLORÁ</span>
                  <h2>Biblioteca de videojuegos</h2>
                  <p>
                    Descubrí títulos y accedé a sus plataformas
                    oficiales.
                  </p>
                </div>

                <span className="contador">
                  {juegos.length} juegos
                </span>
              </div>

              <div className="buscador">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Buscar un videojuego..."
                  aria-label="Buscar videojuegos"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </div>

              <div className="filtros">
                {generos.map(item => (
                  <button
                    key={item}
                    className={
                      genero === item
                        ? 'filtro activo'
                        : 'filtro'
                    }
                    onClick={() => setGenero(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {cargando ? (
                <div className="mensaje-estado">
                  Cargando videojuegos...
                </div>
              ) : error ? (
                <div className="mensaje-estado">
                  <p>{error}</p>
                  <button
                    className="btn-principal"
                    onClick={() => setIntentos(i => i + 1)}
                  >
                    Reintentar conexión
                  </button>
                </div>
              ) : juegosFiltrados.length === 0 ? (
                <div className="mensaje-estado">
                  No encontramos videojuegos con esos filtros.
                </div>
              ) : (
                <div className="juegos-grid">
                  {juegosFiltrados.map(juego => (
                    <TarjetaJuego
                      key={juego.id}
                      juego={juego}
                      onVer={verJuego}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="detalle">
            <button
              className="btn-volver"
              onClick={volverCatalogo}
            >
              ← Volver al catálogo
            </button>

            {detalleCargando ? (
              <div className="mensaje-estado">
                Cargando videojuego...
              </div>
            ) : detalleError ? (
              <div className="mensaje-estado">
                {detalleError}
              </div>
            ) : juegoActivo ? (
              <div className="detalle-panel">
                <div
                  className={
                    `detalle-poster poster-${juegoActivo.id % 4}`
                  }
                >
                  <span className="poster-simbolo">✦</span>
                  <h2>{juegoActivo.titulo}</h2>
                </div>

                <div className="detalle-info">
                  <span className="eyebrow">
                    FICHA DEL VIDEOJUEGO
                  </span>
                  <h1>{juegoActivo.titulo}</h1>

                  <div className="detalle-tags">
                    <span>{juegoActivo.genero}</span>
                    <span>{juegoActivo.plataforma}</span>
                  </div>

                  <p>{juegoActivo.descripcion}</p>

                  <a
                    className="btn-principal"
                    href={juegoActivo.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir página oficial ↗
                  </a>

                  <p className="detalle-nota">
                    El enlace abre una plataforma externa.
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="contenedor footer-contenido">
          <span>SaleVicio © 2026</span>
          <span>
            Comunidad independiente de videojuegos.
            No afiliada a las tiendas enlazadas.
          </span>
        </div>
      </footer>
    </div>
  );
}
