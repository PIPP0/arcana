/* ARCANA — cartas, textos e ilustraciones.
   Las ilustraciones son originales: se dibujan aquí, en código (SVG). */
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
  const lemn = (y) => p(`M60 ${y} c-6 -8 -18 -8 -18 0 s12 8 18 0 s18 -8 18 0 s-12 8 -18 0`);
  const ondas = (x, y, n) => p(`M${x} ${y} q5 -4 10 0` + ' t10 0'.repeat(n - 1));

  /* ---------- un dibujo por arcano ---------- */
  const DIBUJOS = [
    /* 0 El Loco */ () => p('M18 128 H64 V142') + p('M22 122 Q40 82 60 96', 'ln ds') + c(72, 90, 9) +
      c(88, 54, 8) + rays(88, 54, 12, 17, 8) + star(36, 58, 5, 1.8, 4, 'fl'),
    /* I El Mago */ () => lemn(50) + l(60, 64, 60, 106) + c(60, 62, 2, 'fl') + l(28, 118, 92, 118) + l(36, 118, 36, 134) + l(84, 118, 84, 134) +
      c(38, 110, 4) + p('M46 114 l4 -8 l4 8 z') + p('M68 106 h8 v8 h-8 z') + l(86, 106, 86, 114) + l(82, 110, 90, 110),
    /* II La Sacerdotisa */ () => p('M28 50 h12 v86 h-12 z') + p('M80 50 h12 v86 h-12 z') + p('M68 70 A14 14 0 1 0 68 96 A15 15 0 0 1 68 70 z', 'fl') +
      p('M40 56 Q60 42 80 56') + ondas(40, 124, 4) + c(60, 110, 1.6, 'fl'),
    /* III La Emperatriz */ () => {
      let s = '';
      for (let a = 0; a < 360; a += 60) s += `<ellipse class="ln" cx="60" cy="80" rx="6" ry="13" transform="rotate(${a} 60 93)"/>`;
      return s + c(60, 93, 4, 'fl') + star(44, 54, 3.4, 1.3, 4, 'fl') + star(60, 47, 4.2, 1.6, 4, 'fl') + star(76, 54, 3.4, 1.3, 4, 'fl') + p('M32 138 Q60 126 88 138');
    },
    /* IV El Emperador */ () => p('M34 68 h52 v52 h-52 z') + p('M34 120 L50 92 L60 106 L72 84 L86 120') +
      p('M44 60 V46 L52 54 L60 42 L68 54 L76 46 V60 z') + l(28, 128, 92, 128) + l(36, 134, 84, 134),
    /* V El Sumo Sacerdote */ () => l(60, 42, 60, 136) + l(50, 56, 70, 56) + l(44, 70, 76, 70) + l(38, 84, 82, 84) +
      c(36, 122, 6) + c(84, 122, 6) + p('M40 117 Q60 98 80 117') + c(60, 42, 2, 'fl'),
    /* VI Los Enamorados */ () => c(49, 100, 21) + c(71, 100, 21) + c(60, 52, 7) + rays(60, 52, 11, 16, 12) + c(60, 100, 2.2, 'fl'),
    /* VII El Carro */ () => p('M38 70 h44 v36 h-44 z') + p('M32 70 Q60 46 88 70') + star(60, 88, 10, 4, 8) +
      c(44, 120, 10) + c(76, 120, 10) + c(44, 120, 2, 'fl') + c(76, 120, 2, 'fl') + l(24, 134, 96, 134),
    /* VIII La Fuerza */ () => lemn(50) + c(60, 100, 15) + rays(60, 100, 19, 28, 18) + star(60, 100, 6, 2.4, 4, 'fl'),
    /* IX El Ermitaño */ () => l(38, 46, 38, 138) + p('M38 52 Q72 42 72 62') + star(72, 80, 18, 15.6, 3, 'ln', -90) + star(72, 80, 8, 3, 6, 'fl') +
      p('M54 138 L74 114 L84 126 L90 120 L100 138'),
    /* X La Rueda */ () => c(60, 90, 34) + c(60, 90, 24) + c(60, 90, 6) + rays(60, 90, 6, 34, 8, 22.5) +
      c(24, 50, 1.8, 'fl') + c(96, 50, 1.8, 'fl') + c(24, 130, 1.8, 'fl') + c(96, 130, 1.8, 'fl'),
    /* XI La Justicia */ () => l(60, 48, 60, 132) + c(60, 45, 3) + l(32, 66, 88, 66) + l(32, 66, 23, 92) + l(32, 66, 41, 92) + p('M21 92 Q32 106 43 92 z') +
      l(88, 66, 79, 92) + l(88, 66, 97, 92) + p('M77 92 Q88 106 99 92 z') + l(46, 132, 74, 132) + l(52, 138, 68, 138),
    /* XII El Colgado */ () => l(28, 46, 92, 46) + l(34, 46, 34, 60) + l(86, 46, 86, 60) + l(60, 46, 60, 74) + p('M46 74 h28 L60 102 z') +
      c(60, 114, 7) + rays(60, 114, 10.5, 15, 12),
    /* XIII La Muerte */ () => l(20, 116, 100, 116) + p('M44 116 A16 16 0 0 1 76 116') + rays(60, 116, 21, 28, 7, 0, 200, 340) +
      p('M24 116 v-24 h9 v24') + p('M87 116 v-24 h9 v24') + p('M44 78 Q60 40 84 52 Q62 54 50 80 z', 'fl') + l(84, 52, 92, 84) + ondas(25, 130, 7),
    /* XIV La Templanza */ () => p('M28 54 h22 l-4 18 h-14 z') + p('M70 108 h22 l-4 18 h-14 z') + p('M42 72 C46 96 76 86 80 108') + p('M36 72 C40 102 70 92 74 108', 'ln ds') +
      p('M72 48 h20 v20 h-20 z') + p('M75 65 l7 -13 l7 13 z') + c(36, 122, 6) + rays(36, 122, 9.5, 14, 8),
    /* XV El Diablo */ () => {
      const pts = [];
      for (let i = 0; i < 5; i++) { const a = (90 + i * 144) * Math.PI / 180; pts.push(f(60 + 27 * Math.cos(a)) + ',' + f(82 + 27 * Math.sin(a))); }
      return c(60, 82, 27) + `<polygon class="ln" points="${pts.join(' ')}"/>` + c(40, 124, 5.5) + c(49, 129, 5.5) + c(71, 129, 5.5) + c(80, 124, 5.5) + l(54.5, 129, 65.5, 129);
    },
    /* XVI La Torre */ () => p('M47 138 V74 h26 V138') + l(60, 86, 60, 95) + l(60, 108, 60, 117) + l(28, 138, 92, 138) +
      `<g transform="translate(9 -5) rotate(22 60 58)">` + p('M50 66 L48 52 L55 58 L60 48 L65 58 L72 52 L70 66 z') + '</g>' +
      p('M94 38 L80 58 L88 60 L76 76') + c(34, 92, 2, 'fl') + c(88, 98, 2, 'fl') + c(28, 114, 1.5, 'fl') + c(94, 118, 1.5, 'fl') + c(38, 70, 1.5, 'fl'),
    /* XVII La Estrella */ () => star(60, 76, 25, 9, 8) + star(60, 42, 3, 1.1, 4, 'fl') + star(28, 52, 3.4, 1.3, 4, 'fl') + star(92, 52, 3.4, 1.3, 4, 'fl') +
      star(22, 86, 3, 1.1, 4, 'fl') + star(98, 86, 3, 1.1, 4, 'fl') + star(36, 110, 3.4, 1.3, 4, 'fl') + star(84, 110, 3.4, 1.3, 4, 'fl') +
      ondas(25, 126, 7) + ondas(35, 135, 5),
    /* XVIII La Luna */ () => c(60, 70, 21) + p('M66 56 A15 15 0 1 0 66 84 A16 16 0 0 1 66 56 z', 'fl') + p('M22 138 v-28 h11 v28') + p('M87 138 v-28 h11 v28') +
      p('M60 138 C50 126 70 116 60 102', 'ln ds') + c(42, 100, 1.5, 'fl') + c(78, 100, 1.5, 'fl') + c(48, 110, 1.2, 'fl') + c(72, 110, 1.2, 'fl') + l(22, 138, 98, 138),
    /* XIX El Sol */ () => c(60, 86, 18) + c(60, 86, 9) + rays(60, 86, 23, 38, 8) + rays(60, 86, 23, 31, 8, 22.5) + l(24, 136, 96, 136) + l(36, 141, 84, 141),
    /* XX El Juicio */ () => p('M88 40 L54 62 L66 78 z') + c(90, 38, 2.4, 'fl') + l(55, 72, 40, 90) + l(60, 78, 52, 98) + l(50, 66, 32, 78) +
      p('M26 134 v-10 a8 8 0 0 1 16 0 v10') + p('M52 134 v-10 a8 8 0 0 1 16 0 v10') + p('M78 134 v-10 a8 8 0 0 1 16 0 v10') + l(20, 134, 100, 134) +
      l(34, 110, 34, 104) + l(60, 110, 60, 104) + l(86, 110, 86, 104),
    /* XXI El Mundo */ () => `<ellipse class="ln" cx="60" cy="90" rx="26" ry="38"/><ellipse class="ln ds" cx="60" cy="90" rx="21" ry="33"/>` +
      star(60, 90, 10, 3.6, 4, 'fl') + c(26, 50, 3) + p('M90 53 l4 -7 l4 7 z') + p('M23 127 h6 v6 h-6 z') + star(94, 130, 4.4, 1.7, 4, 'fl')
  ];

  const svg = (inner, label) =>
    `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>` +
    `<rect class="cb" x="1" y="1" width="118" height="178" rx="8"/>` +
    `<rect class="ln" x="6" y="6" width="108" height="168" rx="5"/>` + inner + '</svg>';

  function cara(i) {
    const k = CARTAS[i];
    return svg(
      `<rect class="ln fino" x="10" y="10" width="100" height="160" rx="3"/>` +
      `<text class="tx num" x="60" y="29" text-anchor="middle">${k.n}</text>` +
      DIBUJOS[i]() +
      `<text class="tx nom" x="60" y="161" text-anchor="middle"${k.nombre.length > 17 ? ' textLength="92" lengthAdjust="spacingAndGlyphs"' : ''}>${k.nombre.toUpperCase()}</text>`,
      k.nombre);
  }

  function reverso() {
    let s = `<rect class="ln fino" x="10" y="10" width="100" height="160" rx="3"/>`;
    s += p('M60 22 L102 90 L60 158 L18 90 z') + p('M60 40 L90 90 L60 140 L30 90 z', 'ln fino');
    s += c(60, 90, 20) + star(60, 90, 16, 6, 8, 'fl') + c(60, 90, 26, 'ln ds');
    [[20, 20], [100, 20], [20, 160], [100, 160]].forEach(([x, y]) => { s += star(x, y, 4, 1.5, 4, 'fl'); });
    s += c(60, 30, 1.4, 'fl') + c(60, 150, 1.4, 'fl');
    return svg(s, '');
  }

  window.ARCANA_DATA = { CARTAS, cara, reverso };
})();
