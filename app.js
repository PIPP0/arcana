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

  /* ---------- sonido (apagado por defecto) ----------
     Todo se sintetiza en el navegador (sin archivos): campanas y cuencos en escala pentatónica con
     reverberación, roces de papel para las cartas y un fondo muy suave. Cada interacción tiene su sonido. */
  let sonido = false;
  const sfx = (() => {
    let ctx = null, seco = null, mojado = null, pad = null;
    const NOTA = { la3: 220, mi4: 329.63, la4: 440, do5: 523.25, re5: 587.33, mi5: 659.25, sol5: 783.99, la5: 880, do6: 1046.5, mi6: 1318.5 };
    const azar = (a, b) => a + Math.random() * (b - a);
    function iniciar() {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 4; comp.connect(ctx.destination);
      seco = ctx.createGain(); seco.connect(comp);
      const L = Math.floor(ctx.sampleRate * 3), ir = ctx.createBuffer(2, L, ctx.sampleRate);
      for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 2.8); }
      const rev = ctx.createConvolver(); rev.buffer = ir; mojado = ctx.createGain(); mojado.gain.value = 0.7; mojado.connect(rev); rev.connect(comp);
      return ctx;
    }
    /* campana o cuenco: parciales sinusoidales con caída suave y un poco de eco */
    function voz(freq, t, dur, vol, parciales, ataque = 0.008, eco = 0.7) {
      parciales.forEach(([r, g, dec]) => {
        const o = ctx.createOscillator(), a = ctx.createGain(), e = ctx.createGain();
        o.type = 'sine'; o.frequency.value = freq * r;
        const d = Math.max(0.15, dur * (dec || 1));
        a.gain.setValueAtTime(0.0001, t); a.gain.linearRampToValueAtTime(vol * g, t + ataque); a.gain.exponentialRampToValueAtTime(0.0001, t + d);
        e.gain.value = eco; o.connect(a); a.connect(seco); a.connect(e); e.connect(mojado);
        o.start(t); o.stop(t + d + 0.05);
      });
    }
    const CAMPANA = [[1, 1, 1], [2.76, 0.32, 0.55], [5.4, 0.12, 0.3], [8.9, 0.05, 0.18]];
    const CUENCO = [[1, 1, 1], [2.01, 0.5, 0.8], [3.0, 0.22, 0.6], [4.2, 0.1, 0.4]];
    const CRISTAL = [[1, 1, 0.7], [2, 0.22, 0.35]];
    /* roce de papel: ruido filtrado con barrido de frecuencia */
    function roce(t, dur, f0, f1, vol, q = 0.9, eco = 0.15) {
      const n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.6);
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), e = ctx.createGain();
      f.type = 'bandpass'; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(60, f1), t + dur);
      g.gain.value = vol; e.gain.value = eco; s.buffer = b; s.connect(f); f.connect(g); g.connect(seco); g.connect(e); e.connect(mojado);
      s.start(t);
    }
    const listo = () => { if (!sonido) return false; try { iniciar(); return true; } catch (e) { return false; } };
    const seguro = (fn) => () => { if (!listo()) return; try { fn(ctx.currentTime + 0.01); } catch (e) { /* sin audio: la lectura sigue igual */ } };

    function ambiente(enc) {
      if (!ctx) return;
      const t = ctx.currentTime;
      if (enc) {
        if (pad) return;
        const g = ctx.createGain(), f = ctx.createBiquadFilter(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        f.type = 'lowpass'; f.frequency.value = 520; lfo.frequency.value = 0.06; lg.gain.value = 180; lfo.connect(lg); lg.connect(f.frequency);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 4);
        const osc = [[110, 'sine', 1], [164.81, 'sine', 0.55], [220.4, 'triangle', 0.3], [329.7, 'sine', 0.16]].map(([fr, ty, v]) => {
          const o = ctx.createOscillator(), og = ctx.createGain(); o.type = ty; o.frequency.value = fr; og.gain.value = v; o.connect(og); og.connect(f); o.start(t); return o;
        });
        f.connect(g); g.connect(seco); g.connect(mojado); lfo.start(t);
        pad = { g, osc: osc.concat(lfo) };
      } else if (pad) {
        const p = pad; pad = null;
        p.g.gain.cancelScheduledValues(t); p.g.gain.setValueAtTime(Math.max(0.0001, p.g.gain.value), t); p.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
        setTimeout(() => p.osc.forEach((o) => { try { o.stop(); } catch (e) { /* ya parado */ } }), 1000);
      }
    }
    document.addEventListener('visibilitychange', () => { if (ctx) { if (document.hidden) ctx.suspend(); else if (sonido) ctx.resume(); } });

    return {
      /* al activar el sonido: tres notas ascendentes y empieza el fondo */
      encender: seguro((t) => { [NOTA.la4, NOTA.mi5, NOTA.la5].forEach((f, i) => voz(f, t + i * 0.16, 2.4, 0.07, CAMPANA)); ambiente(true); }),
      apagar() { ambiente(false); },
      /* un toque suave: temas, opciones */
      tick: seguro((t) => { voz(NOTA.mi6, t, 0.5, 0.045, CRISTAL, 0.004, 0.5); roce(t, 0.05, 3200, 1800, 0.02); }),
      /* elegir mazo: se abre la caja, roce largo de cartas y un cuenco grave */
      mazo: seguro((t) => { roce(t, 0.32, 1200, 3200, 0.05, 0.6); roce(t + 0.12, 0.2, 2600, 900, 0.035); voz(NOTA.la3, t + 0.05, 2.6, 0.09, CUENCO); }),
      tirada: seguro((t) => { voz(NOTA.re5, t, 1.4, 0.06, CAMPANA); roce(t, 0.08, 2400, 1400, 0.025); }),
      /* barajar: aleteo de cartas que se acelera y se apaga, como el movimiento de la pila (≈1,2 s) */
      barajar: seguro((t) => {
        roce(t, 1.0, 260, 900, 0.03, 0.5, 0.3);
        for (let i = 0; i < 18; i++) {
          const dt = i * 0.052 + azar(0, 0.014);
          roce(t + dt, azar(0.03, 0.055), azar(2200, 4200), azar(1200, 2000), 0.055 * (1 - i * 0.025), 1.2, 0.1);
        }
        voz(NOTA.la3 / 2, t + 0.95, 1.2, 0.05, CUENCO, 0.05);
      }),
      /* repartir: las cartas se abren en abanico con un barrido y un destello */
      repartir: seguro((t) => {
        for (let i = 0; i < 12; i++) roce(t + i * 0.035, 0.05, 1800 + i * 260, 3600 + i * 200, 0.04, 1.1, 0.2);
        roce(t, 0.5, 500, 5200, 0.035, 0.5, 0.35);
        voz(NOTA.mi6, t + 0.38, 1.8, 0.04, CAMPANA); voz(NOTA.sol5, t + 0.46, 1.8, 0.04, CAMPANA);
      }),
      /* elegir una carta: nota que sube con cada carta (1.ª, 2.ª, 3.ª) */
      elegir(n) { const nota = [NOTA.mi5, NOTA.sol5, NOTA.la5][Math.min(n, 2)]; seguro((t) => { roce(t, 0.06, 2800, 1600, 0.03); voz(nota, t, 1.6, 0.075, CAMPANA); })(); },
      soltar: seguro((t) => { voz(NOTA.re5, t, 0.5, 0.04, CRISTAL, 0.006, 0.3); }),
      /* confirmar: cuenco tibetano largo con su quinta */
      confirmar: seguro((t) => { voz(NOTA.la3, t, 4.2, 0.13, CUENCO, 0.02); voz(NOTA.mi4, t + 0.14, 3.6, 0.08, CUENCO, 0.02); roce(t, 0.5, 400, 2400, 0.02, 0.5, 0.4); }),
      /* dar vuelta una carta: giro de papel y, a mitad del giro, la campana de su posición.
         La última carta cierra con un acorde abierto. */
      revelar(i, ultima) {
        const nota = [NOTA.la4, NOTA.re5, NOTA.sol5][i % 3];
        seguro((t) => {
          roce(t, 0.26, 600, 4200, 0.07, 0.7, 0.2);
          voz(nota, t + 0.4, 2.6, 0.09, CAMPANA, 0.006);
          voz(nota * 4, t + 0.42, 1.2, 0.025, CRISTAL, 0.004, 0.9);
        })();
      },
      /* entrega de la lectura: marea que sube, bajo profundo, cascada de campanas y un acorde que se asienta */
      entrega(suave) {
        seguro((t) => {
          const v = suave ? 0.6 : 1;
          roce(t, 1.5, 180, 6500, 0.05 * v, 0.4, 0.55);
          voz(NOTA.la3 / 2, t + 0.1, 7.5, 0.12 * v, CUENCO, 0.6);
          voz(NOTA.la3, t + 0.35, 6.5, 0.09 * v, CUENCO, 0.7);
          [NOTA.la4, NOTA.do5, NOTA.re5, NOTA.mi5, NOTA.sol5, NOTA.la5, NOTA.do6, NOTA.mi6].forEach((f, i) => voz(f, t + 1.0 + i * 0.11, 3.4, 0.05 * v, CAMPANA, 0.006, 0.9));
          voz(NOTA.la4, t + 2.1, 5.5, 0.06 * v, CAMPANA, 0.01, 0.9); voz(NOTA.mi5, t + 2.15, 5.5, 0.045 * v, CAMPANA, 0.01, 0.9); voz(NOTA.do6, t + 2.2, 5.5, 0.04 * v, CAMPANA, 0.01, 0.9);
          voz(NOTA.mi6 * 2, t + 2.35, 3.2, 0.02 * v, CRISTAL, 0.004, 1);
        })();
      },
      /* algo bloqueado: un «toc» grave y amable, sin castigar */
      negado: seguro((t) => { voz(196, t, 0.35, 0.07, [[1, 1, 1], [1.5, 0.3, 0.6]], 0.004, 0.25); }),
      guardar: seguro((t) => { voz(NOTA.mi5, t, 1.4, 0.06, CAMPANA); voz(NOTA.la5, t + 0.13, 2.0, 0.06, CAMPANA); }),
      paso: seguro((t) => { roce(t, 0.2, 500, 1800, 0.02, 0.6, 0.25); })
    };
  })();
  $('#btnSonido').addEventListener('click', (e) => {
    sonido = !sonido;
    e.currentTarget.setAttribute('aria-pressed', String(sonido));
    e.currentTarget.textContent = sonido ? 'Sonido: sí' : 'Sonido: no';
    if (sonido) sfx.encender(); else sfx.apagar();
  });

  /* ---------- navegación ---------- */
  const CON_TEMA = ['intencion', 'tirada', 'barajar', 'elegir', 'lectura'];
  function ir(id, foco = true) {
    if (id === 'tirada') estado.pregunta = $('#pregunta').value.trim();
    if (id === 'barajar') prepararBarajar();
    if (id === 'espacio') pintarHistorial();
    if (id === 'intencion') pintarTemas();
    if (id === 'mazo' || id === 'tirada') pintarCupo();
    if (id === 'tirada') pintarTiradas();
    pintarRuta(id);
    window.Nube.vista(id);
    if (id === 'barajar') window.Nube.eleccion({ mazo: estado.mazo, tema: estado.tema, tirada: estado.tirada && estado.tirada.id });
    $$('.vista').forEach((v) => { v.hidden = v.id !== 'v-' + id; });
    document.body.className = (CON_TEMA.includes(id) ? 'tema-' + estado.mazo : '') + (id === 'elegir' ? ' con-fija' : '') + (id === 'inicio' ? '' : ' interior');
    window.scrollTo(0, 0);
    if (foco) { const h = $('#v-' + id + ' h1, #v-' + id + ' h2'); if (h) h.focus({ preventScroll: true }); }
  }
  document.addEventListener('click', (e) => {
    const pl = e.target.closest('[data-planes]'); if (pl) { irAPlanes(); return; }
    const sus = e.target.closest('[data-suscribir]');
    if (sus) { ir('espacio'); aviso('Crea tu cuenta y deja todo listo: los cobros se activan muy pronto.'); return; }
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
  const NOMBRE_PERFIL = { free: 'Free', full: 'Full', premium: 'Premium' };
  const mazoVisible = (id) => ((window.Nube.funciones().mazos) || {})[id] !== false;
  const mazoActivo = (id) => mazoVisible(id) && ((permisos().mazos) || {})[id] !== false;
  const mazoIncluido = (id) => ((permisos().mazos) || {})[id] !== false;
  const tiradaIncluida = (id) => ((permisos().tiradas) || {})[id] !== false;
  /* Qué plan abre algo que el perfil actual no incluye (el más barato que lo tenga). */
  const NOMBRES_PLAN = { free: 'Free', full: 'Full', premium: 'Premium' };
  function planQueAbre(prueba) { const T = window.Nube.todosPerfiles(); return ['full', 'premium'].find((k) => prueba(T[k] || {})) || 'premium'; }
  const bloqueo = () => 'Con suscripción';
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
    return cupoAgotado() ? `Hoy ya hiciste tus ${t} ${pl(t)} del perfil ${p}. Mañana vuelves a tener ${t}.` : `Perfil ${p}: te quedan ${t - lecturasHoy()} de ${t} ${pl(t)} hoy.`;
  }
  function pintarCupo() {
    const n = $('#cupoNota'); if (!n) return; const x = textoCupo(); n.hidden = !x;
    n.innerHTML = x ? esc(x) + (cupoAgotado() || window.Nube.perfil() === 'free' ? ` <button type="button" class="enlace-p" data-planes="1">${cupoAgotado() ? 'Sigue leyendo hoy suscribiéndote' : 'Lee sin límites suscribiéndote'} →</button>` : '') : '';
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
      ${mazoIncluido(m.id) ? '' : `<button type="button" class="suscr" data-planes="1"><span class="sello-p">${bloqueo((P) => (P.mazos || {})[m.id] !== false)}</span>Descúbrelo suscribiéndote →</button>`}</li>`).join('');
    ajustarTextosMazos(); };
  pintarVitrina();

  /* desfile de cartas reales */
  const DESFILE = [['rws', 17], ['dodal', 19], ['sola', 0], ['rws', 2], ['dodal', 1], ['sola', 13], ['rws', 36], ['dodal', 10], ['sola', 21], ['rws', 19], ['dodal', 18], ['sola', 6], ['rws', 6], ['dodal', 64]];
  const pintarDesfile = () => { const D = DESFILE.filter(([m]) => mazoVisible(m)); $('#desfile').innerHTML = D.concat(D).map(([m, i]) => `<img src="${src(m, i)}" alt="" loading="lazy" decoding="async">`).join(''); };
  pintarDesfile();

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
      const lente = [
        `Hoy te acompaña ${k.hilo}. Fíjate dónde aparece: en una conversación, en una decisión pequeña, en cómo te tratas a ti.`,
        `Si tuvieras que ponerle nombre a tu día, esta carta sugiere ${k.hilo}. Mira dónde se asoma, aunque sea en algo pequeño.`,
        `Lleva ${k.hilo} como una lente: ¿cómo se ve tu jornada desde ahí?`][g.carta % 3];
      $('#hoyTexto').innerHTML = `<p class="pos">Tu carta de hoy</p><h3>${k.nombre}</h3><p class="claves">${k.claves}</p>
        <p class="mensaje">${k.esencia}</p>
        <div class="hoy-bloques">
          <div><b>Para tu día</b><p>${lente} ${k.luz}</p></div>
          <div><b>Ten presente</b><p>${k.sombra}</p></div>
          <div class="noche"><b>Una pregunta para ti</b><p>${k.pregunta}</p></div>
        </div>
        <div class="acciones"><button type="button" class="btn primario" data-ir="mazo">Profundizar con tres cartas</button></div>`;
    }
    btn.addEventListener('click', () => {
      if (btn.classList.contains('vista-carta')) { ampliar(g.carta, 'rws'); return; }
      sfx.revelar(1); setTimeout(() => sfx.entrega(true), 650); mostrar(); window.Nube.cartaHoy();
      if (window.Nube.usuario()) guardarVista(true);
    });
    function guardarVista(v) { g.vista = v; try { localStorage.setItem('arcana.hoy.v1', JSON.stringify(g)); } catch (e) { /* sigue igual */ } }
    window.Nube.alCambiarUsuario((u) => {
      if (u && btn.classList.contains('vista-carta')) guardarVista(true);
      else if (u && g.vista) mostrar();
      else if (!u && g.vista) guardarVista(false);
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
        <span class="elegir">${mazoIncluido(m.id) ? 'Leer con este mazo →' : 'Descúbrelo suscribiéndote →'}</span></span>
    </button>`).join(''); };
  pintarListaMazos();
  $('#listaMazos').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mazo]'); if (!b) return;
    if (b.dataset.bloq) { sfx.negado(); irAPlanes('Este mazo se abre con una suscripción. Mira los planes.'); return; }
    if (cupoAgotado()) { sfx.negado(); aviso(textoCupo()); return; }
    estado.mazo = b.dataset.mazo; sfx.mazo(); ir('intencion');
  });

  /* ---------- temas ---------- */
  function pintarTemas() {
    if (!temasPermitidos().some((t) => t.id === estado.tema)) estado.tema = 'general';
    $('#listaTemas').innerHTML = TEMAS.map((t) => {
      const bl = t.id === 'libre' && permisos().temaLibre === false;
      return `<button type="button" class="tema-p${bl ? ' bloq' : ''}" role="radio" aria-checked="${t.id === estado.tema}" data-tema="${t.id}"${bl ? ' data-bloq="1"' : ''} tabindex="${t.id === estado.tema ? 0 : -1}"><img src="${src(estado.mazo, TEMA_IMG[t.id])}" alt="" decoding="async"><span>${t.nombre}${bl ? `<small>Descúbrelo suscribiéndote</small>` : ''}</span></button>`;
    }).join('');
  }
  pintarTemas();
  $('#listaTemas').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tema]'); if (!b) return;
    if (b.dataset.bloq) { sfx.negado(); irAPlanes('La pregunta libre se abre con una suscripción. Mira los planes.'); return; }
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
        <span class="elegir">${tiradaIncluida(t.id) ? 'Elegir esta tirada' : 'Descúbrela suscribiéndote →'}</span>
      </button>`).join('');
  }
  pintarTiradas();
  $('#listaTiradas').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tirada]'); if (!b) return;
    if (b.dataset.bloq) { sfx.negado(); irAPlanes('Esta tirada se abre con una suscripción. Mira los planes.'); return; }
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
  $('#btnConfirmar').addEventListener('click', () => { sfx.confirmar(); pintarLectura(); ir('lectura'); });

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

  function sintesis(ks) {
    const t = estado.tirada.id;
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

  function pintarInterpretacion() {
    const ids = cartasDeLectura(), ks = ids.map((i) => CARTAS[i]), pos = estado.tirada.pos, mz = estado.mazo;
    const tema = TEMAS.find((t) => t.id === estado.tema), centro = ks[Math.floor(ks.length / 2)];
    const lp = estado.pregunta ? leerPregunta(estado.pregunta) : null;
    let h = `<div class="adorno" aria-hidden="true"></div><div><p class="intro">${tema.intro}</p></div>`;
    if (lp && lp.apoyo) h += `<div class="apoyo"><h3>No tienes que pasar por esto a solas</h3><p>Si estás viviendo un momento muy difícil, hablar con alguien ayuda. En Chile puedes llamar gratis al <b>*4141</b>, la línea de prevención del suicidio, o a Salud Responde al <b>600 360 7777</b>, a cualquier hora.</p></div>`;
    if (lp) h += `<div class="tu-pregunta"><p class="pos">Tu pregunta</p><p class="q">«${esc(estado.pregunta)}»</p>${lp.notas.map((n) => `<p>${n}</p>`).join('')}${lp.profesional ? '<p>Para temas de salud, legales o de dinero, toma esta lectura solo como una pausa para pensar: la decisión merece el consejo de un profesional.</p>' : ''}</div>`;
    h += ks.map((k, i) => {
      const nota = notaMazo(ids[i], mz);
      return `<article class="bloque"><button type="button" class="ver" data-ver="${ids[i]}" aria-label="Ampliar ${esc(k.nombre)}">${carta(cara(ids[i], mz), mz)}</button>
        <div><p class="pos">${pos[i].nombre}</p><h3>${k.nombre}</h3><p class="claves">${k.claves}</p>
        <p class="significa">${k.esencia}</p>
        <p class="rot">Para ti</p><p class="texto">${reflexion(pos[i].id, k, estado.tema)}</p>${nota ? `<p class="nota-mazo">${nota}</p>` : ''}</div></article>`;
    }).join('');
    h += `<section class="sintesis"><h3>${ks.length === 1 ? 'En síntesis' : 'Leídas en conjunto'}</h3><p>${sintesis(ks)}</p>${estado.pregunta ? `<p>Vuelve ahora a tu pregunta. Leída desde ${centro.hilo}, ¿qué respuesta se asoma que no tenías antes de barajar?</p>` : ''}<p>${tema.cierre}</p></section>`;
    h += `<section><h3>Preguntas para ti</h3><ul>${ks.map((k) => `<li>${k.pregunta}</li>`).join('')}${PREG_TEMA[estado.tema] ? `<li>${PREG_TEMA[estado.tema](centro.hilo)}</li>` : ''}</ul></section>`;
    h += `<section><h3>Para seguir explorando</h3><ul>${tema.acciones.map((a) => `<li>${a}</li>`).join('')}</ul></section>`;
    h += `<p class="descargo">Esta es una interpretación simbólica, pensada para reflexionar. No predice lo que va a pasar ni reemplaza el consejo de un profesional.</p>`;
    h += `<section class="cierre"><h3>Tu reflexión</h3>
      ${permisos().diario === false ? '' : `<label class="campo" for="notaLectura" style="margin-top:8px">Una nota privada <span>(opcional)</span></label>
      <textarea id="notaLectura" rows="3" maxlength="1000" placeholder="¿Qué te llevas de esta lectura?"></textarea>`}
      <div class="acciones">
        ${permisos().diario === false ? '' : '<button type="button" class="btn primario" id="btnGuardar">Guardar en mi espacio</button>'}
        <button type="button" class="btn" id="btnOtra">Hacer otra lectura</button>
      </div></section>`;
    const el = $('#interpretacion'); el.innerHTML = h; el.hidden = false;
    sfx.entrega(); contarLectura(); pintarCupo();
    window.Nube.lectura({ mazo: mz, tema: estado.tema, tirada: estado.tirada.id, cartas: ids, pregunta: !!estado.pregunta });
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
  function pintarCuenta() {
    const caja = $('#cuentaEstado'); if (!caja) return;
    const u = window.Nube.usuario(), foco = document.activeElement;
    if (!u && foco && caja.contains(foco) && foco.tagName === 'INPUT') return; // no borrar lo que la persona está escribiendo
    if (u) {
      const p = window.Nube.perfil();
      caja.innerHTML = `<p>Sesión iniciada como <b>${esc(u.email)}</b>. Tu carta del día se mantiene volteada al actualizar. Tus lecturas y notas siguen guardadas solo en este dispositivo.</p>
         <p>Tu perfil: <b>${NOMBRE_PERFIL[p]}</b> · ${resumenPerfil()}.</p>
         <div class="acciones"><button type="button" class="btn chico" id="btnSalir">Salir</button><button type="button" class="btn chico" id="btnBorrarFicha">Borrar mi ficha</button></div>`;
      return;
    }
    const crear = modoCuenta === 'crear';
    caja.innerHTML = `<p>Entra para que tu carta del día se mantenga volteada al actualizar la página. Es opcional: tus lecturas y notas siguen guardándose solo en este dispositivo.</p>
      <div class="acciones"><button type="button" class="btn primario chico" id="btnEntrar">Entrar con Google</button></div>
      <p class="o">o con tu correo y contraseña</p>
      <form id="formCorreo" novalidate>
        ${crear ? '<label class="campo" for="cNombre">Tu nombre <span>(opcional)</span></label><input id="cNombre" type="text" maxlength="80" autocomplete="name">' : ''}
        <label class="campo" for="cCorreo">Correo</label><input id="cCorreo" type="email" autocomplete="email" inputmode="email" required>
        <label class="campo" for="cClave">Contraseña${crear ? ' <span>(mínimo 8 caracteres)</span>' : ''}</label><input id="cClave" type="password" autocomplete="${crear ? 'new-password' : 'current-password'}" minlength="8" required>
        <p class="error" id="cMsg" role="alert" aria-live="polite"></p>
        <div class="acciones"><button type="submit" class="btn primario chico">${crear ? 'Crear mi cuenta' : 'Entrar'}</button>
          <button type="button" class="btn chico" id="btnModo">${crear ? 'Ya tengo cuenta' : 'Crear una cuenta'}</button>
          ${crear ? '' : '<button type="button" class="btn chico" id="btnOlvide">Olvidé mi contraseña</button>'}</div>
      </form>`;
  }
  const cuentaCaja = $('#cuentaCaja');
  const msgCuenta = (t, ok) => { const m = $('#cMsg'); if (m) { m.textContent = t; m.classList.toggle('ok', !!ok); } };
  if (cuentaCaja) {
    cuentaCaja.addEventListener('click', async (e) => {
      const id = e.target.id;
      try {
        if (id === 'btnEntrar') { await window.Nube.entrar(); aviso('Sesión iniciada.'); }
        else if (id === 'btnSalir') { await window.Nube.salir(); aviso('Saliste de tu cuenta.'); }
        else if (id === 'btnModo') { modoCuenta = modoCuenta === 'crear' ? 'entrar' : 'crear'; if (document.activeElement) document.activeElement.blur(); pintarCuenta(); }
        else if (id === 'btnOlvide') {
          const c = ($('#cCorreo').value || '').trim();
          if (!c) { msgCuenta('Escribe tu correo arriba y vuelve a pulsar.'); return; }
          await window.Nube.recuperarClave(c); msgCuenta('Si ese correo tiene cuenta, te enviamos un enlace para cambiar la contraseña. Revisa también el spam.', true);
        } else if (id === 'btnBorrarFicha') {
          if (e.target.dataset.seguro !== '1') { e.target.dataset.seguro = '1'; e.target.textContent = 'Toca de nuevo para borrar'; return; }
          await window.Nube.borrarMiFicha(); await window.Nube.salir(); aviso('Tu ficha se borró.');
        }
      } catch (err) { if (id === 'btnOlvide') msgCuenta(ERR_CUENTA[err && err.code] || 'No se pudo enviar. Intenta de nuevo.'); else aviso(ERR_CUENTA[err && err.code] || 'No se pudo completar. Intenta de nuevo.'); }
    });
    cuentaCaja.addEventListener('submit', async (e) => {
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
    caja.innerHTML = ['free', 'full', 'premium'].map((k) => {
      const P = T[k] || {}, X = PLAN_TEXTO[k];
      const li = (ok, t) => `<li${ok ? '' : ' class="no"'}>${t}</li>`;
      const items = [li(true, 'Carta del día')]
        .concat(TIRADAS.map((t) => li((P.tiradas || {})[t.id] !== false, t.nombre)))
        .concat(MAZOS.filter((m) => !m.pendiente).map((m) => li((P.mazos || {})[m.id] !== false, `Mazo ${m.nombre}`)))
        .concat([li(P.temaLibre !== false, 'Pregunta libre')])
        .concat([li(true, typeof P.lecturasDia === 'number' ? `${P.lecturasDia} lecturas al día` : 'Lecturas sin límite')])
        .concat([P.diario === false ? li(false, 'Guardar lecturas y notas') : li(true, typeof P.guardadas === 'number' ? `Guarda hasta ${P.guardadas} lecturas` : 'Diario sin límite')]);
      const boton = actual === k ? '<button type="button" class="btn" disabled>Tu plan actual</button>'
        : k === 'free' ? `<button type="button" class="btn" data-ir="mazo">${X.boton}</button>`
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
    pintarVitrina(); pintarDesfile(); pintarListaMazos(); pintarTiradas(); pintarTemas(); pintarCupo(); pintarPlanes();
    const av = $('#avisoSitio');
    if (av) { const on = !!(f.aviso && f.aviso.activo && f.aviso.texto); av.hidden = !on; av.textContent = on ? f.aviso.texto : ''; }
    if (cuentaCaja) cuentaCaja.hidden = !(window.Nube.activa && f.cuentas !== false);
    const ma = $('#medicionAviso'); if (ma) ma.hidden = !(window.Nube.activa && f.medicion !== false);
    pintarCuenta();
  }
  window.Nube.alCambiarFunciones(aplicarFunciones);

  ir('inicio', false);

  /* Al actualizar la portada, vuelve al mismo lugar en que estabas (el resto parte de cero). */
  (function () {
    const K = 'arcana.scroll.v1';
    let y0 = 0;
    try { const nav = performance.getEntriesByType('navigation')[0]; if (nav && nav.type === 'reload') y0 = Number(sessionStorage.getItem(K)) || 0; } catch (e) { /* sin almacenamiento */ }
    let t = null;
    const guardar = () => { const v = $('#v-inicio'); if (v && !v.hidden) { try { sessionStorage.setItem(K, String(Math.round(window.scrollY))); } catch (e) { /* sigue igual */ } } };
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
