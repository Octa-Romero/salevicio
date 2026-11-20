-- Contenido editorial original; requisitos técnicos: consultar siempre tienda oficial.
BEGIN;
ALTER TABLE juegos ADD COLUMN IF NOT EXISTS desarrollador VARCHAR(120);
ALTER TABLE juegos ADD COLUMN IF NOT EXISTS lanzamiento VARCHAR(16);
UPDATE juegos SET desarrollador='Team Cherry', lanzamiento='2017' WHERE titulo='Hollow Knight';
UPDATE juegos SET desarrollador='ConcernedApe', lanzamiento='2016' WHERE titulo='Stardew Valley';
UPDATE juegos SET desarrollador='Maddy Makes Games', lanzamiento='2018' WHERE titulo='Celeste';
INSERT INTO juegos(titulo, descripcion, genero, plataforma, enlace, imagen, desarrollador, lanzamiento)
SELECT v.titulo,v.descripcion,v.genero,'Steam',v.enlace,NULL,v.desarrollador,v.lanzamiento
FROM (VALUES
('Hades','Escapá del inframundo en combates ágiles donde cada intento abre nuevas posibilidades.','Acción','https://store.steampowered.com/app/1145360/Hades/','Supergiant Games','2020'),
('Terraria','Explorá, construí y enfrentá jefes en un mundo de aventura.','Sandbox','https://store.steampowered.com/app/105600/Terraria/','Re-Logic','2011'),
('Portal 2','Resolvé ingeniosos desafíos de física y portales en una aventura increíble.','Puzles','https://store.steampowered.com/app/620/Portal_2/','Valve','2011'),
('Slay the Spire','Construí un mazo único y elegí cada riesgo al subir una torre impredecible.','Estrategia','https://store.steampowered.com/app/646570/Slay_the_Spire/','Mega Crit','2019'),
('Dead Cells','Enfrentá niveles cambiantes con armas y movimientos precisos.','Acción','https://store.steampowered.com/app/588650/Dead_Cells/','Motion Twin','2018'),
('Disco Elysium','Investigá un misterio mediante conversaciones, decisiones y una historia profunda.','Rol','https://store.steampowered.com/app/632470/Disco_Elysium__The_Final_Cut/','ZA/UM','2019')
) AS v(titulo,descripcion,genero,enlace,desarrollador,lanzamiento)
WHERE NOT EXISTS(SELECT 1 FROM juegos WHERE enlace=v.enlace);
INSERT INTO novedades(titulo,resumen,tipo) VALUES
('Comienza una nueva etapa','SaleVicio prepara perfiles, biblioteca individual y debates por videojuego.','plataforma'),
('Tus juegos, en tu biblioteca','Guardá los títulos que te interesan y encontralos desde tu perfil.','plataforma'),
('Conversaciones de jugadores','Creá hilos y compartí opiniones en nuestra comunidad.','comunidad')
ON CONFLICT(titulo) DO NOTHING;
COMMIT;
