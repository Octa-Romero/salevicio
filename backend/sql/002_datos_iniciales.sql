
INSERT INTO juegos (
    titulo, descripcion, genero,
    plataforma, enlace, imagen
)
SELECT
    datos.titulo,
    datos.descripcion,
    datos.genero,
    datos.plataforma,
    datos.enlace,
    NULL
FROM (
    VALUES
    (
        'Hollow Knight',
        'Explora un misterioso mundo subterráneo lleno de desafíos y secretos.',
        'Metroidvania',
        'Steam',
        'https://store.steampowered.com/app/367520/Hollow_Knight/'
    ),
    (
        'Stardew Valley',
        'Construí tu granja, conocé personajes y disfrutá de una aventura relajante.',
        'Simulación',
        'Steam',
        'https://store.steampowered.com/app/413150/Stardew_Valley/'
    ),
    (
        'Celeste',
        'Superá plataformas exigentes mientras acompañás a una protagonista en su aventura.',
        'Plataformas',
        'Steam',
        'https://store.steampowered.com/app/504230/Celeste/'
    )
) AS datos(titulo, descripcion, genero, plataforma, enlace)
WHERE NOT EXISTS (
    SELECT 1
    FROM juegos
    WHERE juegos.enlace = datos.enlace
);