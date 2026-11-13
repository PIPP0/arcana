/* ARCANA — los 22 arcanos mayores (textos) y el reverso dibujado. */
(function () {
  'use strict';

  const CARTAS = [
    { n: '0', nombre: 'El Loco', claves: 'Comienzos · Confianza · Libertad', hilo: 'el salto a lo desconocido',
      esencia: 'El Loco habla de empezar sin tenerlo todo resuelto. Es la carta del primer paso, dado con más curiosidad que certezas.',
      luz: 'Te invita a permitirte probar algo nuevo sin exigirte saber cómo termina.',
      sombra: 'El desafío es distinguir la confianza de la imprudencia: saltar no es lo mismo que no mirar.',
      pregunta: '¿Qué empezarías si no necesitaras tener todas las respuestas?' },
    { n: 'I', nombre: 'El Mago', claves: 'Voluntad · Recursos · Acción', hilo: 'la voluntad puesta en acción',
      esencia: 'El Mago recuerda que ya tienes herramientas sobre la mesa. Habla de pasar de la idea al gesto concreto.',
      luz: 'Te invita a usar lo que ya sabes hacer, en vez de esperar el momento perfecto.',
      sombra: 'El desafío es no dispersarte: tener muchos recursos no sirve si ninguno se pone en marcha.',
      pregunta: '¿Qué herramienta tuya estás dejando sin usar?' },
    { n: 'II', nombre: 'La Sacerdotisa', claves: 'Intuición · Silencio · Escucha', hilo: 'la escucha interior',
      esencia: 'La Sacerdotisa habla de lo que se sabe sin poder explicarlo todavía. Es una carta de pausa y de atención hacia dentro.',
      luz: 'Te invita a darte un momento de silencio antes de responder o decidir.',
      sombra: 'El desafío es no quedarte solo observando: lo que intuyes también pide, en algún momento, ser dicho.',
      pregunta: '¿Qué es eso que ya sabes, aunque todavía no lo hayas dicho en voz alta?' },
    { n: 'III', nombre: 'La Emperatriz', claves: 'Cuidado · Abundancia · Creación', hilo: 'el cuidado que hace crecer',
      esencia: 'La Emperatriz habla de nutrir: ideas, vínculos, proyectos o a ti mismo. Lo que se cuida con constancia, crece.',
      luz: 'Te invita a preguntarte qué merece hoy tu tiempo y tu cariño.',
      sombra: 'El desafío es no cuidar de todo y de todos olvidándote de ti en el camino.',
      pregunta: '¿Qué estás haciendo crecer, y qué necesita para florecer?' },
    { n: 'IV', nombre: 'El Emperador', claves: 'Estructura · Límites · Orden', hilo: 'la estructura que sostiene',
      esencia: 'El Emperador habla de orden, límites y responsabilidad. Representa aquello que da forma y sostén a lo que construyes.',
      luz: 'Te invita a poner un límite claro o a ordenar algo que lleva tiempo suelto.',
      sombra: 'El desafío es que el orden no se vuelva rigidez: una estructura sirve mientras deja respirar.',
      pregunta: '¿Dónde te vendría bien un límite, y dónde te sobra uno?' },
    { n: 'V', nombre: 'El Sumo Sacerdote', claves: 'Tradición · Aprendizaje · Guía', hilo: 'lo aprendido de otros',
      esencia: 'El Sumo Sacerdote habla de enseñanzas, tradiciones y maestros. Señala el valor de lo que otros recorrieron antes que tú.',
      luz: 'Te invita a pedir consejo o a volver a una enseñanza que te hizo bien.',
      sombra: 'El desafío es no seguir una norma solo porque siempre se hizo así.',
      pregunta: '¿Qué creencia heredada sigue siendo tuya, y cuál ya no?' },
    { n: 'VI', nombre: 'Los Enamorados', claves: 'Elección · Vínculo · Valores', hilo: 'la elección hecha desde tus valores',
      esencia: 'Los Enamorados hablan de vínculos, pero sobre todo de elegir. Toda elección sincera muestra qué es importante para ti.',
      luz: 'Te invita a elegir en coherencia con lo que valoras, no solo con lo que conviene.',
      sombra: 'El desafío es aceptar que elegir un camino también es soltar otro.',
      pregunta: '¿Qué valor tuyo está en juego en esta elección?' },
    { n: 'VII', nombre: 'El Carro', claves: 'Dirección · Determinación · Avance', hilo: 'el avance con dirección',
      esencia: 'El Carro habla de avanzar con decisión, sosteniendo el rumbo aunque haya fuerzas que tiran para lados distintos.',
      luz: 'Te invita a fijar un destino claro y a dar un paso concreto hacia él.',
      sombra: 'El desafío es no confundir velocidad con dirección: avanzar rápido no asegura llegar donde quieres.',
      pregunta: '¿Hacia dónde quieres ir de verdad, más allá del impulso?' },
    { n: 'VIII', nombre: 'La Fuerza', claves: 'Templanza · Coraje · Paciencia', hilo: 'la fuerza serena',
      esencia: 'La Fuerza no habla de imponerse, sino de sostener con calma. Es el coraje tranquilo de quien no necesita gritar.',
      luz: 'Te invita a tratar con suavidad aquello que te cuesta, incluyéndote.',
      sombra: 'El desafío es no reprimir lo que sientes creyendo que eso es ser fuerte.',
      pregunta: '¿Qué pasaría si abordaras esto con paciencia en lugar de con fuerza?' },
    { n: 'IX', nombre: 'El Ermitaño', claves: 'Introspección · Búsqueda · Claridad', hilo: 'la búsqueda en soledad',
      esencia: 'El Ermitaño habla de retirarse un momento para ver con más claridad. Su linterna alumbra solo el paso siguiente, y con eso basta.',
      luz: 'Te invita a regalarte un tiempo a solas para ordenar lo que piensas.',
      sombra: 'El desafío es que el retiro no se convierta en aislamiento.',
      pregunta: '¿Qué necesitas mirar con calma, lejos del ruido?' },
    { n: 'X', nombre: 'La Rueda de la Fortuna', claves: 'Ciclos · Cambio · Movimiento', hilo: 'el giro de los ciclos',
      esencia: 'La Rueda habla de ciclos: lo que sube, baja, y vuelve a moverse. Recuerda que ninguna etapa es definitiva.',
      luz: 'Te invita a reconocer en qué momento del ciclo estás y a moverte con él.',
      sombra: 'El desafío es no dejarlo todo en manos del azar: hay giros que no eliges, pero sí cómo los recibes.',
      pregunta: '¿Qué ciclo se está cerrando, y cuál comienza?' },
    { n: 'XI', nombre: 'La Justicia', claves: 'Equilibrio · Verdad · Responsabilidad', hilo: 'el equilibrio y la honestidad',
      esencia: 'La Justicia habla de mirar las cosas como son, con honestidad. Invita a hacerse cargo de la parte que a cada uno le toca.',
      luz: 'Te invita a sopesar con calma ambos lados antes de tomar posición.',
      sombra: 'El desafío es no ser más duro contigo de lo que serías con otra persona.',
      pregunta: '¿Qué parte de esto te corresponde a ti, y cuál no?' },
    { n: 'XII', nombre: 'El Colgado', claves: 'Pausa · Perspectiva · Entrega', hilo: 'la pausa que cambia la mirada',
      esencia: 'El Colgado habla de detenerse y mirar desde otro ángulo. A veces no avanzar es justamente lo que permite entender.',
      luz: 'Te invita a mirar el asunto desde el lugar opuesto al habitual.',
      sombra: 'El desafío es distinguir la pausa que aclara de la espera que posterga.',
      pregunta: '¿Qué verías distinto si dieras vuelta la situación?' },
    { n: 'XIII', nombre: 'La Muerte', claves: 'Cierre · Transformación · Renovación', hilo: 'el cierre que abre espacio',
      esencia: 'En el tarot, esta carta no habla de una muerte literal: habla de cierres y transformaciones. Algo termina para que otra cosa tenga lugar.',
      luz: 'Te invita a despedir con gratitud algo que ya cumplió su etapa.',
      sombra: 'El desafío es soltar lo que ya terminó, aunque todavía no se vea lo que viene.',
      pregunta: '¿Qué etapa ya terminó, aunque te cueste despedirla?' },
    { n: 'XIV', nombre: 'La Templanza', claves: 'Equilibrio · Mezcla · Paciencia', hilo: 'la mezcla paciente',
      esencia: 'La Templanza habla de combinar con paciencia: ni todo ni nada, sino la medida justa encontrada de a poco.',
      luz: 'Te invita a buscar el punto medio entre dos cosas que parecen opuestas.',
      sombra: 'El desafío es no evitar toda tensión en nombre de la calma.',
      pregunta: '¿Qué dos cosas necesitas aprender a combinar?' },
    { n: 'XV', nombre: 'El Diablo', claves: 'Ataduras · Deseo · Conciencia', hilo: 'las ataduras que se pueden mirar',
      esencia: 'El Diablo habla de aquello que nos ata: hábitos, miedos o deseos que manejan más de lo que quisiéramos. Mirarlo es el primer paso para aflojarlo.',
      luz: 'Te invita a nombrar con honestidad, y sin culpa, algo que te tiene atrapado.',
      sombra: 'El desafío es reconocer que las cadenas de esta carta suelen estar más sueltas de lo que parecen.',
      pregunta: '¿Qué te ata hoy, y qué tan firme es realmente ese nudo?' },
    { n: 'XVI', nombre: 'La Torre', claves: 'Sacudida · Verdad · Liberación', hilo: 'la sacudida que despeja',
      esencia: 'La Torre habla de estructuras que dejan de sostenerse. Es una carta incómoda, pero también honesta: lo que cae suele ser lo que ya no era firme.',
      luz: 'Te invita a ver qué queda en pie cuando algo se remueve: ahí está lo esencial.',
      sombra: 'El desafío es no aferrarte a reconstruir lo mismo, tal como estaba.',
      pregunta: '¿Qué estabas sosteniendo que ya no se sostenía solo?' },
    { n: 'XVII', nombre: 'La Estrella', claves: 'Esperanza · Calma · Inspiración', hilo: 'la esperanza serena',
      esencia: 'La Estrella habla de la calma que llega después de un momento difícil. Es confianza tranquila, sin apuro.',
      luz: 'Te invita a volver a algo que te inspira y a darle un poco de espacio.',
      sombra: 'El desafío es que la esperanza no reemplace a la acción.',
      pregunta: '¿Qué te devuelve la calma cuando la pierdes?' },
    { n: 'XVIII', nombre: 'La Luna', claves: 'Incertidumbre · Sueños · Intuición', hilo: 'el camino en penumbra',
      esencia: 'La Luna habla de caminar sin verlo todo. Lo que hoy parece confuso puede ser simplemente algo que aún no termina de mostrarse.',
      luz: 'Te invita a avanzar con cuidado, sin exigirte claridad total.',
      sombra: 'El desafío es no tomar por cierto todo lo que el miedo imagina en la oscuridad.',
      pregunta: '¿Qué parte de tu preocupación es un hecho, y qué parte es una sombra?' },
    { n: 'XIX', nombre: 'El Sol', claves: 'Claridad · Alegría · Vitalidad', hilo: 'la claridad y la alegría',
      esencia: 'El Sol habla de claridad, energía y disfrute sencillo. Es la carta de lo que se muestra tal como es.',
      luz: 'Te invita a celebrar algo que va bien, por pequeño que parezca.',
      sombra: 'El desafío es permitirte disfrutar sin esperar a que todo esté perfecto.',
      pregunta: '¿Qué te da energía de verdad, y cuánto espacio le das?' },
    { n: 'XX', nombre: 'El Juicio', claves: 'Despertar · Balance · Llamado', hilo: 'el llamado a despertar',
      esencia: 'El Juicio habla de hacer balance y responder a un llamado interior. Es mirar lo vivido con otros ojos para elegir cómo seguir.',
      luz: 'Te invita a escuchar eso que hace tiempo te está llamando.',
      sombra: 'El desafío es hacer balance sin quedarte atrapado en el reproche.',
      pregunta: '¿Qué te está llamando hace tiempo, y qué necesitas para responder?' },
    { n: 'XXI', nombre: 'El Mundo', claves: 'Culminación · Integración · Plenitud', hilo: 'el ciclo que se completa',
      esencia: 'El Mundo habla de ciclos que se completan y de las piezas que por fin encajan. Reconoce el camino recorrido.',
      luz: 'Te invita a reconocer lo que ya lograste antes de correr hacia lo siguiente.',
      sombra: 'El desafío es animarte a cerrar, en lugar de dejar siempre algo pendiente.',
      pregunta: '¿Qué ciclo estás completando, y cómo quieres celebrarlo?' }
  ];

  /* ---------- primitivas de dibujo ---------- */
  const f = (v) => Math.round(v * 100) / 100;
  const c = (x, y, r, k = 'ln') => `<circle class="${k}" cx="${x}" cy="${y}" r="${r}"/>`;
  const l = (x1, y1, x2, y2) => `<line class="ln" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
  const p = (d, k = 'ln') => `<path class="${k}" d="${d}"/>`;
  const star = (cx, cy, R, r, n, k = 'ln', rot = -90) => {
    let pts = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (rot + (i * 180) / n) * Math.PI / 180, q = i % 2 ? r : R;
      pts += f(cx + q * Math.cos(a)) + ',' + f(cy + q * Math.sin(a)) + ' ';
    }
    return `<polygon class="${k}" points="${pts.trim()}"/>`;
  };
  const rays = (cx, cy, r1, r2, n, off = 0, from = 0, to = 360) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const deg = off + from + (i * (to - from)) / (to - from === 360 ? n : n - 1);
      const a = deg * Math.PI / 180;
      s += l(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a), cx + r2 * Math.cos(a), cy + r2 * Math.sin(a));
    }
    return s;
  };
  const svg = (inner) =>
    `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">` +
    `<rect class="cb" x="0" y="0" width="120" height="180"/>` +
    `<rect class="ln" x="6" y="6" width="108" height="168" rx="3"/>` + inner + '</svg>';

  /* Reverso dibujado: se usa en el mazo que no conserva un reverso original. */
  function reverso() {
    let s = `<rect class="ln fino" x="10" y="10" width="100" height="160" rx="2"/>`;
    for (let y = 22; y <= 158; y += 17) for (let x = 20; x <= 100; x += 16) s += p(`M${x} ${y - 6} l5 6 l-5 6 l-5 -6 z`, 'ln fino');
    s += `<rect class="cb" x="28" y="52" width="64" height="76" rx="32"/>`;
    s += c(60, 90, 30) + c(60, 90, 26, 'ln ds') + star(60, 90, 22, 8, 8) + star(60, 90, 12, 4.5, 8, 'fl') + rays(60, 90, 23, 26, 16, 11.25);
    [[18, 18], [102, 18], [18, 162], [102, 162]].forEach(([x, y]) => { s += star(x, y, 5, 1.8, 4, 'fl'); });
    return svg(s);
  }

  window.ARCANA_DATA = { CARTAS, reversoDibujado: reverso };
})();
