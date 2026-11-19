CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS juegos (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    genero VARCHAR(80),
    plataforma VARCHAR(80),
    enlace TEXT NOT NULL CHECK (enlace ~ '^https://'),
    imagen TEXT CHECK (imagen IS NULL OR imagen ~ '^https://')
);

CREATE TABLE IF NOT EXISTS favoritos (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    juego_id INTEGER NOT NULL REFERENCES juegos(id),
    UNIQUE (usuario_id, juego_id)
);

CREATE TABLE IF NOT EXISTS resenas (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    juego_id INTEGER NOT NULL REFERENCES juegos(id),
    puntuacion SMALLINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT NOT NULL CHECK (char_length(comentario) BETWEEN 10 AND 500),
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO usuarios (nombre)
VALUES ('Visitante demo')
ON CONFLICT (nombre) DO NOTHING;
