/* Tarot personalizados: mazos clásicos de 78 cartas con arte propio.
   Cada mazo: { id, nombre, anio, lugar, tecnica, desc, credito, ruta: 'img/<id>', ar: proporción ancho/alto,
   plan: 'premium' (plan mínimo; por defecto Premium), muestra: [5 cartas para la portada], faltan: [índices sin imagen],
   colores: { fondo, halo, panel, oro, oroClaro } }.
   Vacío = el botón «Descubre tarot personalizados» no aparece. Para bajar un mazo: quitar su bloque de esta lista. */
window.ARCANA_MAZOS_PERS = [{
  id: 'mn1', nombre: 'Tarot del Mar', anio: '2026', lugar: 'ARCANA',
  tecnica: 'Ilustración digital',
  desc: 'Un tarot clásico con una mirada de mar, viaje y aventura. Mismas cartas, mismos significados, otro diseño.',
  credito: 'Tarot del Mar: homenaje de fans, 2026. Los personajes y símbolos que aparecen pertenecen a sus titulares; este mazo no está afiliado ni respaldado por ellos y será retirado de inmediato si algún titular lo reclama.',
  aviso: 'Homenaje de fans. Los personajes y símbolos pertenecen a sus titulares y este mazo no está afiliado ni respaldado por ellos. Si alguno de ellos lo reclama, este mazo será retirado de inmediato. <a href="terminos.html#ley" target="_blank" rel="noopener">Contacto</a>',
  ruta: 'img/mn1', ar: 0.585, plan: 'premium',
  muestra: [22, 36, 48, 53, 64], faltan: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 33, 47, 61, 77],
  colores: { fondo: '#06131a', halo: '#17485a', panel: '10, 38, 50', oro: '#e0b87a', oroClaro: '#f2dcae' }
}];
