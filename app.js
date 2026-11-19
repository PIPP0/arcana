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

  /* ---------- reflexión: conecta cada carta con el tema y con la pregunta ---------- */
  const AMBITO = {
    general: { en: 'en este momento de tu vida', a: 'tu día a día', pas: 'en tu historia reciente' },
    amor: { en: 'en tus vínculos', a: 'tus relaciones', pas: 'en la historia de tus vínculos' },
    trabajo: { en: 'en tu trabajo y tus proyectos', a: 'tu trabajo', pas: 'en tu recorrido de trabajo' },
    crecimiento: { en: 'en tu camino personal', a: 'tu propio crecimiento', pas: 'en tu propio recorrido' },
    decisiones: { en: 'frente a la decisión que tienes delante', a: 'esa decisión', pas: 'en lo que te trajo hasta esta decisión' },
    libre: { en: 'en aquello que preguntas', a: 'tu pregunta', pas: 'en lo que hay detrás de tu pregunta' }
  };
  const mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  function reflexion(pos, k, tema) {
    const A = AMBITO[tema] || AMBITO.general;
    switch (pos) {
      case 'pasado': return `Mira hacia atrás, ${A.pas}: ¿en qué momento apareció ${k.hilo}? Esta carta no te pide volver ahí, sino reconocer qué de eso sigue contigo y qué ya puedes dejar donde está.`;
      case 'presente': return `Hoy, ${A.en}, la carta pone al centro ${k.hilo}. ${k.sombra} ¿Dónde lo has notado en estos días?`;
      case 'futuro': return `Nada está escrito, pero esta carta abre una posibilidad ${A.en}. ${k.luz} ¿Qué gesto pequeño, tuyo, la haría más probable?`;
      case 'situacion': return `${mayus(A.en)}, el punto de partida es ${k.hilo}. ¿Lo reconoces en lo que estás viviendo? ¿Qué nombre le pondrías tú?`;
      case 'desafio': return `${k.sombra} Llévalo a ${A.a}: ¿dónde te está pasando justo eso?`;
      case 'posibilidad': return `${k.luz} ${mayus(A.en)}, ¿cómo se vería eso en la práctica esta semana?`;
      default: return `${k.luz} Llévalo a ${A.a}: ¿qué cambiaría hoy si miraras las cosas desde ${k.hilo}?`;
    }
  }
  const PREG_TEMA = {
    amor: (h) => `¿Qué lugar le das a ${h} en la forma en que te vinculas?`,
    trabajo: (h) => `¿Dónde aparece ${h} en tu trabajo, y qué harías distinto si lo tomaras en serio?`,
    crecimiento: (h) => `¿Qué te está enseñando ${h} sobre quien estás siendo?`,
    decisiones: (h) => `Si eligieras desde ${h}, ¿qué opción tomarías?`
  };
  // Lee la forma de la pregunta para devolverla con más luz, sin responderla por la persona.
  function leerPregunta(q) {
    const t = q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const r = { notas: [], apoyo: false, profesional: false };
    if (/suicid|matarme|quitarme la vida|no quiero vivir|no quiero seguir viviendo|hacerme dano|morirme/.test(t)) r.apoyo = true;
    if (/enferm|cancer|embaraz|diagnostic|operacion|tratamiento|juicio|demanda|abogad|invertir|inversion|prestamo|credito|deuda/.test(t)) r.profesional = true;
    if (/\bcuando\b/.test(t)) r.notas.push('El tarot no da fechas. Lo que sí puede mostrarte es qué tendría que moverse en ti para que ese momento se acerque.');
    if (/\b(el|ella|mi ex|mi pareja|mi pololo|mi polola|mi esposo|mi esposa|mi marido|mi jefe|mi jefa|mi mama|mi papa|mi amig[oa])\b.*\b(quiere|ama|siente|piensa|volvera|vuelve|hara|va a)\b|me (quiere|ama|extrana)|piensa en mi|siente por mi/.test(t))
      r.notas.push('Tu pregunta mira hacia otra persona. Las cartas solo pueden hablar de tu parte: de lo que sientes, de lo que esperas y de lo que puedes hacer tú.');
    if (/^[¿\s]*(debo|deberia|acepto|me conviene|conviene|sera|va a|voy a|volvera|tendre|podre|lograre|es bueno|esta bien|hay|me va a|lo voy a|vale la pena|sigo|renuncio|me cambio|me quedo)\b/.test(t) || /\bo no\b/.test(t))
      r.notas.push('Tu pregunta busca un sí o un no. Las cartas no responden así: te devuelven la pregunta con más luz. Prueba a darle la vuelta: en lugar de «¿qué va a pasar?», «¿qué necesito ver para elegir?».');
    if (/por que/.test(t)) r.notas.push('Preguntas por un porqué. Quizás las cartas no te den la causa, pero sí una imagen desde donde entenderla.');
    if (!r.notas.length) r.notas.push('Tenla presente mientras lees: cada carta es una manera distinta de mirarla.');
    return r;
  }

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
  const src = (mazo, i) => `img/${mazo}/${String(i).padStart(2, '0')}.webp${mazo === 'rws' ? '?v=2' : ''}`;
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

  /* ---------- confirmar antes de borrar (modal) ---------- */
  function confirmarModal({ titulo, texto, boton = 'Borrar', tono = 'peligro', terminos = false }) {
    return new Promise((resolver) => {
      const d = $('#modalConfirmar'); if (!d || !d.showModal) { resolver(window.confirm(`${titulo}\n\n${texto}`)); return; }
      const enl = $('#mcEnlace'); if (enl) enl.hidden = !terminos;
      $('#mcTitulo').textContent = titulo; $('#mcTexto').textContent = texto; $('#mcAceptar').textContent = boton; $('#mcAceptar').className = 'btn ' + (tono === 'normal' ? 'primario' : 'peligro');
      let hecho = false;
      const fin = (v) => { if (hecho) return; hecho = true; limpiar(); if (d.open) d.close(); resolver(v); };
      const si = () => fin(true), no = () => fin(false), fuera = (e) => { if (e.target === d) fin(false); }, cancel = (e) => { e.preventDefault(); fin(false); };
      const limpiar = () => { $('#mcAceptar').removeEventListener('click', si); $('#mcCancelar').removeEventListener('click', no); d.removeEventListener('click', fuera); d.removeEventListener('cancel', cancel); };
      $('#mcAceptar').addEventListener('click', si); $('#mcCancelar').addEventListener('click', no); d.addEventListener('click', fuera); d.addEventListener('cancel', cancel);
      d.showModal(); $('#mcCancelar').focus(); // el foco parte en «Cancelar» para no borrar sin querer
    });
  }

  /* ---------- sonido (apagado por defecto) ----------
     Cinco estilos (sonido.js). La persona elige el suyo con la flecha junto a «Sonido». */
  let sonido = false;
  const S = window.ArcanaSonido;
  const sonidoOk = () => permisos().sonido !== false;
  const estiloOk = (id) => ((permisos().estilos) || {})[id] !== false;
  const dice = (acc) => { if (sonido && S && sonidoOk()) S.sonar(acc); };
  const sfx = {
    encender: () => dice('encender'), apagar() {}, tick: () => dice('tema'), mazo: () => dice('mazo'), tirada: () => dice('tirada'),
    barajar: () => dice('barajar'), repartir: () => dice('repartir'), elegir: (n) => dice('elegir' + (Math.min(n, 2) + 1)), soltar: () => dice('soltar'),
    confirmar: () => dice('confirmar'), revelar: (i) => dice('revelar' + ((i % 3) + 1)), entrega: (suave) => dice(suave ? 'entregaSuave' : 'entrega'),
    negado: () => dice('negado'), guardar: () => dice('guardar')
  };
  document.addEventListener('visibilitychange', () => { if (!S) return; if (document.hidden) S.suspender(); else if (sonido) S.reanudar(); });
  const btnSon = $('#btnSonido'), btnEst = $('#btnEstilo'), menuSon = $('#menuSonido');
  function pintarMenuSonido() {
    if (!S || !menuSon) return;
    menuSon.innerHTML = S.estilos.map((e) => { const ok = estiloOk(e.id); return `<button type="button" role="menuitemradio" aria-checked="${e.id === S.actual()}" data-estilo="${e.id}"${ok ? '' : ' class="bloq" data-bloq="1"'}><b>${e.id}. ${e.nombre}${ok ? '' : ' · ' + bloqueo((P) => (P.estilos || {})[e.id] !== false)}</b><span>${ok ? e.desc : invitacion((P) => (P.estilos || {})[e.id] !== false) + '.'}</span></button>`; }).join('');
  }
  /* Si el perfil cambia: el estilo elegido debe estar incluido y el sonido permitido. */
  function ajustarSonidoPerfil() {
    if (!S) return;
    if (!estiloOk(S.actual())) { const ok = S.estilos.find((x) => estiloOk(x.id)); if (ok) S.poner(ok.id); }
    if (sonido && !sonidoOk()) { sonido = false; btnSon.setAttribute('aria-pressed', 'false'); btnSon.textContent = 'Sonido: no'; if (btnEst) btnEst.hidden = true; cerrarMenuSonido(); }
    btnSon.classList.toggle('bloq', !sonidoOk()); btnSon.title = sonidoOk() ? '' : bloqueo((P) => P.sonido !== false);
    pintarMenuSonido();
  }
  function cerrarMenuSonido() { if (menuSon) menuSon.hidden = true; if (btnEst) btnEst.setAttribute('aria-expanded', 'false'); }
  btnSon.addEventListener('click', (e) => {
    if (!sonido && !sonidoOk()) { irDesbloqueo((P) => P.sonido !== false, 'El sonido'); return; }
    sonido = !sonido;
    e.currentTarget.setAttribute('aria-pressed', String(sonido));
    e.currentTarget.textContent = sonido ? 'Sonido: sí' : 'Sonido: no';
    if (btnEst) btnEst.hidden = !sonido || !S;
    if (!sonido) cerrarMenuSonido(); else sfx.encender();
  });
  if (btnEst) btnEst.addEventListener('click', () => {
    pintarMenuSonido(); const abrir = menuSon.hidden; menuSon.hidden = !abrir; btnEst.setAttribute('aria-expanded', String(abrir));
    if (abrir) { const sel = menuSon.querySelector('[aria-checked="true"]'); if (sel) sel.focus(); }
  });
  if (menuSon) menuSon.addEventListener('click', (e) => {
    const b = e.target.closest('[data-estilo]'); if (!b) return;
    if (b.dataset.bloq) { cerrarMenuSonido(); irDesbloqueo((P) => (P.estilos || {})[b.dataset.estilo] !== false, 'Este estilo de sonido'); return; }
    S.poner(Number(b.dataset.estilo)); pintarMenuSonido(); sfx.encender(); cerrarMenuSonido(); btnEst.focus();
  });
  document.addEventListener('click', (e) => { if (menuSon && !menuSon.hidden && !e.target.closest('.sonido-caja')) cerrarMenuSonido(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuSon && !menuSon.hidden) { cerrarMenuSonido(); btnEst.focus(); } });

  /* ---------- navegación ---------- */
  const CON_TEMA = ['intencion', 'tirada', 'barajar', 'elegir', 'lectura'];
  function ir(id, foco = true) {
    if (id === 'tirada') estado.pregunta = $('#pregunta').value.trim();
    if (id === 'barajar') prepararBarajar();
    if (id === 'espacio') { carIdx = 0; pintarHistorial(); pintarCalendario(); }
    if (id === 'perfil') pintarCuenta();
    if (id === 'intencion') pintarTemas();
    if (id === 'mazo' || id === 'tirada') pintarCupo();
    if (id === 'tirada') pintarTiradas();
    pintarRuta(id);
    window.Nube.vista(id);
    if (id === 'barajar') window.Nube.eleccion({ mazo: estado.mazo, tema: estado.tema, tirada: estado.tirada && estado.tirada.id });
    $$('.vista').forEach((v) => { v.hidden = v.id !== 'v-' + id; });
    document.body.className = (id === 'detalle' ? 'tema-' + detMazo : CON_TEMA.includes(id) ? 'tema-' + estado.mazo : '') + (id === 'elegir' ? ' con-fija' : '') + (id === 'inicio' ? '' : ' interior');
    window.scrollTo(0, 0);
    try { sessionStorage.setItem('arcana.vista.v1', id === 'detalle' ? 'detalle:' + detId : id); } catch (e) { /* sin almacenamiento */ }
    if (foco) { const h = $('#v-' + id + ' h1, #v-' + id + ' h2'); if (h) h.focus({ preventScroll: true }); }
  }
  document.addEventListener('click', (e) => {
    const en = e.target.closest('[data-entrar]'); if (en) { irEntrar('Entra o crea tu cuenta gratis: guarda tus lecturas, tu calendario y tu avatar.'); return; }
    const pl = e.target.closest('[data-planes]'); if (pl) { irAPlanes(); return; }
    const sus = e.target.closest('[data-suscribir]');
    if (sus) { if (esInvitado()) irEntrar('Primero crea tu cuenta gratis; después te suscribes.'); else iniciarPago(sus.dataset.suscribir, sus); return; }
    const b = e.target.closest('[data-ir]');
    if (b) ir(b.dataset.ir);
  });

  function pintarRuta(id) {
    const m = mazoDe(estado.mazo), tema = TEMAS.find((t) => t.id === estado.tema);
    const con = { intencion: 1, tirada: 2, barajar: 3, elegir: 3, lectura: 3 }[id] || 0;
    const partes = [`<span class="r-mazo">${carta(reverso(m.id), m.id)}<span><b>${m.nombre}</b>${m.anio}</span></span>`];
    if (con >= 2) partes.push(`<span><b>Tema</b>${tema.nombre}</span>`);
    if (con >= 3 && estado.tirada) partes.push(`<span><b>Tirada</b>${estado.tirada.nombre}</span>`);
    $$('[data-ruta]').forEach((el) => { el.innerHTML = con ? partes.join('') : ''; });
  }

  /* ---------- inicio ---------- */
  $('#heroCartas').innerHTML = [18, 17, 19].map((i) => carta(cara(i, 'rws', false), 'rws')).join('');

  /* Astrolabio: círculos, marcas y una constelación trazada. */
  function astrolabio(n, marcas, puntos) {
    let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200" fill="none" stroke="#e2c17c" stroke-width=".35">';
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
      s += `<circle cx="${x}" cy="${y}" r="${i % 3 ? 0.9 : 1.6}" fill="#e2c17c" stroke="none"/>`;
    });
    return s + `<path d="${d}" opacity=".55"/></svg>`;
  }
  const CIELO1 = astrolabio(12, 72, [[85, 10], [70, 34], [86, 62], [66, 95], [84, 130], [72, 168], [87, 205], [68, 248], [85, 290], [71, 330]]);
  const CIELO2 = astrolabio(8, 48, [[60, 20], [88, 80], [58, 140], [86, 200], [62, 265], [88, 320]]);
  const comoImg = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  const IMG1 = comoImg(CIELO1), IMG2 = comoImg(CIELO2);
  $$('.rueda').forEach((el) => { el.innerHTML = `<img alt="" src="${el.classList.contains('dos') ? IMG2 : IMG1}">`; });
  document.documentElement.style.setProperty('--astro', `url("${IMG1}")`);
  const permisos = () => window.Nube.permisos();
  const NOMBRE_PERFIL = { invitado: 'Invitado', free: 'Free', full: 'Full', premium: 'Premium' };
  const mazoVisible = (id) => ((window.Nube.funciones().mazos) || {})[id] !== false;
  const mazoActivo = (id) => mazoVisible(id) && ((permisos().mazos) || {})[id] !== false;
  const mazoIncluido = (id) => ((permisos().mazos) || {})[id] !== false;
  const tiradaIncluida = (id) => ((permisos().tiradas) || {})[id] !== false;
  /* Qué plan abre algo que el perfil actual no incluye (el más barato que lo tenga). */
  const NOMBRES_PLAN = { free: 'Free', full: 'Full', premium: 'Premium' };
  function planQueAbre(prueba) { const T = window.Nube.todosPerfiles(); return ['full', 'premium'].find((k) => prueba(T[k] || {})) || 'premium'; }
  /* Sin sesión (Invitado) lo que Free ya incluye se abre «entrando gratis»; lo demás, suscribiéndose. */
  const esInvitado = () => window.Nube.perfil() === 'invitado';
  function desbloqueo(prueba) { const T = window.Nube.todosPerfiles(); return esInvitado() && prueba(T.free || {}) ? 'entrar' : 'suscribir'; }
  const bloqueo = (prueba) => (prueba && desbloqueo(prueba) === 'entrar' ? 'Entra gratis' : 'Con suscripción');
  const invitacion = (prueba) => (desbloqueo(prueba) === 'entrar' ? 'Descúbrelo entrando gratis' : 'Descúbrelo suscribiéndote');
  const attrDesb = (prueba) => (desbloqueo(prueba) === 'entrar' ? 'data-entrar="1"' : 'data-planes="1"');
  function irEntrar(msg) { ir('perfil'); if (msg) aviso(msg); }
  function irDesbloqueo(prueba, que) {
    if (desbloqueo(prueba) === 'entrar') irEntrar(`${que} se abre entrando gratis. Crea tu cuenta en un minuto.`);
    else irAPlanes(`${que} se abre con una suscripción. Mira los planes.`);
  }
  function irAPlanes(msg) {
    ir('inicio', false);
    setTimeout(() => { const p = $('#planes'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    if (msg) aviso(msg);
  }
  const tiradasPermitidas = () => TIRADAS.filter((t) => ((permisos().tiradas) || {})[t.id] !== false);
  const temasPermitidos = () => TEMAS.filter((t) => t.id !== 'libre' || permisos().temaLibre !== false);
  /* cupo diario de lecturas (se cuenta en este dispositivo) */
  const diaChile = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());
  function lecturasHoy() { try { const c = JSON.parse(localStorage.getItem('arcana.cupo.v1')); return c && c.dia === diaChile() ? c.n : 0; } catch (e) { return 0; } }
  function contarLectura() { try { localStorage.setItem('arcana.cupo.v1', JSON.stringify({ dia: diaChile(), n: lecturasHoy() + 1 })); } catch (e) { /* sigue igual */ } }
  const tope = () => { const l = permisos().lecturasDia; return typeof l === 'number' ? l : null; };
  const cupoAgotado = () => tope() !== null && lecturasHoy() >= tope();
  function textoCupo() {
    const t = tope(); if (t === null) return '';
    const p = NOMBRE_PERFIL[window.Nube.perfil()];
    const pl = (n) => (n === 1 ? 'lectura' : 'lecturas');
    if (esInvitado()) return cupoAgotado() ? `Hoy ya hiciste tus ${t} ${pl(t)} como invitado. Entra gratis para seguir leyendo.` : `Como invitado te quedan ${t - lecturasHoy()} de ${t} ${pl(t)} hoy.`;
    return cupoAgotado() ? `Hoy ya hiciste tus ${t} ${pl(t)} del perfil ${p}. Mañana vuelves a tener ${t}.` : `Perfil ${p}: te quedan ${t - lecturasHoy()} de ${t} ${pl(t)} hoy.`;
  }
  function pintarCupo() {
    const n = $('#cupoNota'); if (!n) return; const x = textoCupo(); n.hidden = !x;
    n.innerHTML = x ? esc(x) + (esInvitado()
      ? ` <button type="button" class="enlace-p" data-entrar="1">${cupoAgotado() ? 'Entra gratis y sigue leyendo' : 'Entra gratis y lee más'} →</button>`
      : (cupoAgotado() || window.Nube.perfil() === 'free' ? ` <button type="button" class="enlace-p" data-planes="1">${cupoAgotado() ? 'Sigue leyendo hoy suscribiéndote' : 'Lee sin límites suscribiéndote'} →</button>` : '')) : '';
    n.classList.toggle('agotado', cupoAgotado());
  }
  const activos = () => MAZOS.filter((m) => !m.pendiente && mazoVisible(m.id));
  /* Los textos y el centrado se ajustan a cuántos mazos incluye el perfil (y no estén apagados). */
  function ajustarTextosMazos() {
    const n = activos().length, pocos = n < 3;
    const num = { 1: ['Una obra', 'una obra histórica', 'Una obra histórica'], 2: ['Dos mazos', 'dos obras históricas', 'Dos obras históricas'] }[n] || ['Tres mazos', 'tres obras históricas', 'Tres obras históricas'];
    const set = (id, t) => { const el = $(id); if (el) el.textContent = t; };
    set('#vitTitulo', n === 3 ? 'Tres mazos, cinco siglos de arte' : n === 2 ? 'Dos mazos, de la historia del tarot' : 'Una obra de la historia del tarot');
    set('#vitBajada', `No son ilustraciones genéricas: son las cartas originales de ${num[1]}, completas.`);
    set('#pasoMazo', `${num[2]} muy distintas. Cambia la imagen; el sentido de cada carta se mantiene.`.replace('Una obra histórica muy distintas', 'Una obra histórica completa'));
    set('#mazoBajada', `${num[2]}, cada una con sus 78 cartas originales. Cambia la imagen, no el significado.`.replace('Una obra histórica, cada una', 'Una obra histórica, con'));
    ['#vitrina', '#listaMazos'].forEach((id) => { const el = $(id); if (el) { el.classList.toggle('pocos', pocos); el.style.setProperty('--n', Math.max(1, n)); } });
  }
  const pintarVitrina = () => { $('#vitrina').innerHTML = activos().map((m) =>
    `<li class="vit tema-${m.id}${mazoIncluido(m.id) ? '' : ' bloq'}"><span class="abanico" aria-hidden="true">${m.muestra.slice(0, 3).map((i) => carta(cara(i, m.id, false), m.id)).join('')}</span>
      <p class="precio">${m.anio} · ${m.lugar}</p><h3>${m.nombre}</h3><p>${m.tecnica}. 78 cartas.</p>
      ${mazoIncluido(m.id) ? '' : `<button type="button" class="suscr" ${attrDesb((P) => (P.mazos || {})[m.id] !== false)}><span class="sello-p">${bloqueo((P) => (P.mazos || {})[m.id] !== false)}</span>${invitacion((P) => (P.mazos || {})[m.id] !== false)} →</button>`}</li>`).join('');
    ajustarTextosMazos(); };
  pintarVitrina();

  /* desfile de cartas reales */
  const DESFILE = [['rws', 17], ['dodal', 19], ['sola', 0], ['rws', 2], ['dodal', 1], ['sola', 13], ['rws', 36], ['dodal', 10], ['sola', 21], ['rws', 19], ['dodal', 18], ['sola', 6], ['rws', 6], ['dodal', 64]];
  const pintarDesfile = () => { const D = DESFILE.filter(([m]) => mazoVisible(m)); $('#desfile').innerHTML = D.concat(D).map(([m, i]) => `<img src="${src(m, i)}" alt="" loading="lazy" decoding="async">`).join(''); };
  pintarDesfile();

  /* carta del día: la misma durante todo el día.
     Sin sesión se reconoce por el navegador; con sesión queda guardada en la cuenta, así que es la misma en cualquier dispositivo.
     Un interruptor permite ocultarla y volver a verla cuando quieras. */
  (function () {
    const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());
    const KH = 'arcana.hoy.v1';
    let g = null;
    try { g = JSON.parse(localStorage.getItem(KH)); } catch (e) { /* sin almacenamiento */ }
    if (!g || g.dia !== hoy || !CARTAS[g.carta]) {
      const b = new Uint32Array(1); crypto.getRandomValues(b);
      g = { dia: hoy, carta: b[0] % TOTAL, vista: false };
    }
    const guardarG = () => { try { localStorage.setItem(KH, JSON.stringify(g)); } catch (e) { /* sigue igual */ } };
    guardarG();
    let k = CARTAS[g.carta];
    const btn = $('#hoyGiro'), txt = $('#hoyTexto');
    const visible = () => btn.classList.contains('vista-carta');
    function caras() {
      k = CARTAS[g.carta];
      btn.innerHTML = `<span class="dentro"><span class="lado carta c-rws">${reverso('rws')}</span><span class="lado frente carta c-rws">${cara(g.carta, 'rws', false)}</span></span>`;
    }
    caras();
    const interruptor = (on) => `<label class="sw"><input type="checkbox" id="hoySw" role="switch" ${on ? 'checked' : ''}><span class="sw-pista" aria-hidden="true"></span><span class="sw-txt">Ocultar carta</span></label>`;
    function pintarEspera() {
      btn.classList.remove('vista-carta'); btn.setAttribute('aria-label', 'Dar vuelta mi carta de hoy');
      if (btn.parentElement) btn.parentElement.classList.remove('abierta');
      txt.innerHTML = '<p class="hoy-espera">Está boca abajo, esperándote.</p>';
    }
    function mostrar() {
      anotarDia(hoy, g.carta); // toda carta visible queda anotada en el calendario
      btn.classList.add('vista-carta');
      if (btn.parentElement) btn.parentElement.classList.add('abierta');
      btn.setAttribute('aria-label', `Tu carta de hoy: ${k.nombre}. Ampliar`);
      const lente = [
        `Hoy te acompaña ${k.hilo}. Fíjate dónde aparece: en una conversación, en una decisión pequeña, en cómo te tratas a ti.`,
        `Si tuvieras que ponerle nombre a tu día, esta carta sugiere ${k.hilo}. Mira dónde se asoma, aunque sea en algo pequeño.`,
        `Lleva ${k.hilo} como una lente: ¿cómo se ve tu jornada desde ahí?`][g.carta % 3];
      txt.innerHTML = `<div class="hoy-cab"><p class="pos">Tu carta de hoy</p>${interruptor(true)}</div><h3>${k.nombre}</h3><p class="claves">${k.claves}</p>
        <p class="mensaje">${k.esencia}</p>
        <div class="hoy-bloques">
          <div><b>Para tu día</b><p>${lente} ${k.luz}</p></div>
          <div><b>Ten presente</b><p>${k.sombra}</p></div>
          <div class="noche"><b>Una pregunta para ti</b><p>${k.pregunta}</p></div>
        </div>
        ${window.Nube.usuario() ? '' : '<div class="persuade corta"><b>Que tu carta te siga</b><p>Entra gratis y tu carta del día queda en tu cuenta, igual en todos tus dispositivos, con tu calendario.</p><div class="acciones"><button type="button" class="btn chico primario" data-entrar="1">Entrar gratis</button></div></div>'}
        <div class="acciones"><button type="button" class="btn primario" data-ir="mazo">Profundizar con tres cartas</button></div>`;
    }
    function guardarVista(v) { g.vista = v; guardarG(); }
    function revelar() {
      sfx.revelar(1); setTimeout(() => sfx.entrega(true), 650);
      mostrar(); window.Nube.cartaHoy();
      if (window.Nube.usuario()) guardarVista(true);
    }
    function ocultar() { pintarEspera(); if (window.Nube.usuario()) guardarVista(false); }
    /* la cuenta manda: si ya tiene carta para hoy, esa es la de todos sus dispositivos */
    function cambiarCarta(id) {
      const estaba = visible(); g.carta = id; guardarG(); caras();
      if (estaba) mostrar(); else pintarEspera();
    }

    if (g.vista && window.Nube.usuario()) mostrar(); else pintarEspera();
    btn.addEventListener('click', () => { if (visible()) ampliar(g.carta, 'rws'); else revelar(); });
    txt.addEventListener('change', (e) => { if (e.target.id !== 'hoySw' || e.target.checked) return; sfx.tick(); ocultar(); }); // el interruptor solo oculta; para volver a verla se toca la carta

    let reclamada = false;
    window.Nube.alCambiarUsuario((u) => {
      if (u) {
        const f = window.Nube.ficha();
        if (f) {
          if (f.hoy && f.hoy.dia === hoy && Number.isInteger(f.hoy.carta) && CARTAS[f.hoy.carta]) { if (f.hoy.carta !== g.carta) cambiarCarta(f.hoy.carta); }
          else if (!reclamada) { reclamada = true; window.Nube.guardarFicha({ hoy: { dia: hoy, carta: g.carta } }).catch(() => { /* sin reglas nuevas: queda en este navegador */ }); }
        }
        if (visible()) { mostrar(); guardarVista(true); } else if (g.vista) mostrar();
      } else { if (visible()) mostrar(); if (g.vista) guardarVista(false); }
    });
  })();

  /* entradas por tema */
  const TEMA_IMG = { amor: 6, trabajo: 66, decisiones: 7, crecimiento: 9, general: 17, libre: 2 };
  $('#temasPortada').innerHTML = ['amor', 'trabajo', 'decisiones', 'crecimiento', 'general'].map((id) =>
    `<button type="button" class="tema-p" data-tema-ir="${id}"><img src="${src('rws', TEMA_IMG[id])}" alt="" loading="lazy" decoding="async"><span>${TEMAS.find((t) => t.id === id).nombre}</span></button>`).join('');
  $('#temasPortada').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tema-ir]'); if (!b) return;
    estado.tema = b.dataset.temaIr; sfx.tick(); pintarTemas(); ir('mazo');
  });

  /* muestra de una lectura */
  (function () {
    const k = CARTAS[17];
    $('#muestra').innerHTML = `${carta(cara(17, 'rws'), 'rws')}
      <div><p class="pos">Presente · Crecimiento personal</p><h3>${k.nombre}</h3><p class="claves">${k.claves}</p>
      <p class="significa">${k.esencia}</p><p class="rot">Para ti</p><p class="texto">${reflexion('presente', k, 'crecimiento')}</p>
      <p class="pregunta"><b>Una pregunta para ti</b>${k.pregunta}</p></div>`;
  })();

  /* ---------- mazos ---------- */
  const pintarListaMazos = () => { $('#listaMazos').innerHTML = MAZOS.filter((m) => m.pendiente || mazoVisible(m.id)).map((m) => m.pendiente
    ? `<div class="mazo tema-${m.id}"><span class="ficha"><span class="precio">${m.anio} · ${m.lugar}</span><h3>${m.nombre}</h3><p>${m.desc}</p><span class="etiqueta">Se está cargando · disponible muy pronto</span></span></div>`
    : `<button type="button" class="mazo tema-${m.id}${mazoIncluido(m.id) ? '' : ' bloq'}" data-mazo="${m.id}"${mazoIncluido(m.id) ? '' : ' data-bloq="1"'}>
      ${mazoIncluido(m.id) ? '' : `<span class="sello-p">${bloqueo((P) => (P.mazos || {})[m.id] !== false)}</span>`}
      <span class="abanico cinco" aria-hidden="true">${m.muestra.map((i) => carta(cara(i, m.id, false), m.id)).join('')}</span>
      <span class="ficha"><span class="precio">${m.anio} · ${m.lugar}</span><h3>${m.nombre}</h3>
        <p>${m.desc}</p><span class="etiqueta">78 cartas · ${m.tecnica}</span>
        <span class="elegir">${mazoIncluido(m.id) ? 'Leer con este mazo →' : invitacion((P) => (P.mazos || {})[m.id] !== false) + ' →'}</span></span>
    </button>`).join(''); };
  pintarListaMazos();
  $('#listaMazos').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mazo]'); if (!b) return;
    if (b.dataset.bloq) { sfx.negado(); irDesbloqueo((P) => (P.mazos || {})[b.dataset.mazo] !== false, 'Este mazo'); return; }
    if (cupoAgotado()) { sfx.negado(); aviso(textoCupo()); return; }
    estado.mazo = b.dataset.mazo; sfx.mazo(); ir('intencion');
  });

  /* ---------- temas ---------- */
  function pintarTemas() {
    if (!temasPermitidos().some((t) => t.id === estado.tema)) estado.tema = 'general';
    $('#listaTemas').innerHTML = TEMAS.map((t) => {
      const bl = t.id === 'libre' && permisos().temaLibre === false;
      return `<button type="button" class="tema-p${bl ? ' bloq' : ''}" role="radio" aria-checked="${t.id === estado.tema}" data-tema="${t.id}"${bl ? ' data-bloq="1"' : ''} tabindex="${t.id === estado.tema ? 0 : -1}"><img src="${src(estado.mazo, TEMA_IMG[t.id])}" alt="" decoding="async"><span>${t.nombre}${bl ? `<small>${invitacion((P) => P.temaLibre !== false)}</small>` : ''}</span></button>`;
    }).join('');
  }
  pintarTemas();
  $('#listaTemas').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tema]'); if (!b) return;
    if (b.dataset.bloq) { sfx.negado(); irDesbloqueo((P) => P.temaLibre !== false, 'La pregunta libre'); return; }
    estado.tema = b.dataset.tema; sfx.tick(); pintarTemas(); $(`[data-tema="${estado.tema}"]`).focus();
  });
  $('#listaTemas').addEventListener('keydown', (e) => {
    const TP = temasPermitidos(), i = TP.findIndex((t) => t.id === estado.tema);
    let j = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % TP.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + TP.length) % TP.length;
    else return;
    e.preventDefault(); estado.tema = TP[j].id; pintarTemas(); $(`[data-tema="${estado.tema}"]`).focus();
  });

  /* ---------- tiradas ---------- */
  const TIRADA_INFO = {
    una: { min: 'Un minuto', para: 'Para una pausa breve o para empezar el día con una imagen.' },
    tiempo: { min: 'Tres minutos', para: 'Para entender cómo llegaste hasta aquí y hacia dónde puedes ir.' },
    perspectivas: { min: 'Tres minutos', para: 'Para un asunto concreto que no logras ver con claridad.' }
  };
  function pintarTiradas() {
    const back = reverso(estado.mazo);
    $('#listaTiradas').innerHTML = TIRADAS.map((t) =>
      `<button type="button" class="tirada t-${t.id} revela visto${tiradaIncluida(t.id) ? '' : ' bloq'}" data-tirada="${t.id}"${tiradaIncluida(t.id) ? '' : ' data-bloq="1"'}>
        ${tiradaIncluida(t.id) ? '' : `<span class="sello-p">${bloqueo((P) => (P.tiradas || {})[t.id] !== false)}</span>`}
        <span class="tendido" aria-hidden="true">${t.pos.map((p) => `<span class="puesto">${carta(back, estado.mazo)}<em>${p.nombre}</em></span>`).join('')}</span>
        <span class="precio">${TIRADA_INFO[t.id].min}</span>
        <h3>${t.nombre}</h3><p>${t.desc}</p><p class="para">${TIRADA_INFO[t.id].para}</p>
        <span class="sr">Posiciones: ${t.pos.map((p) => p.nombre).join(', ')}</span>
        <span class="elegir">${tiradaIncluida(t.id) ? 'Elegir esta tirada' : invitacion((P) => (P.tiradas || {})[t.id] !== false).replace('Descúbrelo', 'Descúbrela') + ' →'}</span>
      </button>`).join('');
  }
  pintarTiradas();
  $('#listaTiradas').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tirada]'); if (!b) return;
    if (b.dataset.bloq) { sfx.negado(); irDesbloqueo((P) => (P.tiradas || {})[b.dataset.tirada] !== false, 'Esta tirada'); return; }
    if (cupoAgotado()) { sfx.negado(); aviso(textoCupo()); return; }
    sfx.tirada(); estado.tirada = TIRADAS.find((t) => t.id === b.dataset.tirada); ir('barajar');
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
    barajar(); veces++; sfx.barajar();
    const p = $('#pila'); p.classList.remove('mezcla'); void p.offsetWidth; p.classList.add('mezcla');
    $('#estadoBarajar').textContent = veces === 1 ? 'Barajaste una vez.' : `Barajaste ${veces} veces.`;
  }
  $('#pila').addEventListener('click', accionBarajar);
  $('#btnBarajar').addEventListener('click', accionBarajar);
  $('#btnRepartir').addEventListener('click', () => { pintarMesa(); ir('elegir'); sfx.repartir(); });

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
    let sono = 'elegir';
    if (i >= 0) { estado.elegidas.splice(i, 1); sono = 'soltar'; }
    else if (estado.elegidas.length < n) estado.elegidas.push(k);
    else if (n === 1) estado.elegidas = [k];
    else { aviso('Ya elegiste tus cartas. Toca una elegida para cambiarla.'); return; }
    if (sono === 'elegir') sfx.elegir(estado.elegidas.indexOf(k)); else sfx.soltar();
    actualizarElegir();
  });
  $('#btnConfirmar').addEventListener('click', () => {
    sfx.confirmar(); pintarLectura(); ir('lectura');
    /* las cartas quedan centradas en la pantalla, con sus posiciones y nombres a la vista */
    setTimeout(() => { const r = $('#ranuras'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
  });

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
    sfx.revelar(i, estado.reveladas.size === ids.length);
    if (estado.reveladas.size === ids.length) {
      $('#accionesRevelar').hidden = true;
      $('#tituloLectura').textContent = 'Tu lectura';
      $('#estadoLectura').textContent = (ids.length === 1 ? `Salió ${k.nombre}.` : `Salieron ${lista(ids.map((x) => CARTAS[x].nombre))}.`) + ' Toca una carta para verla en grande.';
      const lento = !matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(pintarInterpretacion, lento ? 600 : 0);
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

  function sintesis(ks, tid) {
    const t = tid || (estado.tirada && estado.tirada.id);
    let s;
    if (t === 'una') s = `${ks[0].nombre} te deja una imagen para hoy: ${ks[0].hilo}.`;
    else if (t === 'tiempo') s = `Leídas en orden, tus cartas trazan un recorrido: vienes ${de(ks[0].hilo)}, hoy te encuentras con ${ks[1].hilo} y se abre, como posibilidad, ${ks[2].hilo}.`;
    else s = `Juntas, tus cartas muestran tres ángulos de lo mismo: la situación lleva la marca ${de(ks[0].hilo)}, el desafío te pone ante ${ks[1].hilo} y la posibilidad apunta hacia ${ks[2].hilo}.`;
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

  /* Cuerpo de una lectura (cartas, reflexión, síntesis y preguntas). Sirve para la lectura recién hecha y para abrir una guardada.
     p = { ids, pos, mz, tema, pregunta } */
  function cuerpoLectura(p) {
    const ids = p.ids, ks = ids.map((i) => CARTAS[i]), pos = p.pos, mz = p.mz;
    const tema = TEMAS.find((t) => t.id === p.tema), centro = ks[Math.floor(ks.length / 2)];
    const lp = p.pregunta ? leerPregunta(p.pregunta) : null;
    let h = `<div class="adorno" aria-hidden="true"></div><div><p class="intro">${tema.intro}</p></div>`;
    if (lp && lp.apoyo) h += `<div class="apoyo"><h3>No tienes que pasar por esto a solas</h3><p>Si estás viviendo un momento muy difícil, hablar con alguien ayuda. En Chile puedes llamar gratis al <b>*4141</b>, la línea de prevención del suicidio, o a Salud Responde al <b>600 360 7777</b>, a cualquier hora.</p></div>`;
    if (lp) h += `<div class="tu-pregunta"><p class="pos">Tu pregunta</p><p class="q">«${esc(p.pregunta)}»</p>${lp.notas.map((n) => `<p>${n}</p>`).join('')}${lp.profesional ? '<p>Para temas de salud, legales o de dinero, toma esta lectura solo como una pausa para pensar: la decisión merece el consejo de un profesional.</p>' : ''}</div>`;
    h += ks.map((k, i) => {
      const nota = notaMazo(ids[i], mz);
      return `<article class="bloque"><button type="button" class="ver" data-ver="${ids[i]}" aria-label="Ampliar ${esc(k.nombre)}">${carta(cara(ids[i], mz), mz)}</button>
        <div><p class="pos">${pos[i].nombre}</p><h3>${k.nombre}</h3><p class="claves">${k.claves}</p>
        <p class="significa">${k.esencia}</p>
        <p class="rot">Para ti</p><p class="texto">${reflexion(pos[i].id, k, p.tema)}</p>${nota ? `<p class="nota-mazo">${nota}</p>` : ''}</div></article>`;
    }).join('');
    h += `<section class="sintesis"><h3>${ks.length === 1 ? 'En síntesis' : 'Leídas en conjunto'}</h3><p>${sintesis(ks, p.tirada)}</p>${p.pregunta ? `<p>Vuelve ahora a tu pregunta. Leída desde ${centro.hilo}, ¿qué respuesta se asoma que no tenías antes de barajar?</p>` : ''}<p>${tema.cierre}</p></section>`;
    h += `<section><h3>Preguntas para ti</h3><ul>${ks.map((k) => `<li>${k.pregunta}</li>`).join('')}${PREG_TEMA[p.tema] ? `<li>${PREG_TEMA[p.tema](centro.hilo)}</li>` : ''}</ul></section>`;
    h += `<section><h3>Para seguir explorando</h3><ul>${tema.acciones.map((a) => `<li>${a}</li>`).join('')}</ul></section>`;
    h += `<p class="descargo">Esta es una interpretación simbólica, pensada para reflexionar. No predice lo que va a pasar ni reemplaza el consejo de un profesional.</p>`;
    return h;
  }

  /* ---------- pago con Mercado Pago ---------- */
  /* Mientras los cobros no están abiertos: se anota el interés (queda en el embudo del admin) y se invita a crear cuenta para avisarle. */
  async function anotarInteres(tier) {
    window.Nube.vista('quiero-' + tier);
    if (esInvitado()) {
      const ok = await confirmarModal({ titulo: '¡Anotado, gracias!', texto: `Todavía no abrimos los cobros del plan ${NOMBRE_PERFIL[tier]}. Crea tu cuenta gratis y te avisaremos al correo apenas abran.`, boton: 'Crear mi cuenta gratis', tono: 'normal' });
      if (ok) irEntrar();
    } else aviso(`¡Anotado! Te avisaremos al correo de tu cuenta apenas abramos el plan ${NOMBRE_PERFIL[tier]}.`);
  }
  async function iniciarPago(tier, boton) {
    if (!window.Nube.cobrosAbiertos()) { await anotarInteres(tier); return; }
    if (!window.Nube.pagosActivos()) { aviso('Los cobros se activan muy pronto. Tu cuenta ya queda lista para suscribirte.'); return; }
    if (window.Nube.cobrosEnPausa()) { aviso('Los cobros están en pausa por mantenimiento. Tu plan actual no se ve afectado; intenta de nuevo más tarde.'); return; }
    const T = window.Nube.todosPerfiles(), P = T[tier] || {};
    const ok = await confirmarModal({ titulo: `Suscribirte a ${NOMBRE_PERFIL[tier]}`, texto: `Vas a pasar a Mercado Pago para pagar ${P.precio || ''} ${P.periodo || 'al mes'}. Se renueva cada mes y puedes cancelar cuando quieras desde Mi perfil.`, boton: 'Ir a pagar', tono: 'normal' , terminos: true });
    if (!ok) return;
    const txt = boton && boton.textContent; if (boton) { boton.disabled = true; boton.textContent = 'Abriendo Mercado Pago…'; }
    try { const url = await window.Nube.suscribir(tier); try { localStorage.setItem('arcana.pago.v1', String(Date.now())); } catch (e) { /* sin almacenamiento */ } location.href = url; }
    catch (e) {
      if (boton) { boton.disabled = false; boton.textContent = txt; }
      aviso(e && e.message === 'sin-sesion' ? 'Entra a tu cuenta para suscribirte.' : (e && e.message && !/^error|^pagos/.test(e.message) ? e.message : 'No se pudo abrir el pago. Intenta de nuevo en un momento.'));
    }
  }
  /* al volver de Mercado Pago: el servidor cambia el plan unos segundos después del pago */
  (function () {
    const q = new URLSearchParams(location.search);
    /* Se confirma si volvió con ?pago=ok o si hace menos de 3 horas salió a pagar (por si Mercado Pago no devuelve el parámetro). Se usa una sola vez. */
    let salio = 0; try { salio = Number(localStorage.getItem('arcana.pago.v1')) || 0; localStorage.removeItem('arcana.pago.v1'); } catch (e) { /* sin almacenamiento */ }
    if (q.get('pago') !== 'ok' && !(salio && Date.now() - salio < 3 * 36e5)) return;
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { /* sigue igual */ }
    aviso('Gracias. Estamos confirmando tu pago…');
    let n = 0;
    const t = setInterval(async () => {
      n++;
      try {
        await window.Nube.sincronizarPago();
        const p = await window.Nube.refrescarPerfil();
        if (p === 'full' || p === 'premium') { clearInterval(t); sfx.entrega(true); aviso(`¡Listo! Ahora tienes el plan ${NOMBRE_PERFIL[p]}.`); return; }
      } catch (e) { /* se reintenta */ }
      if (n >= 18) { clearInterval(t); aviso('Tu pago puede tardar unos minutos en confirmarse. Revisa tu perfil en un rato.'); }
    }, 4000);
  })();

  /* Respaldo silencioso: si alguien pagó y no volvió a la página (cerró la pestaña, pagó desde otro aparato), al abrir su sesión se confirma solo.
     A lo más una vez cada 10 minutos por navegador, y el servidor solo consulta a Mercado Pago si hay un pago pendiente reciente. */
  window.Nube.alCambiarUsuario((u) => {
    if (!u || !window.Nube.pagosActivos()) return;
    let ultimo = 0; try { ultimo = Number(localStorage.getItem('arcana.sync.v1')) || 0; } catch (e) { /* sin almacenamiento */ }
    if (Date.now() - ultimo < 10 * 60e3) return;
    try { localStorage.setItem('arcana.sync.v1', String(Date.now())); } catch (e) { /* idem */ }
    const antes = window.Nube.perfil();
    window.Nube.sincronizarPago().then(() => window.Nube.refrescarPerfil()).then((p) => {
      if (p !== antes && (p === 'full' || p === 'premium')) aviso(`¡Listo! Tu plan ${NOMBRE_PERFIL[p]} ya está activo.`);
    }).catch(() => { /* se reintenta en la próxima visita */ });
  });

  /* Sin plan que guarde lecturas: se invita a entrar o a suscribirse, en vez de dejar un hueco. */
  function persuadirGuardar() {
    const entrar = desbloqueo((P) => P.diario !== false) === 'entrar';
    return `<div class="persuade"><b>${entrar ? 'Guarda esta lectura' : 'Guarda tus lecturas y tus notas'}</b>
      <p>${entrar ? 'Entra gratis para guardar tus lecturas con tus notas, llevar tu calendario de cartas y tener tu avatar.' : 'Con una suscripción puedes guardar tus lecturas, escribir notas y volver a ellas cuando quieras.'}</p>
      <div class="acciones">${entrar ? '<button type="button" class="btn primario" data-entrar="1">Entrar gratis</button><button type="button" class="btn" data-planes="1">Ver planes</button>' : '<button type="button" class="btn primario" data-planes="1">Ver planes</button>'}</div></div>`;
  }
  function pintarInterpretacion() {
    const ids = cartasDeLectura();
    let h = cuerpoLectura({ ids, pos: estado.tirada.pos, tirada: estado.tirada.id, mz: estado.mazo, tema: estado.tema, pregunta: estado.pregunta });
    const mz = estado.mazo;
    h += `<section class="cierre"><h3>Tu reflexión</h3>
      ${permisos().diario === false ? persuadirGuardar() : `<label class="campo" for="notaLectura" style="margin-top:8px">Una nota privada <span>(opcional)</span></label>
      <textarea id="notaLectura" rows="3" maxlength="1000" placeholder="¿Qué te llevas de esta lectura?"></textarea>`}
      <div class="acciones">
        ${permisos().diario === false ? '' : '<button type="button" class="btn primario" id="btnGuardar">Guardar en mi espacio</button>'}
        <button type="button" class="btn" id="btnOtra">Hacer otra lectura</button>
      </div></section>`;
    const el = $('#interpretacion'); el.innerHTML = h; el.hidden = false;
    sfx.entrega(); contarLectura(); pintarCupo();
    window.Nube.lectura({ mazo: mz, tema: estado.tema, tirada: estado.tirada.id, cartas: ids, pregunta: !!estado.pregunta });
  }

  /* ---------- calendario de la carta del día (solo en este dispositivo) ---------- */
  const HIST_K = 'arcana.hoy.hist.v1';
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const diaHoy = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());
  function leerHist() { try { const h = JSON.parse(localStorage.getItem(HIST_K)); return h && typeof h === 'object' ? h : {}; } catch (e) { return {}; } }
  function anotarDia(dia, carta) {
    const h = leerHist(); h[dia] = carta;
    try { localStorage.setItem(HIST_K, JSON.stringify(h)); } catch (e) { /* sin almacenamiento: el calendario no guarda */ }
  }
  const sumarDias = (f, n) => { const [y, m, d] = f.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
  const cal = { y: null, m: 0, sel: null };
  const fmtDiaLargo = new Intl.DateTimeFormat('es-CL', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  /* ---------- recuperar días perdidos de la semana ----------
     Solo hacia atrás (nunca días que aún no llegan). La carta de cada día es fija: sale de la cuenta y la fecha. */
  const RECUP_K = 'arcana.recup.v1';
  function lunesDe(f) { const [y, m, d] = f.split('-').map(Number); return sumarDias(f, -((new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7)); }
  function leerRecup() {
    const lun = lunesDe(diaHoy());
    try { const r = JSON.parse(localStorage.getItem(RECUP_K)); if (r && r.sem === lun && r.dias) return r; } catch (e) { /* sin datos */ }
    return { sem: lun, dias: {} };
  }
  const limiteRecup = () => { const v = permisos().recuperarDias; return v === null ? Infinity : (typeof v === 'number' ? v : 0); };
  const restantesRecup = () => Math.max(0, limiteRecup() - Object.keys(leerRecup().dias).length);
  function diasPerdidos() {
    const hoy = diaHoy(), hist = leerHist(), o = [];
    for (let f = lunesDe(hoy); f < hoy; f = sumarDias(f, 1)) if (!CARTAS[hist[f]]) o.push(f);
    return o;
  }
  async function cartaDeDia(uid, f) {
    const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('arcana|' + uid + '|' + f)));
    return (((h[0] << 24) | (h[1] << 16) | (h[2] << 8) | h[3]) >>> 0) % TOTAL;
  }
  const textoDia = (f) => { const [y, m, d] = f.split('-').map(Number); return fmtDiaLargo.format(new Date(Date.UTC(y, m - 1, d))); };
  async function recuperar(fechas) {
    const u = window.Nube.usuario(); if (!u) { irEntrar('Entra a tu cuenta para recuperar tus días.'); return; }
    const r = leerRecup();
    for (const f of fechas) { const id = await cartaDeDia(u.uid, f); anotarDia(f, id); r.dias[f] = id; }
    try { localStorage.setItem(RECUP_K, JSON.stringify(r)); } catch (e) { /* sigue igual */ }
    cal.sel = fechas[fechas.length - 1]; sfx.revelar(1); sfx.entrega(true); pintarCalendario();
    aviso(fechas.length === 1 ? 'Carta recuperada.' : `Listo: recuperaste ${fechas.length} días.`);
  }
  async function accionRecuperar(f) {
    const lim = limiteRecup();
    if (lim === 0) { sfx.negado(); irDesbloqueo((P) => P.recuperarDias !== 0, 'Recuperar días perdidos'); return; }
    if (restantesRecup() === 0) { sfx.negado(); irAPlanes('Ya recuperaste tu día de esta semana. Con Premium recuperas todos los que te falten.'); return; }
    const ok = await confirmarModal({ titulo: 'Recuperar una carta', texto: `Se da vuelta la carta que te tocaba el ${textoDia(f)}. ${lim === Infinity ? 'Con tu plan puedes recuperar todos los días que te falten esta semana.' : `Con tu plan recuperas ${lim} ${lim === 1 ? 'día' : 'días'} por semana: este será ${lim === 1 ? 'tu día' : 'uno de tus días'} de esta semana.`}`, boton: 'Dar vuelta', tono: 'normal' });
    if (ok) recuperar([f]);
  }
  async function accionRecuperarTodos() {
    const falt = diasPerdidos().slice(0, restantesRecup()); if (!falt.length) return;
    const ok = await confirmarModal({ titulo: `Recuperar ${falt.length} ${falt.length === 1 ? 'carta' : 'cartas'}`, texto: 'Se dan vuelta las cartas que te tocaban en los días de esta semana que no abriste. Solo días que ya pasaron.', boton: 'Dar vuelta todas', tono: 'normal' });
    if (ok) recuperar(falt);
  }
  function pintarCalendario() {
    const grid = $('#calGrid'); if (!grid) return;
    const calOk = permisos().calendario !== false, calSec = $('#calendario');
    if (calSec) calSec.classList.toggle('bloqueado', !calOk);
    const bloq = $('#calBloq');
    if (bloq) {
      bloq.hidden = calOk;
      if (!calOk) {
        const n = Object.keys(leerHist()).length, entrar = desbloqueo((P) => P.calendario !== false) === 'entrar';
        bloq.innerHTML = `<b>${entrar ? 'Tu calendario te espera' : 'Desbloquea tu calendario'}</b>
          <p>${n ? `Ya llevas <b>${n}</b> ${n === 1 ? 'carta anotada' : 'cartas anotadas'} en este navegador. ` : ''}${entrar ? 'Entra gratis para ver cada carta que diste vuelta, tu racha y volver a leer su mensaje.' : 'Con una suscripción ves cada carta que diste vuelta, tu racha y su mensaje.'}</p>
          <div class="acciones">${entrar ? '<button type="button" class="btn primario" data-entrar="1">Entrar gratis</button>' : ''}<button type="button" class="btn${entrar ? '' : ' primario'}" data-planes="1">Ver planes</button></div>`;
      }
    }
    if (!calOk) return;
    const hist = leerHist(), hoy = diaHoy(), [hy, hm] = hoy.split('-').map(Number);
    const dados = Object.keys(hist).filter((f) => CARTAS[hist[f]]).sort();
    if (cal.y === null) { cal.y = hy; cal.m = hm - 1; cal.sel = hist[hoy] !== undefined ? hoy : (dados[dados.length - 1] || null); }
    const primero = (new Date(Date.UTC(cal.y, cal.m, 1)).getUTCDay() + 6) % 7, dias = new Date(Date.UTC(cal.y, cal.m + 1, 0)).getUTCDate();
    const idxMes = cal.y * 12 + cal.m, idxHoy = hy * 12 + (hm - 1);
    $('#calMes').textContent = `${MESES[cal.m]} ${cal.y}`;
    $('#calSig').disabled = idxMes >= idxHoy; $('#calAnt').disabled = idxMes <= idxHoy - 24;
    let h = '<span class="cal-v"></span>'.repeat(primero);
    for (let d = 1; d <= dias; d++) {
      const f = `${cal.y}-${String(cal.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, id = hist[f], esHoy = f === hoy;
      if (id !== undefined && CARTAS[id]) h += `<button type="button" class="cal-d con${esHoy ? ' es-hoy' : ''}${cal.sel === f ? ' sel' : ''}" data-dia="${f}" aria-pressed="${cal.sel === f}" aria-label="${d} de ${MESES[cal.m]}: ${esc(CARTAS[id].nombre)}"><img src="${src('rws', id)}" alt="" loading="lazy" decoding="async"><span>${d}</span></button>`;
      else if (f >= lunesDe(hoy) && f < hoy) {
        const lim = limiteRecup(), est = lim === 0 ? 'bloq' : (restantesRecup() === 0 ? 'agotado' : 'ok');
        h += `<button type="button" class="cal-d rec ${est}" data-rec="${f}" title="${est === 'ok' ? 'Recuperar esta carta' : est === 'bloq' ? 'Con suscripción' : 'Ya recuperaste tu día de esta semana'}" aria-label="${d} de ${MESES[cal.m]}: carta sin abrir. ${est === 'ok' ? 'Recuperarla' : est === 'bloq' ? 'Con suscripción' : 'Sin días de recuperación esta semana'}"><span>${d}</span><i aria-hidden="true">↺</i></button>`;
      }
      else h += `<span class="cal-d${esHoy ? ' es-hoy' : ''}${f > hoy ? ' fut' : ''}"><span>${d}</span></span>`;
    }
    grid.innerHTML = h;
    // estadísticas: cartas del mes, total y racha
    const delMes = dados.filter((f) => f.startsWith(`${cal.y}-${String(cal.m + 1).padStart(2, '0')}`)).length;
    let racha = 0, f = hist[hoy] !== undefined ? hoy : sumarDias(hoy, -1);
    while (CARTAS[hist[f]] && racha < 4000) { racha++; f = sumarDias(f, -1); }
    $('#calStats').innerHTML = dados.length
      ? `<b>${delMes}</b> ${delMes === 1 ? 'carta' : 'cartas'} en ${MESES[cal.m]} · <b>${dados.length}</b> en total · racha de <b>${racha}</b> ${racha === 1 ? 'día' : 'días'}`
      : 'Todavía no has dado vuelta ninguna carta del día.';
    // días perdidos de esta semana: recuperar o invitar a hacerlo
    const per = diasPerdidos().length, lim = limiteRecup(), rest = restantesRecup(), info = $('#calRec');
    if (info) {
      if (!per) info.innerHTML = '';
      else if (lim === 0) info.innerHTML = `Se te pasaron <b>${per}</b> ${per === 1 ? 'día' : 'días'} de esta semana. Con una suscripción puedes recuperarlos. <button type="button" class="enlace-p" data-planes="1">Ver planes →</button>`;
      else if (rest === 0) info.innerHTML = `Ya recuperaste tu día de esta semana. Con Premium recuperas todos los que te falten. <button type="button" class="enlace-p" data-planes="1">Descubre Premium →</button>`;
      else info.innerHTML = `Te ${per === 1 ? 'falta' : 'faltan'} <b>${per}</b> ${per === 1 ? 'día' : 'días'} de esta semana. ${lim === Infinity ? '' : `Puedes recuperar <b>${rest}</b> ${rest === 1 ? 'día' : 'días'}. `}Toca uno marcado con ↺${lim === Infinity && per > 1 ? ` o <button type="button" class="enlace-p" id="calRecTodos">dar vuelta los ${per}</button>` : ''}.`;
    }
    // detalle del día elegido
    const det = $('#calDet'), id = cal.sel ? hist[cal.sel] : undefined;
    if (id !== undefined && CARTAS[id]) {
      const k = CARTAS[id], [yy, mm, dd] = cal.sel.split('-').map(Number);
      det.innerHTML = `<div class="cal-carta"><button type="button" class="cal-mini" data-ver-cal="${id}" aria-label="Ver ${esc(k.nombre)} en grande">${carta(cara(id, 'rws', false), 'rws')}</button>
        <div><p class="pos">${fmtDiaLargo.format(new Date(Date.UTC(yy, mm - 1, dd)))}</p>${leerRecup().dias[cal.sel] !== undefined ? '<span class="sello-p">Recuperada</span>' : ''}<h4>${esc(k.nombre)}</h4><p class="claves">${esc(k.claves)}</p><p>${esc(k.luz)}</p><p class="cal-q"><b>Una pregunta para ti</b>${esc(k.pregunta)}</p></div></div>`;
    } else {
      det.innerHTML = dados.length ? '<p class="cal-vacio">Toca un día con carta para recordar qué te acompañó.</p>'
        : '<div class="cal-vacio"><p>Cada vez que des vuelta tu carta del día, quedará anotada aquí, con su fecha.</p><div class="acciones" style="justify-content:flex-start"><button type="button" class="btn primario chico" id="calIr">Dar vuelta mi carta de hoy</button></div></div>';
    }
  }
  const calEl = $('#calendario');
  if (calEl) calEl.addEventListener('click', (e) => {
    const d = e.target.closest('[data-dia]');
    if (d) { cal.sel = d.dataset.dia; pintarCalendario(); return; }
    if (e.target.closest('#calAnt')) { cal.m--; if (cal.m < 0) { cal.m = 11; cal.y--; } pintarCalendario(); return; }
    if (e.target.closest('#calSig')) { cal.m++; if (cal.m > 11) { cal.m = 0; cal.y++; } pintarCalendario(); return; }
    const rc = e.target.closest('[data-rec]'); if (rc) { accionRecuperar(rc.dataset.rec); return; }
    if (e.target.closest('#calRecTodos')) { accionRecuperarTodos(); return; }
    const v = e.target.closest('[data-ver-cal]'); if (v) { ampliar(Number(v.dataset.verCal), 'rws'); return; }
    if (e.target.closest('#calIr')) { ir('inicio'); setTimeout(() => { const h = $('#hoy'); if (h) h.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80); }
  });

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
      const maxG = permisos().guardadas;
      if (typeof maxG === 'number' && a.length >= maxG) { aviso(`Tu perfil ${NOMBRE_PERFIL[window.Nube.perfil()]} guarda hasta ${maxG} lecturas. Borra alguna en Mi espacio para guardar otra.`); return; }
      estado.guardada = 'l' + Date.now();
      a.unshift({ id: estado.guardada, fecha: new Date().toISOString(), mazo: estado.mazo, tema: estado.tema, tirada: estado.tirada.id,
        cartas: cartasDeLectura(), pregunta: estado.pregunta, nota });
    }
    if (escribir(a)) { sfx.guardar(); aviso('Lectura guardada en tu espacio.'); e.target.textContent = 'Actualizar nota'; }
    else { estado.guardada = false; aviso('No se pudo guardar en este navegador.'); }
  });

  const fmtFecha = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  function pintarHistorial() {
    const a = leer(), el = $('#historial');
    if (!a.length) {
      if (permisos().diario === false) { el.innerHTML = `<div class="vacio">${persuadirGuardar()}</div>`; return; }
      el.innerHTML = `<div class="vacio"><p>Todavía no guardas ninguna lectura.</p><div class="acciones" style="justify-content:center"><button type="button" class="btn primario" data-ir="mazo">Comenzar mi lectura</button></div></div>`;
      return;
    }
    const slides = a.map((r) => {
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
        <div class="acciones" style="margin-top:14px"><button type="button" class="btn chico primario" data-detalle="${esc(r.id)}">Ver detalle</button><button type="button" class="btn chico" data-borrar="${esc(r.id)}">Borrar esta lectura</button></div>
      </article>`;
    }).join('');
    const nav = a.length > 1
      ? `<div class="car-nav"><button type="button" class="btn chico" id="carAnt" aria-label="Lectura anterior">‹</button>
          <div class="puntos" role="group" aria-label="Tus lecturas guardadas">${a.map((_, k) => `<button type="button" class="punto" data-punto="${k}" aria-label="Lectura ${k + 1} de ${a.length}"></button>`).join('')}</div>
          <button type="button" class="btn chico" id="carSig" aria-label="Lectura siguiente">›</button></div>`
      : '';
    el.innerHTML = `<p class="car-txt" id="carTxt" aria-live="polite"></p><div class="carrusel" id="carrusel" tabindex="0" role="region" aria-label="Lecturas guardadas, desliza hacia los lados">${slides}</div>${nav}`;
    const c = $('#carrusel'); carIdx = Math.min(carIdx, a.length - 1);
    c.scrollLeft = carIdx * pasoCarrusel(c);
    marcarPuntos(c);
    let raf = 0; c.addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; marcarPuntos(c); }); }, { passive: true });
  }
  /* ---------- detalle de una lectura guardada ---------- */
  let detId = null, detMazo = 'rws';
  function abrirDetalle(id) {
    const r = leer().find((x) => x.id === id); if (!r) { aviso('No encontré esa lectura.'); return; }
    const t = TIRADAS.find((x) => x.id === r.tirada) || TIRADAS[0], tema = TEMAS.find((x) => x.id === r.tema) || TEMAS[0], mz = mazoDe(r.mazo);
    const ids = (r.cartas || []).filter((i) => CARTAS[i]); if (!ids.length) { aviso('Esa lectura no tiene cartas.'); return; }
    detId = id; detMazo = mz.id;
    $('#detTitulo').textContent = `${t.nombre} · ${tema.nombre}`;
    $('#detMeta').textContent = `${fmtFecha.format(new Date(r.fecha))} · Mazo ${mz.nombre}, ${mz.anio}`;
    $('#detRanuras').className = 'ranuras' + (ids.length === 1 ? ' una' : '');
    $('#detRanuras').innerHTML = ids.map((i, n) => `<div class="ranura brilla"><p class="pos">${t.pos[n] ? t.pos[n].nombre : ''}</p>
      <button type="button" class="giro vista-carta" data-ver="${i}" aria-label="Ampliar ${esc(CARTAS[i].nombre)}"><span class="dentro"><span class="lado carta c-${mz.id}">${reverso(mz.id)}</span><span class="lado frente carta c-${mz.id}">${cara(i, mz.id, false)}</span></span></button>
      <p class="nombre">${esc(CARTAS[i].nombre)}</p></div>`).join('');
    const diario = permisos().diario !== false;
    $('#detInterp').innerHTML = cuerpoLectura({ ids, pos: t.pos, tirada: t.id, mz: mz.id, tema: r.tema, pregunta: r.pregunta || '' })
      + `<section class="cierre"><h3>Tu nota</h3>
        ${diario ? `<label class="campo" for="detNota" style="margin-top:8px">Una nota privada <span>(opcional)</span></label><textarea id="detNota" rows="3" maxlength="1000" placeholder="¿Qué te llevas de esta lectura?">${esc(r.nota || '')}</textarea>` : (r.nota ? `<p class="nota-propia">${esc(r.nota)}</p>` : '')}
        <div class="acciones">${diario ? '<button type="button" class="btn primario" id="btnDetNota">Guardar nota</button>' : ''}
          <button type="button" class="btn" data-ir="espacio">Volver a mis lecturas</button>
          <button type="button" class="btn chico" id="btnDetBorrar">Borrar esta lectura</button></div></section>`;
    ir('detalle');
  }
  const vDetalle = $('#v-detalle');
  if (vDetalle) vDetalle.addEventListener('click', (e) => {
    const v = e.target.closest('[data-ver]'); if (v) { ampliar(Number(v.dataset.ver), detMazo); return; }
    if (e.target.id === 'btnDetNota') {
      const a = leer(), r = a.find((x) => x.id === detId); if (!r) return;
      r.nota = ($('#detNota').value || '').trim();
      if (escribir(a)) { sfx.guardar(); aviso('Nota guardada.'); } else aviso('No se pudo guardar en este navegador.');
      return;
    }
    if (e.target.id === 'btnDetBorrar') {
      confirmarModal({ titulo: '¿Borrar esta lectura?', texto: 'Se elimina de este dispositivo, con su nota. No se puede deshacer.', boton: 'Borrar lectura' }).then((ok) => {
        if (!ok) return;
        escribir(leer().filter((x) => x.id !== detId)); detId = null; ir('espacio'); aviso('Lectura borrada.');
      });
    }
  });

  /* ---------- llevar mis datos (exportar / importar) ---------- */
  const CLAVES_DATOS = [CLAVE, 'arcana.hoy.hist.v1', 'arcana.hoy.v1', 'arcana.sonido.estilo'];
  const esClaveDato = (k) => CLAVES_DATOS.includes(k) || k.startsWith('arcana.avatar.');
  function exportarDatos() {
    const datos = {};
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (esClaveDato(k)) datos[k] = localStorage.getItem(k); } } catch (e) { /* sin almacenamiento */ }
    const blob = new Blob([JSON.stringify({ app: 'arcana', version: 1, exportado: new Date().toISOString(), datos }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'arcana-mis-datos.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    aviso('Archivo descargado. Cárgalo en el otro dispositivo o dirección con «Cargar mis datos».');
  }
  function importarDatos(texto) {
    let o; try { o = JSON.parse(texto); } catch (e) { return aviso('Ese archivo no se pudo leer.'); }
    if (!o || o.app !== 'arcana' || !o.datos || typeof o.datos !== 'object') return aviso('Ese archivo no es de ARCANA.');
    const d = o.datos, lee = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    const pon = (k, v) => { try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) { /* sigue igual */ } };
    let nuevas = 0;
    // lecturas guardadas: se suman por identificador, sin pisar las que ya hay
    try {
      const entrantes = JSON.parse(d[CLAVE] || '[]'), actuales = leer(), ids = new Set(actuales.map((x) => x.id));
      entrantes.forEach((x) => { if (x && x.id && !ids.has(x.id)) { actuales.push(x); nuevas++; } });
      actuales.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))); escribir(actuales);
    } catch (e) { /* esa parte se omite */ }
    // calendario: se suman los días que faltan
    try { const h = Object.assign({}, JSON.parse(d['arcana.hoy.hist.v1'] || '{}'), lee('arcana.hoy.hist.v1') || {}); pon('arcana.hoy.hist.v1', h); } catch (e) { /* se omite */ }
    // carta de hoy: solo si es de hoy y aquí aún no hay una distinta; preferencias y avatar: solo si no hay
    try { const g = JSON.parse(d['arcana.hoy.v1'] || 'null'); if (g && g.dia === diaHoy() && !lee('arcana.hoy.v1')) pon('arcana.hoy.v1', g); } catch (e) { /* se omite */ }
    Object.keys(d).forEach((k) => { if ((k === 'arcana.sonido.estilo' || k.startsWith('arcana.avatar.')) && localStorage.getItem(k) === null) pon(k, d[k]); });
    pintarHistorial(); pintarCalendario();
    aviso(nuevas ? `Listo: se sumaron ${nuevas} ${nuevas === 1 ? 'lectura' : 'lecturas'} y tu calendario.` : 'Listo: tu calendario y tus preferencias se cargaron. No había lecturas nuevas.');
  }
  (function () {
    const exp = $('#btnExportar'), imp = $('#btnImportar'), arch = $('#archivoDatos'); if (!exp) return;
    exp.addEventListener('click', exportarDatos);
    imp.addEventListener('click', () => arch.click());
    arch.addEventListener('change', () => { const f = arch.files && arch.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => importarDatos(String(r.result || '')); r.readAsText(f); arch.value = ''; });
  })();

  /* carrusel de lecturas: la posición se calcula por el ancho de cada tarjeta */
  let carIdx = 0;
  const pasoCarrusel = (c) => { const t = c.querySelector('.registro'); return t ? t.getBoundingClientRect().width + 16 : 1; };
  function marcarPuntos(c) {
    const n = c.children.length, fin = c.scrollLeft + c.clientWidth >= c.scrollWidth - 3;
    const i = fin ? n - 1 : Math.min(n - 1, Math.max(0, Math.round(c.scrollLeft / pasoCarrusel(c))));
    carIdx = i;
    $$('#historial .punto').forEach((p, k) => { p.classList.toggle('act', k === i); p.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    const t = $('#carTxt'); if (t) t.textContent = n > 1 ? `Lectura ${i + 1} de ${n}` : '1 lectura guardada';
    const ant = $('#carAnt'), sig = $('#carSig'); if (ant) ant.disabled = i <= 0; if (sig) sig.disabled = i >= n - 1;
  }
  $('#historial').addEventListener('click', (e) => {
    const c = $('#carrusel');
    const det = e.target.closest('[data-detalle]'); if (det) { abrirDetalle(det.dataset.detalle); return; }
    const p = e.target.closest('[data-punto]');
    if (p && c) { c.scrollTo({ left: Number(p.dataset.punto) * pasoCarrusel(c), behavior: 'smooth' }); return; }
    if (e.target.closest('#carAnt') && c) { c.scrollBy({ left: -pasoCarrusel(c), behavior: 'smooth' }); return; }
    if (e.target.closest('#carSig') && c) { c.scrollBy({ left: pasoCarrusel(c), behavior: 'smooth' }); return; }
    const b = e.target.closest('[data-borrar]'); if (!b) return;
    confirmarModal({ titulo: '¿Borrar esta lectura?', texto: 'Se elimina de este dispositivo, con su nota. No se puede deshacer.', boton: 'Borrar lectura' }).then((ok) => {
      if (!ok) return;
      escribir(leer().filter((x) => x.id !== b.dataset.borrar)); pintarHistorial(); aviso('Lectura borrada.');
    });
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

  /* Las animaciones continuas se pausan cuando su bloque no está en pantalla. */
  if ('IntersectionObserver' in window) {
    const vigia = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('fuera', !e.isIntersecting)), { rootMargin: '80px' });
    $$('.cielo, .desfile, .hoy, .final, .orbita').forEach((el) => vigia.observe(el));
  }

  /* Si una imagen falla por un error pasajero del servidor, se vuelve a pedir sola. */
  document.addEventListener('error', (e) => {
    const im = e.target;
    if (!im || im.tagName !== 'IMG') return;
    const n = Number(im.dataset.reintento || 0);
    if (n >= 5) return;
    im.dataset.reintento = n + 1;
    setTimeout(() => { im.src = im.getAttribute('src').split('?')[0] + '?r=' + (n + 1); }, 500 * (n + 1));
  }, true);

  /* Al actualizar, la página parte de cero: arriba y sin nada tocado. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });
  /* ---------- interruptores y cuenta (solo con la nube conectada) ---------- */
  const ERR_CUENTA = { 'auth/invalid-credential': 'El correo o la contraseña no coinciden.', 'auth/wrong-password': 'El correo o la contraseña no coinciden.', 'auth/user-not-found': 'El correo o la contraseña no coinciden.',
    'auth/email-already-in-use': 'Ese correo ya tiene una cuenta. Prueba entrar, o usa «Olvidé mi contraseña».', 'auth/weak-password': 'La contraseña debe tener al menos 8 caracteres.',
    'auth/invalid-email': 'Revisa que el correo esté bien escrito.', 'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e intenta de nuevo.',
    'auth/operation-not-allowed': 'Entrar con correo todavía no está activado.', 'auth/network-request-failed': 'Sin conexión. Revisa tu internet e intenta de nuevo.' };
  let modoCuenta = 'entrar';
  function resumenPerfil() {
    const P = permisos(), t = tiradasPermitidas().length, m = MAZOS.filter((x) => !x.pendiente && ((P.mazos || {})[x.id] !== false)).length;
    return `${t} ${t === 1 ? 'tirada' : 'tiradas'}, ${m} ${m === 1 ? 'mazo' : 'mazos'}, ${typeof P.lecturasDia === 'number' ? P.lecturasDia + (P.lecturasDia === 1 ? ' lectura al día' : ' lecturas al día') : 'lecturas sin límite'}${P.diario === false ? '' : typeof P.guardadas === 'number' ? ', hasta ' + P.guardadas + (P.guardadas === 1 ? ' guardada' : ' guardadas') : ', diario sin límite'}`;
  }

  /* ---------- avatares: cinco arcanos, dibujados en oro sobre la noche ---------- */
  const AVATARES = [['sol', 'El Sol', 'Alegría y claridad'], ['luna', 'La Luna', 'Intuición y sueños'], ['estrella', 'La Estrella', 'Esperanza y guía'], ['sacerdotisa', 'La Sacerdotisa', 'Misterio y sabiduría'], ['mago', 'El Mago', 'Voluntad y creación']];
  const star4 = (x, y, r) => `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z"/>`;
  const FIGURA = {
    sol: () => {
      let r = '';
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r2 = i % 2 ? 29 : 35; r += `<line x1="${(50 + Math.cos(a) * 21).toFixed(1)}" y1="${(50 + Math.sin(a) * 21).toFixed(1)}" x2="${(50 + Math.cos(a) * r2).toFixed(1)}" y2="${(50 + Math.sin(a) * r2).toFixed(1)}"/>`; }
      return `<g stroke="G" stroke-width="2.2" stroke-linecap="round">${r}</g><circle cx="50" cy="50" r="14" fill="G"/><circle cx="50" cy="50" r="18" fill="none" stroke="G" stroke-width=".8"/>`;
    },
    luna: () => `<path d="M60 22A29 29 0 1 0 60 78A34 34 0 0 1 60 22Z" fill="G"/><g fill="G">${star4(73, 32, 5)}${star4(79, 53, 3.2)}${star4(70, 71, 4)}</g>`,
    estrella: () => {
      let p = '';
      for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + i * Math.PI / 8, r = i % 2 ? 12 : 30; p += `${(50 + Math.cos(a) * r).toFixed(1)},${(44 + Math.sin(a) * r).toFixed(1)} `; }
      return `<polygon points="${p.trim()}" fill="G"/><circle cx="50" cy="44" r="4" fill="#0a0f2e"/><g fill="G">${star4(22, 24, 4)}${star4(80, 30, 3)}${star4(76, 62, 3.4)}</g>`
        + `<path d="M24 79q6-5 12 0t12 0t12 0t12 0" fill="none" stroke="G" stroke-width="1.6" stroke-linecap="round"/><path d="M30 86q5-4 10 0t10 0t10 0t10 0" fill="none" stroke="G" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>`;
    },
    sacerdotisa: () => `<g fill="none" stroke="G" stroke-width="1.6"><rect x="19" y="30" width="8" height="46" fill="#0a0f2e"/><rect x="73" y="30" width="8" height="46" fill="G" fill-opacity=".85"/><path d="M17 30h12M71 30h12M16 76h14M70 76h14"/><path d="M27 31Q50 8 73 31"/></g>`
      + `<g fill="G"><path d="M41 33A9 9 0 1 0 41 49A10 10 0 0 1 41 33Z"/><circle cx="50" cy="41" r="6"/><path d="M59 33A9 9 0 1 1 59 49A10 10 0 0 0 59 33Z"/></g>`
      + `<rect x="40" y="56" width="20" height="13" rx="2" fill="none" stroke="G" stroke-width="1.4"/><path d="M44 61h12M44 65h8" stroke="G" stroke-width="1"/>`,
    mago: () => `<path d="M31 30C31 20 45 20 50 30C55 40 69 40 69 30C69 20 55 20 50 30C45 40 31 40 31 30Z" fill="none" stroke="G" stroke-width="2.4"/>`
      + `<line x1="50" y1="48" x2="50" y2="67" stroke="G" stroke-width="2.8" stroke-linecap="round"/><circle cx="50" cy="45.5" r="2.6" fill="G"/>`
      + `<line x1="22" y1="73" x2="78" y2="73" stroke="G" stroke-width="2" stroke-linecap="round"/><line x1="29" y1="73" x2="29" y2="82" stroke="G" stroke-width="1.6"/><line x1="71" y1="73" x2="71" y2="82" stroke="G" stroke-width="1.6"/>`
      + `<path d="M27 62h10l-1.8 7h-6.4z" fill="G"/><circle cx="43" cy="66" r="3.6" fill="none" stroke="G" stroke-width="1.5"/>`
      + `<g stroke="G" stroke-width="1.6" stroke-linecap="round"><line x1="58" y1="60" x2="58" y2="70"/><line x1="55" y1="64" x2="61" y2="64"/><line x1="71" y1="59" x2="71" y2="70" stroke-width="2.4"/></g>`
      + `<g fill="G">${star4(22, 48, 3)}${star4(78, 50, 3)}</g>`
  };
  let avN = 0;
  function avatarSvg(id) {
    const g = `av${++avN}${id}`, G = `url(#${g}o)`, fig = (FIGURA[id] ? FIGURA[id]() : '').replace(/="G"/g, `="${G}"`);
    return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><radialGradient id="${g}f" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="#22327f"/><stop offset="1" stop-color="#060a22"/></radialGradient><linearGradient id="${g}o" x1="0" y1="10" x2="0" y2="90" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f6e4b4"/><stop offset="1" stop-color="#c8963f"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="url(#${g}f)" stroke="${G}" stroke-width="2"/><circle cx="50" cy="50" r="43.5" fill="none" stroke="#e2c17c" stroke-opacity=".4" stroke-width=".7" stroke-dasharray="1 2.4"/>${fig}</svg>`;
  }
  const avatarLocal = (uid) => { try { return localStorage.getItem('arcana.avatar.' + uid) || ''; } catch (e) { return ''; } };
  function avatarDe(u) { const f = window.Nube.ficha() || {}, id = f.avatar || avatarLocal(u.uid); return AVATARES.some((a) => a[0] === id) ? id : ''; }
  const nombreDe = (u) => { const f = window.Nube.ficha() || {}; return (f.nombre || u.nombre || u.email.split('@')[0] || '').trim(); };
  function avatarHtml(u) { const id = avatarDe(u); return id ? avatarSvg(id) : `<span class="inicial">${esc((nombreDe(u) || '?').charAt(0).toUpperCase())}</span>`; }
  function ponerAvatar(id) {
    const u = window.Nube.usuario(); if (!u) return;
    try { if (id) localStorage.setItem('arcana.avatar.' + u.uid, id); else localStorage.removeItem('arcana.avatar.' + u.uid); } catch (e) { /* sigue igual */ }
    pintarCuenta();
    window.Nube.guardarFicha({ avatar: id || null }).catch(() => { /* queda guardado en este dispositivo */ });
  }

  /* ---------- perfil ---------- */
  const fmtDesde = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', day: 'numeric', month: 'long', year: 'numeric' });
  function loginHtml() {
    const crear = modoCuenta === 'crear';
    return `<p class="bajada">Entra para tener tu perfil, un avatar místico y tu carta del día fija al actualizar. Es opcional: puedes leer sin cuenta.</p>
      <div class="cuenta"><div class="acciones"><button type="button" class="btn primario chico" id="btnEntrar">Entrar con Google</button></div>
      <p class="acepto">Al entrar o crear tu cuenta aceptas los <a href="terminos.html" target="_blank" rel="noopener">Términos y condiciones</a> y el tratamiento de tus datos según la <a href="terminos.html#datos" target="_blank" rel="noopener">política de privacidad</a>.</p>
      <p class="o">o con tu correo y contraseña</p>
      <form id="formCorreo" novalidate>
        ${crear ? '<label class="campo" for="cNombre">Tu nombre <span>(opcional)</span></label><input id="cNombre" type="text" maxlength="80" autocomplete="name">' : ''}
        <label class="campo" for="cCorreo">Correo</label><input id="cCorreo" type="email" autocomplete="email" inputmode="email" required>
        <label class="campo" for="cClave">Contraseña${crear ? ' <span>(mínimo 8 caracteres)</span>' : ''}</label><input id="cClave" type="password" autocomplete="${crear ? 'new-password' : 'current-password'}" minlength="8" required>
        <p class="error" id="cMsg" role="alert" aria-live="polite"></p>
        <div class="acciones"><button type="submit" class="btn primario chico">${crear ? 'Crear mi cuenta' : 'Entrar'}</button>
          <button type="button" class="btn chico" id="btnModo">${crear ? 'Ya tengo cuenta' : 'Crear una cuenta'}</button>
          ${crear ? '' : '<button type="button" class="btn chico" id="btnOlvide">Olvidé mi contraseña</button>'}</div>
      </form></div>`;
  }
  function perfilHtml(u) {
    const f = window.Nube.ficha() || {}, p = window.Nube.perfil(), av = avatarDe(u), lect = leer().length, cupo = textoCupo();
    return `<div class="perfil-cab"><span class="av-grande">${avatarHtml(u)}</span><div><h3>${esc(nombreDe(u))}</h3><p>${esc(u.email)}</p><span class="sello-p">${NOMBRE_PERFIL[p]}</span></div></div>
      <section class="tarjeta-p"><h3>Tu avatar <span>(opcional)</span></h3><p>Elige un arcano que te represente. Solo se ve en tu cuenta.</p>
        <div class="avatares" role="radiogroup" aria-label="Elige tu avatar">${AVATARES.map(([id, n, d]) => `<button type="button" class="av-op${av === id ? ' sel' : ''}" role="radio" aria-checked="${av === id}" data-avatar="${id}"><span class="av-img">${avatarSvg(id)}</span><b>${n}</b><small>${d}</small></button>`).join('')}</div>
        <div class="acciones"><button type="button" class="btn chico" data-avatar="" ${av ? '' : 'disabled'}>Sin avatar</button></div></section>
      <section class="tarjeta-p"><h3>Tus datos</h3>
        <label class="campo" for="pNombre">Nombre</label>
        <div class="fila-n"><input id="pNombre" type="text" maxlength="80" value="${esc(f.nombre || u.nombre || '')}" autocomplete="name"><button type="button" class="btn chico primario" id="btnGuardarNombre">Guardar</button></div>
        <dl class="datos-p"><div><dt>Correo</dt><dd>${esc(u.email)}</dd></div><div><dt>Ingresas con</dt><dd>${u.proveedor === 'correo' ? 'Correo y contraseña' : 'Google'}</dd></div><div><dt>Miembro desde</dt><dd>${f.creado ? fmtDesde.format(f.creado) : '—'}</dd></div><div><dt>Accesos</dt><dd>${f.accesos || 0}</dd></div></dl></section>
      <section class="tarjeta-p"><h3>Tu plan</h3><p><b>${NOMBRE_PERFIL[p]}</b> · ${resumenPerfil()}.</p><p>${cupo || 'Lecturas sin límite.'}</p>
        ${f.porPago ? '<p>Suscripción activa con Mercado Pago. Se renueva cada mes.</p>' : ''}
        <div class="acciones">${p !== 'premium' ? '<button type="button" class="btn primario chico" data-planes="1">Descubre Premium →</button>' : ''}${f.porPago ? '<button type="button" class="btn chico" id="btnCancelarSus">Cancelar suscripción</button>' : ''}</div></section>
      <section class="tarjeta-p"><h3>Tu espacio</h3><p>${lect ? `${lect} ${lect === 1 ? 'lectura guardada' : 'lecturas guardadas'} en este dispositivo.` : 'Todavía no guardas ninguna lectura en este dispositivo.'}</p>
        <div class="acciones"><button type="button" class="btn chico" data-ir="espacio">Ver mi calendario y mis lecturas</button></div></section>
      <div class="acciones fin-p"><button type="button" class="btn" id="btnSalir">Salir de mi cuenta</button><button type="button" class="btn chico" id="btnBorrarFicha">Borrar mi ficha</button></div>`;
  }
  const cuentaCaja = $('#cuentaCaja');
  function cerrarMenuPerfil() { const m = $('#menuPerfil'), c = $('#btnPerfil'); if (m) m.hidden = true; if (c) c.setAttribute('aria-expanded', 'false'); }
  function pintarCuenta() {
    const u = window.Nube.usuario(), on = window.Nube.activa && window.Nube.funciones().cuentas !== false;
    const chip = $('#btnPerfil'), menuP = $('#menuPerfil');
    if (chip) {
      chip.hidden = !on; chip.classList.toggle('con-avatar', !!u);
      chip.innerHTML = u ? `<span class="chip-av">${avatarHtml(u)}</span>` : 'Entrar';
      chip.setAttribute('aria-label', u ? 'Mi cuenta' : 'Entrar o crear cuenta');
      if (u) chip.removeAttribute('data-ir'); else { chip.setAttribute('data-ir', 'perfil'); cerrarMenuPerfil(); }
    }
    if (menuP && u) {
      const p = window.Nube.perfil(), av = avatarDe(u);
      menuP.innerHTML = `<div class="mp-cab"><span class="mp-av">${avatarHtml(u)}</span><div><b>${esc(nombreDe(u))}</b><small>${esc(u.email)}</small><span class="sello-p">${NOMBRE_PERFIL[p]}</span></div></div>
        <div class="mp-avs" role="radiogroup" aria-label="Tu avatar">${AVATARES.map(([id, n]) => `<button type="button" class="mp-op${av === id ? ' sel' : ''}" role="radio" aria-checked="${av === id}" aria-label="${n}" title="${n}" data-mini="${id}">${avatarSvg(id)}</button>`).join('')}</div>
        <button type="button" role="menuitem" data-ir="perfil">Abrir perfil</button>
        <button type="button" role="menuitem" data-ir="espacio">Mi espacio</button>
        ${p !== 'premium' ? '<button type="button" role="menuitem" data-planes="1">Descubre Premium</button>' : ''}
        <button type="button" role="menuitem" class="mp-salir" id="mpSalir">Salir de mi cuenta</button>`;
    }
    const caja = $('#cuentaEstado');
    if (caja) caja.innerHTML = u
      ? `<p>Hola, <b>${esc(nombreDe(u))}</b>. Tu perfil, tu avatar y tu plan están en un solo lugar.</p><div class="acciones"><button type="button" class="btn chico" data-ir="perfil">Ver mi perfil</button></div>`
      : `<p>Entra para tener tu perfil, un avatar y tu carta del día fija al actualizar. Es opcional.</p><div class="acciones"><button type="button" class="btn primario chico" data-ir="perfil">Entrar o crear cuenta</button></div>`;
    const cont = $('#perfilCont'); if (!cont) return;
    const foco = document.activeElement;
    if (foco && cont.contains(foco) && foco.tagName === 'INPUT') return; // no borrar lo que la persona está escribiendo
    cont.innerHTML = u ? perfilHtml(u) : loginHtml();
  }
  const msgCuenta = (t, ok) => { const m = $('#cMsg'); if (m) { m.textContent = t; m.classList.toggle('ok', !!ok); } };
  const chipPerfil = $('#btnPerfil'), menuPerfil = $('#menuPerfil');
  if (chipPerfil && menuPerfil) {
    chipPerfil.addEventListener('click', () => {
      if (!window.Nube.usuario()) return; // sin sesión, el botón lleva a «Entrar»
      const abrir = menuPerfil.hidden; menuPerfil.hidden = !abrir; chipPerfil.setAttribute('aria-expanded', String(abrir));
      if (abrir) { const b = menuPerfil.querySelector('[data-ir="perfil"]'); if (b) b.focus(); }
    });
    menuPerfil.addEventListener('click', async (e) => {
      const mini = e.target.closest('[data-mini]');
      if (mini) { ponerAvatar(mini.dataset.mini); sfx.tick(); return; }
      if (e.target.closest('#mpSalir')) {
        cerrarMenuPerfil();
        try { await window.Nube.salir(); ir('inicio'); aviso('Saliste de tu cuenta.'); } catch (err) { aviso('No se pudo salir. Intenta de nuevo.'); }
        return;
      }
      if (e.target.closest('[data-ir], [data-planes]')) cerrarMenuPerfil();
    });
    document.addEventListener('click', (e) => { if (!menuPerfil.hidden && !e.composedPath().includes(chipPerfil.parentElement)) cerrarMenuPerfil(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menuPerfil.hidden) { cerrarMenuPerfil(); chipPerfil.focus(); } });
  }
  const vPerfil = $('#v-perfil');
  if (vPerfil) {
    vPerfil.addEventListener('click', async (e) => {
      const av = e.target.closest('[data-avatar]');
      if (av) { ponerAvatar(av.dataset.avatar); sfx.tick(); aviso(av.dataset.avatar ? 'Avatar elegido.' : 'Avatar quitado.'); return; }
      const id = e.target.id;
      try {
        if (id === 'btnEntrar') { await window.Nube.entrar(); aviso('Sesión iniciada.'); }
        else if (id === 'btnSalir') { await window.Nube.salir(); ir('inicio'); aviso('Saliste de tu cuenta.'); }
        else if (id === 'btnModo') { modoCuenta = modoCuenta === 'crear' ? 'entrar' : 'crear'; if (document.activeElement) document.activeElement.blur(); pintarCuenta(); }
        else if (id === 'btnOlvide') {
          const c = ($('#cCorreo').value || '').trim();
          if (!c) { msgCuenta('Escribe tu correo arriba y vuelve a pulsar.'); return; }
          await window.Nube.recuperarClave(c); msgCuenta('Si ese correo tiene cuenta, te enviamos un enlace para cambiar la contraseña. Revisa también el spam.', true);
        } else if (id === 'btnCancelarSus') {
          const ok = await confirmarModal({ titulo: '¿Cancelar tu suscripción?', texto: 'No se te cobrará el próximo mes y tu cuenta vuelve al plan Free ahora. Puedes suscribirte de nuevo cuando quieras.', boton: 'Cancelar suscripción' });
          if (!ok) return;
          await window.Nube.cancelarSuscripcion(); pintarCuenta(); aviso('Suscripción cancelada. Tu cuenta vuelve a Free.');
        } else if (id === 'btnGuardarNombre') {
          const n = ($('#pNombre').value || '').trim();
          await window.Nube.guardarFicha({ nombre: n }); if (document.activeElement) document.activeElement.blur(); pintarCuenta(); aviso('Nombre guardado.');
        } else if (id === 'btnBorrarFicha') {
          const ok = await confirmarModal({ titulo: '¿Borrar tu ficha?', texto: 'Se eliminan tu nombre, tu avatar y el plan asignado a tu cuenta, y se cierra tu sesión. Tus lecturas de este dispositivo no se tocan. No se puede deshacer.', boton: 'Borrar mi ficha' });
          if (!ok) return;
          await window.Nube.borrarMiFicha(); await window.Nube.salir(); ir('inicio'); aviso('Tu ficha se borró.');
        }
      } catch (err) {
        if (id === 'btnOlvide') msgCuenta(ERR_CUENTA[err && err.code] || 'No se pudo enviar. Intenta de nuevo.');
        else if (id === 'btnGuardarNombre') aviso('No se pudo guardar el nombre. Intenta de nuevo.');
        else if (id === 'btnCancelarSus') aviso('No se pudo cancelar. Intenta de nuevo o escríbenos.');
        else aviso(ERR_CUENTA[err && err.code] || 'No se pudo completar. Intenta de nuevo.');
      }
    });
    vPerfil.addEventListener('submit', async (e) => {
      e.preventDefault();
      const correo = ($('#cCorreo').value || '').trim(), clave = $('#cClave').value || '', crear = modoCuenta === 'crear';
      if (!correo || !clave) { msgCuenta('Escribe tu correo y tu contraseña.'); return; }
      if (crear && clave.length < 8) { msgCuenta(ERR_CUENTA['auth/weak-password']); return; }
      const boton = e.target.querySelector('[type=submit]'); boton.disabled = true;
      if (document.activeElement) document.activeElement.blur();
      try {
        if (crear) { await window.Nube.crearCuenta(correo, clave, ($('#cNombre') || {}).value || ''); aviso('Cuenta creada. Te enviamos un correo para confirmar tu dirección.'); }
        else { await window.Nube.entrarConCorreo(correo, clave); aviso('Sesión iniciada.'); }
      } catch (err) { boton.disabled = false; msgCuenta(ERR_CUENTA[err && err.code] || 'No se pudo completar. Intenta de nuevo.'); }
    });
  }
  window.Nube.alCambiarUsuario(pintarCuenta);

  /* Tarjetas de planes: salen de los perfiles que se editan en el admin. */
  const PLAN_TEXTO = {
    free: { lema: 'Para empezar hoy, sin tarjeta ni compromiso.', boton: 'Comenzar gratis' },
    full: { lema: 'Para leer con regularidad y ver cada lectura completa.', boton: 'Suscribirme a Full' },
    premium: { lema: 'Todo abierto y sin límites: la experiencia completa del tarot.', boton: 'Quiero Premium', cinta: 'La mejor opción' }
  };
  function pintarPlanes() {
    const caja = $('#planesG'); if (!caja) return;
    const T = window.Nube.todosPerfiles(), actual = window.Nube.usuario() ? window.Nube.perfil() : null;
    const inv = $('#planesInv'); if (inv) inv.hidden = !esInvitado();
    const nota = $('#planesNota'); if (nota) nota.innerHTML = (!window.Nube.cobrosAbiertos() ? 'Los cobros abren muy pronto. Elige el plan que te interesa y te avisaremos apenas abran. Precios en pesos chilenos.' : window.Nube.cobrosEnPausa() ? 'Los cobros están en pausa por mantenimiento. Si ya tienes un plan, sigue activo. Precios en pesos chilenos.' : window.Nube.pagosActivos() ? 'Pagos con Mercado Pago, tarjeta o transferencia. Se renuevan cada mes y puedes cancelar cuando quieras desde Mi perfil. Precios en pesos chilenos.' : 'Los cobros se activan muy pronto: crea tu cuenta hoy y quedarás lista o listo para suscribirte cuando abran. Precios en pesos chilenos.') + ' <a href="terminos.html" target="_blank" rel="noopener">Términos y condiciones</a>.';
    caja.innerHTML = ['free', 'full', 'premium'].map((k) => {
      const P = T[k] || {}, X = PLAN_TEXTO[k];
      const li = (ok, t) => `<li${ok ? '' : ' class="no"'}>${t}</li>`;
      const items = [li(true, 'Carta del día')]
        .concat(TIRADAS.map((t) => li((P.tiradas || {})[t.id] !== false, t.nombre)))
        .concat(MAZOS.filter((m) => !m.pendiente).map((m) => li((P.mazos || {})[m.id] !== false, `Mazo ${m.nombre}`)))
        .concat([li(P.calendario !== false, 'Calendario de tu carta del día')])
        .concat([(() => { const rd = P.recuperarDias === null ? null : (typeof P.recuperarDias === 'number' ? P.recuperarDias : 0); return li(P.calendario !== false && rd !== 0, rd === null ? 'Recupera todos tus días perdidos de la semana' : rd > 0 ? `Recupera ${rd} ${rd === 1 ? 'día perdido' : 'días perdidos'} por semana` : 'Recuperar días perdidos'); })()])
        .concat([li(P.temaLibre !== false, 'Pregunta libre')])
        .concat([P.sonido === false ? li(false, 'Sonido místico') : li((Object.keys(P.estilos || {}).filter((n) => P.estilos[n] !== false).length || 0) > 0, `Sonido místico: ${Object.keys(P.estilos || {}).filter((n) => P.estilos[n] !== false).length} de 5 estilos`)])
        .concat([li(true, typeof P.lecturasDia === 'number' ? `${P.lecturasDia} lecturas al día` : 'Lecturas sin límite')])
        .concat([P.diario === false ? li(false, 'Guardar lecturas y notas') : li(true, typeof P.guardadas === 'number' ? `Guarda hasta ${P.guardadas} lecturas` : 'Diario sin límite')]);
      const boton = actual === k ? '<button type="button" class="btn" disabled>Tu plan actual</button>'
        : k === 'free' ? (esInvitado() ? '<button type="button" class="btn primario" data-entrar="1">Crear mi cuenta gratis</button>' : `<button type="button" class="btn" data-ir="mazo">${X.boton}</button>`)
          : `<button type="button" class="btn${k === 'premium' ? ' primario' : ''}" data-suscribir="${k}">${X.boton}</button>`;
      return `<li class="plan${k === 'premium' ? ' dest' : ''} revela visto">${X.cinta ? `<p class="cinta">${X.cinta}</p>` : ''}
        <h3>${NOMBRES_PLAN[k]}</h3><p class="lema">${X.lema}</p>
        <p class="monto">${esc(P.precio || '')}</p><p class="periodo">${esc(P.periodo || '')}</p>
        <ul>${items.join('')}</ul>${boton}</li>`;
    }).join('');
  }
  pintarPlanes();

  function aplicarFunciones(f) {
    const r = document.documentElement.classList;
    r.toggle('f-sin-hoy', f.cartaDelDia === false);
    r.toggle('f-sin-desfile', f.desfile === false);
    r.toggle('f-sin-planes', f.planes === false);
    ajustarSonidoPerfil(); pintarVitrina(); pintarDesfile(); pintarListaMazos(); pintarTiradas(); pintarTemas(); pintarCupo(); pintarPlanes();
    const av = $('#avisoSitio');
    if (av) { const on = !!(f.aviso && f.aviso.activo && f.aviso.texto); av.hidden = !on; av.textContent = on ? f.aviso.texto : ''; }
    if (cuentaCaja) cuentaCaja.hidden = !(window.Nube.activa && f.cuentas !== false);
    const ma = $('#medicionAviso'); if (ma) ma.hidden = !(window.Nube.activa && f.medicion !== false);
    pintarCuenta();
  }
  window.Nube.alCambiarFunciones(aplicarFunciones);

  /* Al actualizar, se queda en la misma pantalla (Mi espacio, perfil o el detalle de una lectura) y en el mismo lugar.
     El resto del recorrido (mazo, cartas, lectura en curso) parte de la portada. */
  let vistaInicial = 'inicio';
  try {
    const nav = performance.getEntriesByType('navigation')[0], g = sessionStorage.getItem('arcana.vista.v1') || '';
    if (nav && nav.type === 'reload') {
      if (g === 'espacio' || g === 'perfil') vistaInicial = g;
      else if (g.startsWith('detalle:') && leer().some((x) => x.id === g.slice(8))) vistaInicial = g;
    }
  } catch (e) { /* sin almacenamiento: parte de la portada */ }
  if (vistaInicial.startsWith('detalle:')) abrirDetalle(vistaInicial.slice(8)); else ir(vistaInicial, false);

  (function () {
    const K = 'arcana.scroll.v2';
    const vistaActual = () => { const v = document.querySelector('.vista:not([hidden])'); return v ? v.id.slice(2) : ''; };
    let y0 = 0;
    try {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav && nav.type === 'reload') { const g = JSON.parse(sessionStorage.getItem(K) || 'null'); if (g && g.v === vistaActual() && g.y > 0) y0 = g.y; }
    } catch (e) { /* sin almacenamiento */ }
    let t = null;
    const guardar = () => { try { sessionStorage.setItem(K, JSON.stringify({ v: vistaActual(), y: Math.round(window.scrollY) })); } catch (e) { /* sigue igual */ } };
    window.addEventListener('scroll', () => { if (t) return; t = setTimeout(() => { t = null; guardar(); }, 150); }, { passive: true });
    window.addEventListener('pagehide', guardar);
    window.addEventListener('beforeunload', guardar);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') guardar(); });
    if (y0 > 0) {
      const ir0 = () => window.scrollTo({ top: y0, left: 0, behavior: 'instant' });
      ir0(); requestAnimationFrame(ir0);
      window.addEventListener('load', () => { ir0(); setTimeout(ir0, 400); }, { once: true });
    }
  })();
})();
