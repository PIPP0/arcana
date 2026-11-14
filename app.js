/* ARCANA — demo de validación. Todo ocurre en el dispositivo: sin servidor, sin analítica. */
(function () {
  'use strict';
  const { CARTAS, reversoDibujado } = window.ARCANA_DATA;
  const TOTAL = CARTAS.length; // 78
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (t) => String(t).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const CLAVE = 'arcana.lecturas.v1';

  /* ---------- mazos históricos (imágenes de dominio público) ---------- */
  const MAZOS = [
    { id: 'rws', nombre: 'Rider-Waite-Smith', anio: '1909', lugar: 'Londres',
      tecnica: 'Ilustración a tinta y color', muestra: [1, 17, 0, 36, 19],
      desc: 'El mazo más influyente del siglo XX, dibujado por Pamela Colman Smith. Fue el primero en ilustrar con escenas completas las 78 cartas, incluidos los arcanos menores.',
      credito: 'Edición original de 1909 («Roses & Lilies»). Ilustraciones de Pamela Colman Smith.' },
    { id: 'dodal', nombre: 'Tarot de Marsella', anio: 'c. 1701', lugar: 'Lyon',
      tecnica: 'Xilografía coloreada a mano', muestra: [1, 13, 0, 64, 19],
      desc: 'La tradición de Marsella en una de sus versiones más antiguas, tallada en madera por el maestro cartero Jean Dodal. Trazo rudo, colores planos y arcanos menores de palos, sin escenas.',
      credito: 'Mazo de Jean Dodal, Lyon, c. 1701–1715.',
      nombres: ['Le Mat', 'Le Bateleur', 'La Papesse', 'L’Impératrice', 'L’Empereur', 'Le Pape', 'L’Amoureux', 'Le Chariot', 'La Force', 'L’Hermite', 'La Roue de Fortune',
        'La Justice', 'Le Pendu', 'el arcano sin nombre', 'Tempérance', 'Le Diable', 'La Maison Dieu', 'L’Étoile', 'La Lune', 'Le Soleil', 'Le Jugement', 'Le Monde'],
      numeros: { 8: 'XI', 11: 'VIII' } },
    { id: 'sola', nombre: 'Sola-Busca', anio: '1491', lugar: 'Ferrara · Venecia',
      tecnica: 'Grabado en cobre iluminado', muestra: [1, 16, 0, 57, 21],
      desc: 'El mazo completo de 78 cartas más antiguo que se conserva. Grabado renacentista cuyos arcanos mayores son guerreros y personajes de la Antigüedad, y cuyos menores ya traen escenas.',
      credito: 'Tarot Sola-Busca, c. 1491. Pinacoteca di Brera, Milán.',
      nombres: ['Mato', 'Panfilio', 'Postumio', 'Lenpio', 'Mario', 'Catulo', 'Sesto', 'Deo Tauro', 'Nerone', 'Falco', 'Venturio',
        'Tulio', 'Carbone', 'Catone', 'Bocho', 'Metelo', 'Olivo', 'Ipeo', 'Lentulo', 'Sabino', 'Nenbroto', 'Nabuchodenasor'],
      propios: true }
  ];
  const mazoDe = (id) => MAZOS.find((m) => m.id === id) || MAZOS[0];

  const TEMAS = [
    { id: 'general', nombre: 'Reflexión general', intro: 'Esta lectura es una pausa para mirar el momento que estás viviendo.',
      cierre: 'No hay una respuesta correcta que encontrar aquí: quédate con la imagen que más te haya resonado.',
      acciones: ['Elige una sola frase de esta lectura y vuelve a ella durante el día.', 'Anota lo primero que pensaste al ver tus cartas, antes de leer nada.'] },
    { id: 'amor', nombre: 'Amor y relaciones', intro: 'Esta lectura mira tus vínculos: lo que das, lo que recibes y lo que esperas.',
      cierre: 'Las cartas hablan de tu mirada, no de lo que siente o hará otra persona. Eso solo se sabe conversando.',
      acciones: ['Piensa en una conversación pendiente y en qué te gustaría decir en ella.', 'Reconoce un gesto concreto que valoras en ese vínculo.'] },
    { id: 'trabajo', nombre: 'Trabajo y proyectos', intro: 'Esta lectura mira lo que haces y construyes: tus esfuerzos, tus dudas y tus ganas.',
      cierre: 'Toma esto como una mirada simbólica. Las decisiones laborales o de dinero merecen datos concretos y, si hace falta, consejo profesional.',
      acciones: ['Escribe el paso más pequeño que podrías dar esta semana.', 'Identifica qué parte de tu proyecto depende de ti y cuál no.'] },
    { id: 'crecimiento', nombre: 'Crecimiento personal', intro: 'Esta lectura mira tu propio camino: quién estás siendo y hacia dónde quieres crecer.',
      cierre: 'Crecer rara vez es lineal. Lo que hoy notas ya es parte del cambio.',
      acciones: ['Nombra un hábito pequeño que te acerque a quien quieres ser.', 'Reconoce algo en lo que ya cambiaste respecto de hace un año.'] },
    { id: 'decisiones', nombre: 'Decisiones', intro: 'Esta lectura acompaña una decisión: no la toma por ti, pero puede ayudarte a mirarla mejor.',
      cierre: 'Las cartas no eligen por ti. Si la decisión es importante, date tiempo y conversa con alguien de confianza.',
      acciones: ['Escribe qué ganarías y qué soltarías con cada opción.', 'Pregúntate qué elegirías si nadie fuera a opinar.'] },
    { id: 'libre', nombre: 'Pregunta libre', intro: 'Esta lectura parte de tu propia pregunta.',
      cierre: 'A veces lo más valioso de una lectura es descubrir que la pregunta era otra.',
      acciones: ['Vuelve a leer tu pregunta: ¿la harías igual ahora?', 'Anota qué carta te incomodó y por qué.'] }
  ];

  const TIRADAS = [
    { id: 'una', nombre: 'Una carta', desc: 'Un mensaje simbólico para reflexionar hoy.',
      pos: [{ id: 'mensaje', nombre: 'Mensaje' }] },
    { id: 'tiempo', nombre: 'Tres cartas', desc: 'Pasado, presente y futuro como marco para contar una historia.',
      pos: [{ id: 'pasado', nombre: 'Pasado' }, { id: 'presente', nombre: 'Presente' }, { id: 'futuro', nombre: 'Futuro' }] },
    { id: 'perspectivas', nombre: 'Tres perspectivas', desc: 'Situación, desafío y posibilidad: tres ángulos sobre un mismo asunto.',
      pos: [{ id: 'situacion', nombre: 'Situación' }, { id: 'desafio', nombre: 'Desafío' }, { id: 'posibilidad', nombre: 'Posibilidad' }] }
  ];

  const LECTURA_POS = {
    mensaje: (k) => `${k.esencia} ${k.luz}`,
    pasado: (k) => `Lo que traes contigo. ${k.esencia} Mirar hacia atrás con esta carta es reconocer cuánto de eso sigue acompañándote.`,
    presente: (k) => `Donde estás hoy. ${k.esencia} ${k.sombra}`,
    futuro: (k) => `Lo que podría abrirse, como posibilidad y no como certeza. ${k.luz} Nada de esto está escrito: depende de lo que tú hagas con ello.`,
    situacion: (k) => `El punto de partida. ${k.esencia}`,
    desafio: (k) => `Lo que pide atención. ${k.sombra}`,
    posibilidad: (k) => `Hacia dónde podrías mirar. ${k.luz}`
  };

  const estado = { mazo: 'rws', tema: 'general', pregunta: '', tirada: null, orden: [], elegidas: [], reveladas: new Set(), guardada: false };

  /* ---------- utilidades ---------- */
  function barajar() {
    // Fisher–Yates con azar criptográfico. El orden queda fijo antes de que la persona elija.
    const a = CARTAS.map((_, i) => i), buf = new Uint32Array(1);
    for (let i = a.length - 1; i > 0; i--) {
      const lim = Math.floor(0x100000000 / (i + 1)) * (i + 1);
      do { crypto.getRandomValues(buf); } while (buf[0] >= lim);
      const j = buf[0] % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    estado.orden = a;
  }
  const src = (mazo, i) => `img/${mazo}/${String(i).padStart(2, '0')}.webp`;
  const cara = (i, mazo, lazy = true) =>
    `<img src="${src(mazo, i)}" alt="${esc(CARTAS[i].nombre)}" ${lazy ? 'loading="lazy"' : ''} decoding="async" draggable="false">`;
  const reverso = (mazo) => (mazo === 'sola' ? reversoDibujado() : `<img src="img/${mazo}/back.webp" alt="" decoding="async" draggable="false">`);
  const carta = (html, mazo, cls = '') => `<span class="carta c-${mazo} ${cls}">${html}</span>`;
  const de = (t) => (t.startsWith('el ') ? 'del ' + t.slice(3) : 'de ' + t);
  const lista = (arr) => (arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1]);
  const numero = (i, mazo) => { const m = mazoDe(mazo); return (m.numeros && m.numeros[i]) || CARTAS[i].n; };
  // Nombre que la carta lleva en ese mazo, cuando difiere del nombre con que se lee.
  const propio = (i, mazo) => { const m = mazoDe(mazo); return i < 22 && m.nombres ? m.nombres[i] : ''; };
  function notaMazo(i, mazo) {
    const m = mazoDe(mazo), n = propio(i, mazo);
    if (!n) return '';
    if (m.propios) return `En el Sola-Busca este arcano es «${n}», un personaje propio del mazo. Se lee según su lugar en la serie: ${CARTAS[i].nombre}.`;
    return i === 13 ? 'En el Tarot de Marsella este arcano no lleva nombre escrito.' : `En el Tarot de Marsella: «${n}».`;
  }

  let tAviso;
  function aviso(t) {
    const el = $('#aviso'); el.textContent = t; el.classList.add('ver');
    clearTimeout(tAviso); tAviso = setTimeout(() => el.classList.remove('ver'), 2600);
  }

  /* ---------- sonido (apagado por defecto) ---------- */
  let sonido = false, actx = null;
  function roce(dur = 0.16, vol = 0.05) {
    if (!sonido) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const n = Math.floor(actx.sampleRate * dur), b = actx.createBuffer(1, n, actx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
      const s = actx.createBufferSource(), fl = actx.createBiquadFilter(), g = actx.createGain();
      fl.type = 'bandpass'; fl.frequency.value = 2400; fl.Q.value = 0.7; g.gain.value = vol;
      s.buffer = b; s.connect(fl); fl.connect(g); g.connect(actx.destination); s.start();
    } catch (e) { /* sin audio: la lectura sigue igual */ }
  }
  $('#btnSonido').addEventListener('click', (e) => {
    sonido = !sonido;
    e.currentTarget.setAttribute('aria-pressed', String(sonido));
    e.currentTarget.textContent = sonido ? 'Sonido: sí' : 'Sonido: no';
    roce();
  });

  /* ---------- navegación ---------- */
  const CON_TEMA = ['intencion', 'tirada', 'barajar', 'elegir', 'lectura'];
  function ir(id, foco = true) {
    if (id === 'tirada') estado.pregunta = $('#pregunta').value.trim();
    if (id === 'barajar') prepararBarajar();
    if (id === 'espacio') pintarHistorial();
    $$('.vista').forEach((v) => { v.hidden = v.id !== 'v-' + id; });
    document.body.className = (CON_TEMA.includes(id) ? 'tema-' + estado.mazo : '') + (id === 'elegir' ? ' con-fija' : '');
    window.scrollTo(0, 0);
    if (foco) { const h = $('#v-' + id + ' h1, #v-' + id + ' h2'); if (h) h.focus({ preventScroll: true }); }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ir]');
    if (b) ir(b.dataset.ir);
  });

  /* ---------- inicio ---------- */
  $('#heroCartas').innerHTML = [18, 17, 19].map((i) => carta(cara(i, 'rws', false), 'rws')).join('');

  /* Astrolabio: círculos, marcas y una constelación trazada. */
  function astrolabio(n, marcas, puntos) {
    let s = '<svg viewBox="-100 -100 200 200" fill="none" stroke="currentColor" stroke-width=".35" aria-hidden="true">';
    s += '<circle r="99"/><circle r="92" stroke-dasharray="1 2.4"/><circle r="78" opacity=".6"/>';
    for (let i = 0; i < marcas; i++) {
      const a = (i * 2 * Math.PI) / marcas, l = i % (marcas / n) === 0 ? 92 : 96;
      s += `<line x1="${(99 * Math.cos(a)).toFixed(2)}" y1="${(99 * Math.sin(a)).toFixed(2)}" x2="${(l * Math.cos(a)).toFixed(2)}" y2="${(l * Math.sin(a)).toFixed(2)}"/>`;
    }
    for (let i = 0; i < n; i++) {
      const a = (i * 2 * Math.PI) / n;
      s += `<line x1="${(78 * Math.cos(a)).toFixed(2)}" y1="${(78 * Math.sin(a)).toFixed(2)}" x2="${(92 * Math.cos(a)).toFixed(2)}" y2="${(92 * Math.sin(a)).toFixed(2)}" opacity=".7"/>`;
    }
    let d = '';
    puntos.forEach(([r, g], i) => {
      const a = (g * Math.PI) / 180, x = (r * Math.cos(a)).toFixed(1), y = (r * Math.sin(a)).toFixed(1);
      d += (i ? 'L' : 'M') + x + ' ' + y;
      s += `<circle cx="${x}" cy="${y}" r="${i % 3 ? 0.9 : 1.6}" fill="currentColor" stroke="none"/>`;
    });
    return s + `<path d="${d}" opacity=".55"/></svg>`;
  }
  const CIELO1 = astrolabio(12, 72, [[85, 10], [70, 34], [86, 62], [66, 95], [84, 130], [72, 168], [87, 205], [68, 248], [85, 290], [71, 330]]);
  const CIELO2 = astrolabio(8, 48, [[60, 20], [88, 80], [58, 140], [86, 200], [62, 265], [88, 320]]);
  $$('.rueda').forEach((el) => { el.innerHTML = el.classList.contains('dos') ? CIELO2 : CIELO1; });
  $('#vitrina').innerHTML = MAZOS.filter((m) => !m.pendiente).map((m) =>
    `<li class="vit tema-${m.id}"><span class="abanico" aria-hidden="true">${m.muestra.slice(0, 3).map((i) => carta(cara(i, m.id, false), m.id)).join('')}</span>
      <p class="precio">${m.anio} · ${m.lugar}</p><h3>${m.nombre}</h3><p>${m.tecnica}. 78 cartas.</p></li>`).join('');

  /* desfile de cartas reales */
  const DESFILE = [['rws', 17], ['dodal', 19], ['sola', 0], ['rws', 2], ['dodal', 1], ['sola', 13], ['rws', 36], ['dodal', 10], ['sola', 21], ['rws', 19], ['dodal', 18], ['sola', 6], ['rws', 6], ['dodal', 64]];
  $('#desfile').innerHTML = DESFILE.concat(DESFILE).map(([m, i]) => `<img src="${src(m, i)}" alt="" loading="lazy" decoding="async">`).join('');

  /* carta del día: la misma durante todo el día, en este dispositivo */
  (function () {
    const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());
    let g = null;
    try { g = JSON.parse(localStorage.getItem('arcana.hoy.v1')); } catch (e) { /* sin almacenamiento */ }
    if (!g || g.dia !== hoy || !CARTAS[g.carta]) {
      const b = new Uint32Array(1); crypto.getRandomValues(b);
      g = { dia: hoy, carta: b[0] % TOTAL, vista: false };
      try { localStorage.setItem('arcana.hoy.v1', JSON.stringify(g)); } catch (e) { /* sigue igual */ }
    }
    const k = CARTAS[g.carta], btn = $('#hoyGiro');
    btn.innerHTML = `<span class="dentro"><span class="lado carta c-rws">${reverso('rws')}</span><span class="lado frente carta c-rws">${cara(g.carta, 'rws', false)}</span></span>`;
    function mostrar() {
      btn.classList.add('vista-carta');
      btn.setAttribute('aria-label', `Tu carta de hoy: ${k.nombre}. Ampliar`);
      $('#hoyTexto').innerHTML = `<p class="pos">Tu carta de hoy</p><h3>${k.nombre}</h3><p class="claves">${k.claves}</p>
        <p class="mensaje">${k.luz}</p>
        <div class="acciones"><button type="button" class="btn primario" data-ir="mazo">Profundizar con tres cartas</button></div>`;
    }
    btn.addEventListener('click', () => {
      if (btn.classList.contains('vista-carta')) { ampliar(g.carta, 'rws'); return; }
      roce(0.22); mostrar();
    });
  })();

  /* entradas por tema */
  const TEMA_IMG = { amor: 6, trabajo: 66, decisiones: 7, crecimiento: 9, general: 17 };
  $('#temasPortada').innerHTML = ['amor', 'trabajo', 'decisiones', 'crecimiento', 'general'].map((id) =>
    `<button type="button" class="tema-p" data-tema-ir="${id}"><img src="${src('rws', TEMA_IMG[id])}" alt="" loading="lazy" decoding="async"><span>${TEMAS.find((t) => t.id === id).nombre}</span></button>`).join('');
  $('#temasPortada').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tema-ir]'); if (!b) return;
    estado.tema = b.dataset.temaIr; pintarTemas(); ir('mazo');
  });

  /* muestra de una lectura */
  (function () {
    const k = CARTAS[17];
    $('#muestra').innerHTML = `${carta(cara(17, 'rws'), 'rws')}
      <div><p class="pos">Presente</p><h3>${k.nombre}</h3><p class="claves">${k.claves}</p>
      <p class="texto">${LECTURA_POS.presente(k)}</p>
      <p class="pregunta"><b>Una pregunta para ti</b>${k.pregunta}</p></div>`;
  })();

  /* ---------- mazos ---------- */
  $('#listaMazos').innerHTML = MAZOS.map((m) => m.pendiente
    ? `<div class="mazo tema-${m.id}"><span class="ficha"><span class="precio">${m.anio} · ${m.lugar}</span><h3>${m.nombre}</h3><p>${m.desc}</p><span class="etiqueta">Se está cargando · disponible muy pronto</span></span></div>`
    : `<button type="button" class="mazo tema-${m.id}" data-mazo="${m.id}">
      <span class="abanico cinco" aria-hidden="true">${m.muestra.map((i) => carta(cara(i, m.id, false), m.id)).join('')}</span>
      <span class="ficha"><span class="precio">${m.anio} · ${m.lugar}</span><h3>${m.nombre}</h3>
        <p>${m.desc}</p><span class="etiqueta">78 cartas · ${m.tecnica}</span>
        <span class="elegir">Leer con este mazo →</span></span>
    </button>`).join('');
  $('#listaMazos').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mazo]'); if (!b) return;
    estado.mazo = b.dataset.mazo; roce(); ir('intencion');
  });

  /* ---------- temas ---------- */
  function pintarTemas() {
    $('#listaTemas').innerHTML = TEMAS.map((t) =>
      `<button type="button" class="chip" role="radio" aria-checked="${t.id === estado.tema}" data-tema="${t.id}" tabindex="${t.id === estado.tema ? 0 : -1}">${t.nombre}</button>`).join('');
  }
  pintarTemas();
  $('#listaTemas').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tema]'); if (!b) return;
    estado.tema = b.dataset.tema; pintarTemas(); $(`[data-tema="${estado.tema}"]`).focus();
  });
  $('#listaTemas').addEventListener('keydown', (e) => {
    const i = TEMAS.findIndex((t) => t.id === estado.tema);
    let j = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % TEMAS.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + TEMAS.length) % TEMAS.length;
    else return;
    e.preventDefault(); estado.tema = TEMAS[j].id; pintarTemas(); $(`[data-tema="${estado.tema}"]`).focus();
  });

  /* ---------- tiradas ---------- */
  $('#listaTiradas').innerHTML = TIRADAS.map((t) =>
    `<button type="button" class="tirada" data-tirada="${t.id}">
      <span class="mini" aria-hidden="true">${t.pos.map(() => '<i></i>').join('')}</span>
      <h3>${t.nombre}</h3><p>${t.desc}</p>
      <ol aria-label="Posiciones">${t.pos.map((p) => `<li>${p.nombre}</li>`).join('')}</ol>
    </button>`).join('');
  $('#listaTiradas').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tirada]'); if (!b) return;
    estado.tirada = TIRADAS.find((t) => t.id === b.dataset.tirada); ir('barajar');
  });

  /* ---------- barajar ---------- */
  let veces = 0;
  function prepararBarajar() {
    barajar(); veces = 0;
    estado.elegidas = []; estado.reveladas = new Set(); estado.guardada = false;
    const back = reverso(estado.mazo);
    $('#pila').innerHTML = Array.from({ length: 9 }, (_, i) =>
      `<span class="carta c-${estado.mazo}" style="--i:${i};--d:${i % 2 ? 1 : -1}">${back}</span>`).join('');
    $('#estadoBarajar').textContent = 'El mazo ya está mezclado al azar.';
  }
  function accionBarajar() {
    barajar(); veces++; roce(0.35, 0.06);
    const p = $('#pila'); p.classList.remove('mezcla'); void p.offsetWidth; p.classList.add('mezcla');
    $('#estadoBarajar').textContent = veces === 1 ? 'Barajaste una vez.' : `Barajaste ${veces} veces.`;
  }
  $('#pila').addEventListener('click', accionBarajar);
  $('#btnBarajar').addEventListener('click', accionBarajar);
  $('#btnRepartir').addEventListener('click', () => { pintarMesa(); ir('elegir'); roce(0.3); });

  /* ---------- elegir ---------- */
  function pintarMesa() {
    const n = estado.tirada.pos.length;
    estado.elegidas = [];
    $('#tituloElegir').textContent = n === 1 ? 'Elige tu carta' : `Elige tus ${n} cartas`;
    const back = reverso(estado.mazo);
    $('#mesa').innerHTML = estado.orden.map((_, k) =>
      `<button type="button" aria-pressed="false" data-k="${k}" aria-label="Carta ${k + 1} de ${TOTAL}, boca abajo" style="--k:${k};--g:${((k * 37) % 5) - 2}deg">${carta(back, estado.mazo)}</button>`).join('');
    actualizarElegir();
  }
  function actualizarElegir() {
    const n = estado.tirada.pos.length, falta = n - estado.elegidas.length;
    $('#estadoElegir').textContent = falta === 0 ? 'Listo. Confirma tu elección o cambia alguna carta.'
      : falta === 1 ? (n === 1 ? 'Las 78 cartas están boca abajo. Toca la que te llame.' : 'Falta 1 carta.') : `Las 78 cartas están boca abajo. Faltan ${falta}.`;
    $('#btnConfirmar').disabled = falta !== 0;
    $$('#mesa button').forEach((b) => {
      const pos = estado.elegidas.indexOf(Number(b.dataset.k));
      b.setAttribute('aria-pressed', String(pos >= 0));
      const o = b.querySelector('.orden'); if (o) o.remove();
      if (pos >= 0) b.insertAdjacentHTML('beforeend', `<span class="orden" aria-hidden="true">${pos + 1}</span>`);
      b.setAttribute('aria-label', `Carta ${Number(b.dataset.k) + 1} de ${TOTAL}, boca abajo` + (pos >= 0 ? `, elegida para ${estado.tirada.pos[pos].nombre}` : ''));
    });
  }
  $('#mesa').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-k]'); if (!b) return;
    const k = Number(b.dataset.k), i = estado.elegidas.indexOf(k), n = estado.tirada.pos.length;
    if (i >= 0) estado.elegidas.splice(i, 1);
    else if (estado.elegidas.length < n) estado.elegidas.push(k);
    else if (n === 1) estado.elegidas = [k];
    else { aviso('Ya elegiste tus cartas. Toca una elegida para cambiarla.'); return; }
    roce(0.1); actualizarElegir();
  });
  $('#btnConfirmar').addEventListener('click', () => { pintarLectura(); ir('lectura'); });

  /* ---------- lectura ---------- */
  const cartasDeLectura = () => estado.elegidas.map((k) => estado.orden[k]);

  function pintarLectura() {
    const ids = cartasDeLectura(), pos = estado.tirada.pos, mz = estado.mazo;
    estado.reveladas = new Set();
    $('#ranuras').className = 'ranuras' + (ids.length === 1 ? ' una' : '');
    $('#ranuras').innerHTML = ids.map((id, i) =>
      `<div class="ranura"><p class="pos">${pos[i].nombre}</p>
        <button type="button" class="giro" data-i="${i}" aria-label="Revelar la carta de ${pos[i].nombre}">
          <span class="dentro"><span class="lado carta c-${mz}">${reverso(mz)}</span><span class="lado frente carta c-${mz}">${cara(id, mz, false)}</span></span>
        </button>
        <p class="nombre" data-n="${i}"></p></div>`).join('');
    $('#interpretacion').hidden = true; $('#interpretacion').innerHTML = '';
    $('#accionesRevelar').hidden = ids.length === 1;
    $('#tituloLectura').textContent = 'Revela tus cartas';
    $('#estadoLectura').textContent = ids.length === 1 ? 'Toca la carta para darla vuelta.' : 'Toca cada carta para darla vuelta.';
  }
  function revelar(i) {
    const ids = cartasDeLectura(), b = $(`.giro[data-i="${i}"]`), k = CARTAS[ids[i]];
    if (estado.reveladas.has(i)) { ampliar(ids[i]); return; }
    estado.reveladas.add(i);
    b.classList.add('vista-carta');
    b.setAttribute('aria-label', `${estado.tirada.pos[i].nombre}: ${k.nombre}. Ampliar la carta`);
    $(`[data-n="${i}"]`).textContent = k.nombre;
    b.parentElement.classList.add('brilla');
    roce(0.22);
    if (estado.reveladas.size === ids.length) {
      $('#accionesRevelar').hidden = true;
      $('#tituloLectura').textContent = 'Tu lectura';
      $('#estadoLectura').textContent = (ids.length === 1 ? `Salió ${k.nombre}.` : `Salieron ${lista(ids.map((x) => CARTAS[x].nombre))}.`) + ' Toca una carta para verla en grande.';
      const lento = !matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(pintarInterpretacion, lento ? 900 : 0);
    } else {
      $('#estadoLectura').textContent = `${estado.tirada.pos[i].nombre}: ${k.nombre}.`;
    }
  }
  $('#ranuras').addEventListener('click', (e) => { const b = e.target.closest('.giro'); if (b) revelar(Number(b.dataset.i)); });
  $('#btnRevelarTodas').addEventListener('click', () => cartasDeLectura().forEach((_, i) => { if (!estado.reveladas.has(i)) revelar(i); }));

  /* ---------- ampliar una carta ---------- */
  const visor = $('#visor');
  function ampliar(i, mazo = estado.mazo) {
    const k = CARTAS[i], nota = notaMazo(i, mazo);
    $('#visorCuerpo').innerHTML = `${carta(cara(i, mazo, false), mazo)}
      <p class="pos">${i < 22 ? 'Arcano mayor ' + numero(i, mazo) : 'Arcano menor · ' + k.palo}</p>
      <h3 id="visorTitulo">${k.nombre}</h3><p class="claves">${k.claves}</p>${nota ? `<p class="nota-mazo">${nota}</p>` : ''}
      <p class="credito">${mazoDe(mazo).credito}</p>`;
    if (visor.showModal) visor.showModal(); else visor.setAttribute('open', '');
  }
  $('#visorCerrar').addEventListener('click', () => visor.close());
  visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
  $('#interpretacion').addEventListener('click', (e) => { const b = e.target.closest('[data-ver]'); if (b) ampliar(Number(b.dataset.ver)); });

  function sintesis(ks) {
    const t = estado.tirada.id;
    let s;
    if (t === 'una') s = `${ks[0].nombre} te deja una imagen para hoy: ${ks[0].hilo}.`;
    else if (t === 'tiempo') s = `Leídas en orden, tus cartas trazan un recorrido: vienes ${de(ks[0].hilo)}, hoy te encuentras con ${ks[1].hilo} y se abre, como posibilidad, ${ks[2].hilo}.`;
    else s = `Juntas, tus cartas muestran tres ángulos de lo mismo: la situación lleva la marca ${de(ks[0].hilo)}, el desafío te pone frente a ${ks[1].hilo} y la posibilidad apunta hacia ${ks[2].hilo}.`;
    if (ks.length > 1) {
      const may = ks.filter((k) => !k.palo).length, palos = ks.filter((k) => k.palo).map((k) => k.palo);
      const rep = palos.find((p, i) => palos.indexOf(p) !== i);
      const SENT = { Bastos: 'la acción y las ganas', Copas: 'los afectos', Espadas: 'las ideas y las palabras', Oros: 'lo concreto y cotidiano' };
      if (may === ks.length) s += ' Las tres son arcanos mayores: la lectura habla de temas de fondo más que de asuntos del día a día.';
      else if (may === 0 && rep) s += ` Se repite el palo de ${rep}: el acento está en ${SENT[rep]}.`;
      else if (may === 0) s += ' Son todas arcanos menores: la lectura se mueve en lo cotidiano, en gestos y situaciones concretas.';
    }
    return s;
  }

  function pintarInterpretacion() {
    const ids = cartasDeLectura(), ks = ids.map((i) => CARTAS[i]), pos = estado.tirada.pos, mz = estado.mazo;
    const tema = TEMAS.find((t) => t.id === estado.tema);
    let h = `<div class="adorno" aria-hidden="true"></div><div><p class="intro">${tema.intro}</p>${estado.pregunta ? `<p class="cita">Tu pregunta: «${esc(estado.pregunta)}». Tenla presente mientras lees.</p>` : ''}</div>`;
    h += ks.map((k, i) => {
      const nota = notaMazo(ids[i], mz);
      return `<article class="bloque"><button type="button" class="ver" data-ver="${ids[i]}" aria-label="Ampliar ${esc(k.nombre)}">${carta(cara(ids[i], mz), mz)}</button>
        <div><p class="pos">${pos[i].nombre}</p><h3>${k.nombre}</h3><p class="claves">${k.claves}</p>
        <p class="texto">${LECTURA_POS[pos[i].id](k)}</p>${nota ? `<p class="nota-mazo">${nota}</p>` : ''}</div></article>`;
    }).join('');
    h += `<section class="sintesis"><h3>${ks.length === 1 ? 'En síntesis' : 'Leídas en conjunto'}</h3><p>${sintesis(ks)}</p><p>${tema.cierre}</p></section>`;
    h += `<section><h3>Preguntas para ti</h3><ul>${ks.map((k) => `<li>${k.pregunta}</li>`).join('')}</ul></section>`;
    h += `<section><h3>Para seguir explorando</h3><ul>${tema.acciones.map((a) => `<li>${a}</li>`).join('')}</ul></section>`;
    h += `<p class="descargo">Esta es una interpretación simbólica, pensada para reflexionar. No predice lo que va a pasar ni reemplaza el consejo de un profesional.</p>`;
    h += `<section class="cierre"><h3>Tu reflexión</h3>
      <label class="campo" for="notaLectura" style="margin-top:8px">Una nota privada <span>(opcional)</span></label>
      <textarea id="notaLectura" rows="3" maxlength="1000" placeholder="¿Qué te llevas de esta lectura?"></textarea>
      <div class="acciones">
        <button type="button" class="btn primario" id="btnGuardar">Guardar en mi espacio</button>
        <button type="button" class="btn" id="btnOtra">Hacer otra lectura</button>
      </div></section>`;
    const el = $('#interpretacion'); el.innerHTML = h; el.hidden = false;
  }

  /* ---------- guardar / historial (solo en este dispositivo) ---------- */
  function leer() { try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch (e) { return []; } }
  function escribir(a) { try { localStorage.setItem(CLAVE, JSON.stringify(a)); return true; } catch (e) { return false; } }

  $('#interpretacion').addEventListener('click', (e) => {
    if (e.target.id === 'btnOtra') { ir('mazo'); return; }
    if (e.target.id !== 'btnGuardar') return;
    const a = leer(), nota = $('#notaLectura').value.trim();
    if (estado.guardada) {
      const r = a.find((x) => x.id === estado.guardada); if (r) r.nota = nota;
    } else {
      estado.guardada = 'l' + Date.now();
      a.unshift({ id: estado.guardada, fecha: new Date().toISOString(), mazo: estado.mazo, tema: estado.tema, tirada: estado.tirada.id,
        cartas: cartasDeLectura(), pregunta: estado.pregunta, nota });
    }
    if (escribir(a)) { aviso('Lectura guardada en tu espacio.'); e.target.textContent = 'Actualizar nota'; }
    else { estado.guardada = false; aviso('No se pudo guardar en este navegador.'); }
  });

  const fmtFecha = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  function pintarHistorial() {
    const a = leer(), el = $('#historial');
    if (!a.length) {
      el.innerHTML = `<div class="vacio"><p>Todavía no guardas ninguna lectura.</p><div class="acciones" style="justify-content:center"><button type="button" class="btn primario" data-ir="mazo">Comenzar mi lectura</button></div></div>`;
      return;
    }
    el.innerHTML = a.map((r) => {
      const t = TIRADAS.find((x) => x.id === r.tirada) || TIRADAS[0], tema = TEMAS.find((x) => x.id === r.tema) || TEMAS[0];
      const mz = mazoDe(r.mazo), cartas = (r.cartas || []).filter((i) => CARTAS[i]);
      return `<article class="registro">
        <p class="fecha">${fmtFecha.format(new Date(r.fecha))}</p>
        <h3 style="margin-top:6px">${t.nombre} · ${tema.nombre}</h3>
        <div class="mini-cartas">${cartas.map((i) => carta(cara(i, mz.id), mz.id)).join('')}</div>
        <p>${cartas.map((i, n) => `${t.pos[n] ? t.pos[n].nombre + ': ' : ''}${CARTAS[i].nombre}`).join(' · ')}</p>
        <p style="margin-top:4px">Mazo ${mz.nombre}, ${mz.anio}</p>
        ${r.pregunta ? `<p style="margin-top:6px"><em>«${esc(r.pregunta)}»</em></p>` : ''}
        ${r.nota ? `<p class="nota-propia">${esc(r.nota)}</p>` : ''}
        <div class="acciones" style="margin-top:14px"><button type="button" class="btn chico" data-borrar="${esc(r.id)}">Borrar esta lectura</button></div>
      </article>`;
    }).join('');
  }
  $('#historial').addEventListener('click', (e) => {
    const b = e.target.closest('[data-borrar]'); if (!b) return;
    if (b.dataset.seguro !== '1') { b.dataset.seguro = '1'; b.textContent = 'Toca de nuevo para borrar'; return; }
    escribir(leer().filter((x) => x.id !== b.dataset.borrar)); pintarHistorial(); aviso('Lectura borrada.');
  });

  $('#creditos').innerHTML = MAZOS.map((m) => `<li>${m.credito}</li>`).join('');
  /* ---------- aparición al hacer scroll ---------- */
  document.documentElement.classList.add('js');
  const ojo = 'IntersectionObserver' in window
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); ojo.unobserve(e.target); } }), { threshold: 0.12 })
    : null;
  $$('.tramo > h2, .tramo > .bajada, .vit, .pasos li, .mazo, .tirada, .tema-p, .plan, .garantias li, .muestra, .hoy, .faq details, .final').forEach((el) => {
    el.classList.add('revela');
    el.style.setProperty('--r', Array.prototype.indexOf.call(el.parentElement.children, el) % 4);
    if (ojo) ojo.observe(el); else el.classList.add('visto');
  });

  /* Al actualizar, la página parte de cero: arriba y sin nada tocado. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });
  ir('inicio', false);
})();
