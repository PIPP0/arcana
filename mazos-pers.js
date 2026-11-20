/* Tarot personalizados: mazos clásicos de 78 cartas con arte propio.
   Cada mazo: { id, nombre, anio, lugar, tecnica, desc, credito, ruta: 'img/<id>', ar: proporción ancho/alto,
   plan: 'premium' (plan mínimo; por defecto Premium), muestra: [5 cartas para la portada], faltan: [índices sin imagen], imgTemas: { general, amor, trabajo, crecimiento, decisiones, libre } = carta a mostrar en cada tema (opcional),
   colores: { fondo, halo, panel, oro, oroClaro } }.
   Vacío = el botón «Descubre tarot personalizados» no aparece. Para bajar un mazo: quitar su bloque de esta lista. */
window.ARCANA_MAZOS_PERS = [{
  id: 'mn1', nombre: 'Tarot del Mar', anio: '2026', lugar: 'ARCANA',
  tecnica: 'Ilustración digital',
  desc: 'Un tarot clásico con una mirada de mar, viaje y aventura. Mismas cartas, mismos significados, otro diseño.',
  credito: 'Tarot del Mar es un homenaje de fans. One Piece y sus personajes pertenecen a sus titulares; este mazo no está afiliado ni respaldado por ellos. Si un titular solicita su retiro, se hará de forma inmediata.',
  aviso: 'Tarot del Mar es un homenaje de fans. One Piece y sus personajes pertenecen a sus titulares; este mazo no está afiliado ni respaldado por ellos. Si un titular solicita su retiro, se hará de forma inmediata. <a href="terminos.html#ley" target="_blank" rel="noopener">Contacto</a>',
  ruta: 'img/mn1', ar: 0.585, plan: 'premium',
  muestra: [22, 36, 48, 53, 64],
  imgTemas: { general: 36, amor: 37, trabajo: 71, crecimiento: 24, decisiones: 51, libre: 43 },
  // índices (0–77) de las cartas que este mazo aún no tiene: no se reparten en las lecturas
  faltan: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 77],
  colores: { fondo: '#06131a', halo: '#17485a', panel: '10, 38, 50', oro: '#e0b87a', oroClaro: '#f2dcae' }
}];
