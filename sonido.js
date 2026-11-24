/* ARCANA — sonido del sitio: cinco estilos sintetizados en el navegador (sin archivos).
   1 Cristal y campanas · 2 Cuenco tibetano · 3 Arpa celestial · 4 Cajita de música · 5 Ritual y misterio.
   Solo suena si la persona activa «Sonido». Cada interacción tiene su propio sonido. */
(function () {
  'use strict';
  let ctx = null, seco = null, mojado = null, pad = null;
  const N = { la2: 110, la3: 220, mi4: 329.63, la4: 440, do5: 523.25, re5: 587.33, mi5: 659.25, sol5: 783.99, la5: 880, do6: 1046.5, mi6: 1318.5 };
  const azar = (a, b) => a + Math.random() * (b - a);

  /* iPhone: el sonido de la web se silencia con el interruptor de silencio y el audio se «suspende» solo.
     Se pide el modo «reproducción» y se mantiene un audio mudo para que el sistema deje sonar la página. */
  let mudo = null;
  function desbloquearIOS() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* no disponible */ }
    try {
      if (!mudo) {
        const n = 4000, b = new DataView(new ArrayBuffer(44 + n)); const w = (o2, t) => { for (let i = 0; i < t.length; i++) b.setUint8(o2 + i, t.charCodeAt(i)); };
        w(0, 'RIFF'); b.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 1, true);
        b.setUint32(24, 8000, true); b.setUint32(28, 8000, true); b.setUint16(32, 1, true); b.setUint16(34, 8, true); w(36, 'data'); b.setUint32(40, n, true);
        for (let i = 0; i < n; i++) b.setUint8(44 + i, 128);
        mudo = new Audio(URL.createObjectURL(new Blob([b.buffer], { type: 'audio/wav' }))); mudo.loop = true; mudo.setAttribute('playsinline', '');
      }
      const p = mudo.play(); if (p && p.catch) p.catch(() => { /* sin permiso aún */ });
    } catch (e) { /* sigue sin el truco */ }
  }
  function iniciar() {
    desbloquearIOS();
    if (ctx) { if (ctx.state !== 'running') ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -22; comp.ratio.value = 5; comp.connect(ctx.destination);
    seco = ctx.createGain(); seco.gain.value = 0.9; seco.connect(comp);
    const L = Math.floor(ctx.sampleRate * 2.6), ir = ctx.createBuffer(2, L, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 3); }
    const rev = ctx.createConvolver(); rev.buffer = ir; mojado = ctx.createGain(); mojado.gain.value = 0.5; mojado.connect(rev); rev.connect(comp);
  }

  /* ---------- piezas de sonido ---------- */
  function voz(f, t, dur, vol, partes, ataque, eco) {
    ataque = ataque || 0.008; eco = eco == null ? 0.6 : eco;
    partes.forEach(([r, g, dec]) => {
      const o = ctx.createOscillator(), a = ctx.createGain(), e = ctx.createGain(), d = Math.max(0.12, dur * (dec || 1));
      o.type = 'sine'; o.frequency.value = f * r;
      a.gain.setValueAtTime(0.0001, t); a.gain.linearRampToValueAtTime(vol * g, t + ataque); a.gain.exponentialRampToValueAtTime(0.0001, t + d);
      e.gain.value = eco; o.connect(a); a.connect(seco); a.connect(e); e.connect(mojado); o.start(t); o.stop(t + d + 0.05);
    });
  }
  const CAMPANA = [[1, 1, 1], [2.76, 0.3, 0.55], [5.4, 0.1, 0.3]];
  const CUENCO = [[1, 1, 1], [2.01, 0.45, 0.8], [3.0, 0.2, 0.6], [4.2, 0.08, 0.4]];
  const GONG = [[1, 1, 1], [1.47, 0.55, 0.9], [2.09, 0.4, 0.8], [2.56, 0.3, 0.7], [3.7, 0.18, 0.5]];
  const CRISTAL = [[1, 1, 0.7], [2, 0.2, 0.35]];

  function ruido(n) { const b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; }
  function roce(t, dur, f0, f1, vol, q, eco) {
    q = q || 0.9; eco = eco == null ? 0.15 : eco;
    const n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.6);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), e = ctx.createGain();
    f.type = 'bandpass'; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(60, f1), t + dur);
    g.gain.value = vol; e.gain.value = eco; s.buffer = b; s.connect(f); f.connect(g); g.connect(seco); g.connect(e); e.connect(mojado); s.start(t);
  }
  /* soplo: ruido que sube y baja, como un aliento */
  function soplo(t, dur, f0, f1, vol, eco) {
    eco = eco == null ? 0.5 : eco;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), e = ctx.createGain();
    s.buffer = ruido(Math.floor(ctx.sampleRate * dur)); f.type = 'bandpass'; f.Q.value = 0.35;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(60, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    e.gain.value = eco; s.connect(f); f.connect(g); g.connect(seco); g.connect(e); e.connect(mojado); s.start(t);
  }
  /* cuerda pulsada (Karplus-Strong) */
  function cuerda(f, t, dur, vol, eco) {
    eco = eco == null ? 0.55 : eco;
    const sr = ctx.sampleRate, n = Math.floor(sr * dur), b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0), P = Math.max(2, Math.round(sr / f)), L = new Float32Array(P);
    let prev = 0; for (let i = 0; i < P; i++) { const r = Math.random() * 2 - 1; prev = prev * 0.5 + r * 0.5; L[i] = prev; }
    let p = 0; for (let i = 0; i < n; i++) { const a = L[p], c = L[(p + 1) % P]; L[p] = (a + c) * 0.5 * 0.9965; d[i] = a; p = (p + 1) % P; }
    const s = ctx.createBufferSource(), g = ctx.createGain(), e = ctx.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.setValueAtTime(vol, t + dur * 0.7); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    e.gain.value = eco; s.buffer = b; s.connect(g); g.connect(seco); g.connect(e); e.connect(mojado); s.start(t);
  }
  /* cajita de música: púa metálica, brillante y corta */
  function cajita(f, t, vol, dur) {
    dur = dur || 1.1;
    voz(f, t, dur, vol, [[1, 1, 1], [4.01, 0.28, 0.35], [6.9, 0.1, 0.2]], 0.003, 0.8);
    roce(t, 0.02, 5000, 3500, vol * 0.25, 1.5, 0.05);
  }
  function tambor(t, f0, f1, dur, vol, eco) {
    const o = ctx.createOscillator(), g = ctx.createGain(), e = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.45);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); e.gain.value = eco == null ? 0.25 : eco;
    o.connect(g); g.connect(seco); g.connect(e); e.connect(mojado); o.start(t); o.stop(t + dur + 0.05);
    roce(t, 0.03, 2500, 900, vol * 0.18, 1, 0.05);
  }
  function madera(t, f, vol) { voz(f, t, 0.12, vol, [[1, 1, 1], [2.3, 0.3, 0.5]], 0.002, 0.25); roce(t, 0.015, 3500, 2500, vol * 0.3, 1.5, 0.05); }

  /* ---------- las cinco opciones: solo cambian el timbre y el gesto ---------- */
  const OPCIONES = [
    { id: 1, nombre: 'Cristal y campanas', desc: 'Campanas claras y cuencos con eco largo, roces de papel brillantes. Es el sonido que ya tiene el sitio, algo más sobrio.',
      nota: (f, t, v, d) => voz(f, t, d || 1.8, v, CAMPANA),
      grave: (f, t, v, d) => voz(f, t, d || 3.5, v, CUENCO, 0.02),
      flap: (t, v) => roce(t, azar(0.03, 0.055), azar(2200, 4200), azar(1200, 2000), v, 1.2, 0.1),
      swish: (t) => roce(t, 0.26, 600, 4200, 0.06, 0.7, 0.2),
      intro: (t, o) => { [N.la4, N.mi5, N.la5].forEach((f, i) => o.nota(f, t + i * 0.16, 0.06, 2)); },
      entrega: (t, v, o) => {
        roce(t, 1.4, 200, 5000, 0.035 * v, 0.4, 0.5); o.grave(N.la3, t + 0.1, 0.1 * v, 6); o.grave(N.la3 * 1.5, t + 0.4, 0.06 * v, 5);
        [N.la4, N.do5, N.mi5, N.la5, N.do6].forEach((f, i) => o.nota(f, t + 1.1 + i * 0.14, 0.045 * v, 3));
        o.nota(N.mi6, t + 2.1, 0.03 * v, 4);
      } },
    { id: 2, nombre: 'Cuenco tibetano y aliento', desc: 'Cálido, lento y grave. Cuencos que resuenan y soplos suaves en lugar de roces. Sin sonidos agudos: pensado para sentirse como un ritual tranquilo.',
      nota: (f, t, v, d) => voz(f * 0.5, t, d || 3, v * 1.4, CUENCO, 0.05),
      grave: (f, t, v, d) => voz(f, t, d || 5, v * 1.2, CUENCO, 0.08),
      flap: (t, v) => soplo(t, azar(0.07, 0.12), 900, 400, v * 0.6, 0.3),
      swish: (t) => soplo(t, 0.5, 300, 1400, 0.05, 0.5),
      intro: (t, o) => { o.grave(N.la3, t, 0.1, 5); o.nota(N.mi5, t + 0.5, 0.05, 4); },
      entrega: (t, v, o) => {
        soplo(t, 2.2, 150, 1200, 0.06 * v, 0.6);
        o.grave(N.la3, t + 0.2, 0.11 * v, 8); o.grave(N.mi4, t + 1.0, 0.09 * v, 7); o.grave(N.la4, t + 1.8, 0.07 * v, 7);
        voz(N.la5, t + 2.6, 4, 0.025 * v, CRISTAL, 0.02, 1);
      } },
    { id: 3, nombre: 'Arpa celestial', desc: 'Cuerdas pulsadas, como un arpa suave. Notas que suben en cascada al revelar y al entregar la lectura. Delicado y melódico.',
      nota: (f, t, v, d) => cuerda(f, t, d || 2.2, v * 1.8),
      grave: (f, t, v, d) => { cuerda(f * 0.5, t, d || 3, v * 2); },
      flap: (t, v) => roce(t, azar(0.03, 0.05), azar(1500, 2600), azar(900, 1500), v * 0.7, 1, 0.08),
      swish: (t) => { [N.la4, N.do5, N.mi5, N.la5].forEach((f, i) => cuerda(f, t + i * 0.06, 1.6, 0.06)); },
      intro: (t, o) => { [N.la4, N.mi5, N.la5, N.do6].forEach((f, i) => o.nota(f, t + i * 0.14, 0.05, 2.4)); },
      entrega: (t, v, o) => {
        o.grave(N.la3, t, 0.09 * v, 4);
        [N.la3, N.mi4, N.la4, N.do5, N.re5, N.mi5, N.sol5, N.la5, N.do6, N.mi6].forEach((f, i) => cuerda(f, t + 0.3 + i * 0.1, 2.6, 0.06 * v));
        [N.la4, N.mi5, N.do6].forEach((f, i) => cuerda(f, t + 1.7 + i * 0.03, 3.4, 0.05 * v));
      } },
    { id: 4, nombre: 'Cajita de música', desc: 'Una púa metálica brillante y juguetona, como una caja de música antigua. Al entregar la lectura toca una frase corta. Delicado y algo nostálgico.',
      nota: (f, t, v, d) => cajita(f, t, v * 1.3, d || 1.2),
      grave: (f, t, v, d) => cajita(f * 2, t, v * 1.2, d || 2),
      flap: (t, v) => roce(t, 0.02, 4500, 3000, v * 0.5, 1.6, 0.05),
      swish: (t) => { [N.mi5, N.sol5, N.la5].forEach((f, i) => cajita(f, t + i * 0.07, 0.05)); },
      intro: (t, o) => { [N.la4, N.do5, N.mi5].forEach((f, i) => o.nota(f, t + i * 0.18, 0.06)); },
      entrega: (t, v, o) => {
        const frase = [[N.mi5, 0], [N.sol5, 0.24], [N.la5, 0.48], [N.sol5, 0.84], [N.mi5, 1.08], [N.re5, 1.32], [N.mi5, 1.68], [N.la4, 2.04], [N.la5, 2.5]];
        frase.forEach(([f, d]) => cajita(f, t + 0.2 + d, 0.07 * v, 1.6)); cajita(N.la4, t + 2.5, 0.05 * v, 2.5); cajita(N.do6, t + 2.5, 0.04 * v, 2.5);
      } },
    { id: 5, nombre: 'Ritual y misterio', desc: 'Oscuro y envolvente: tambor grave como un latido, gong profundo y susurros. Menos dulce, más misterioso.',
      nota: (f, t, v, d) => { tambor(t, f * 0.35, f * 0.17, 0.45, v * 2); voz(f * 0.5, t + 0.02, d || 2.4, v * 0.8, CUENCO, 0.03); },
      grave: (f, t, v, d) => voz(f * 0.5, t, d || 6, v * 1.3, GONG, 0.04),
      flap: (t, v) => roce(t, azar(0.04, 0.08), azar(900, 1700), azar(500, 900), v * 0.9, 0.8, 0.15),
      swish: (t) => soplo(t, 0.45, 2500, 900, 0.05, 0.4),
      intro: (t, o) => { o.grave(N.la3, t, 0.12, 7); tambor(t + 0.9, 90, 45, 0.5, 0.1); },
      entrega: (t, v, o) => {
        tambor(t, 85, 42, 0.55, 0.16 * v); tambor(t + 0.5, 85, 42, 0.55, 0.12 * v);
        soplo(t + 0.3, 2.4, 3000, 700, 0.045 * v, 0.6); o.grave(N.la3, t + 1.0, 0.1 * v, 8);
        voz(N.mi5, t + 2.4, 5, 0.04 * v, CAMPANA, 0.01, 0.9); voz(N.la5, t + 2.7, 5, 0.03 * v, CAMPANA, 0.01, 0.9);
      } }
  ];

  /* ---------- acciones de la lectura, iguales para todas las opciones ---------- */
  const ACC = {
    encender: (o, t) => o.intro(t, o),
    tema: (o, t) => o.nota(N.mi6, t, 0.04, 0.6),
    mazo: (o, t) => { for (let i = 0; i < 6; i++) o.flap(t + i * 0.05, 0.05); o.grave(N.la3, t + 0.1, 0.08, 3); },
    tirada: (o, t) => o.nota(N.re5, t, 0.055, 1.6),
    barajar: (o, t) => { for (let i = 0; i < 18; i++) o.flap(t + i * 0.052 + azar(0, 0.014), 0.055 * (1 - i * 0.025)); o.grave(N.la2, t + 0.95, 0.06, 1.5); },
    repartir: (o, t) => { for (let i = 0; i < 12; i++) o.flap(t + i * 0.035, 0.04); o.swish(t); o.nota(N.mi6, t + 0.4, 0.04, 1.8); o.nota(N.sol5, t + 0.48, 0.04, 1.8); },
    elegir1: (o, t) => o.nota(N.mi5, t, 0.07, 1.6),
    elegir2: (o, t) => o.nota(N.sol5, t, 0.07, 1.6),
    elegir3: (o, t) => o.nota(N.la5, t, 0.07, 1.6),
    soltar: (o, t) => o.nota(N.re5, t, 0.035, 0.5),
    confirmar: (o, t) => { o.grave(N.la3, t, 0.12, 5); o.nota(N.mi4 * 2, t + 0.15, 0.05, 3); },
    revelar1: (o, t) => { o.swish(t); o.nota(N.la4, t + 0.4, 0.085, 2.4); },
    revelar2: (o, t) => { o.swish(t); o.nota(N.re5, t + 0.4, 0.085, 2.4); },
    revelar3: (o, t) => { o.swish(t); o.nota(N.sol5, t + 0.4, 0.085, 2.4); },
    entrega: (o, t) => o.entrega(t, 1, o),
    entregaSuave: (o, t) => o.entrega(t, 0.6, o),
    negado: (o, t) => voz(196, t, 0.35, 0.06, [[1, 1, 1], [1.5, 0.3, 0.6]], 0.004, 0.25),
    guardar: (o, t) => { o.nota(N.mi5, t, 0.06, 1.4); o.nota(N.la5, t + 0.13, 0.06, 2); }
  };

  const CLAVE = 'arcana.sonido.estilo';
  let actual = 1;
  try { const v = Number(localStorage.getItem(CLAVE)); if (v >= 1 && v <= OPCIONES.length) actual = v; } catch (e) { /* sin almacenamiento */ }
  function sonar(acc) {
    try {
      iniciar();
      const toca = () => { try { ACC[acc](OPCIONES[actual - 1], ctx.currentTime + 0.02); } catch (e) { /* sin audio */ } };
      if (ctx.state === 'running') toca(); else ctx.resume().then(toca).catch(() => { /* el sistema no lo permitió */ }); // en iPhone el audio nace en pausa hasta que se reanuda
    } catch (e) { /* sin audio: la lectura sigue igual */ }
  }
  window.ArcanaSonido = {
    estilos: OPCIONES.map((o) => ({ id: o.id, nombre: o.nombre, desc: o.desc })),
    actual: () => actual,
    poner(id) { if (id >= 1 && id <= OPCIONES.length) { actual = id; try { localStorage.setItem(CLAVE, String(id)); } catch (e) { /* sigue igual */ } } },
    sonar,
    suspender() { if (mudo) mudo.pause(); if (ctx && ctx.state === 'running') ctx.suspend(); },
    reanudar() { if (mudo) { const p = mudo.play(); if (p && p.catch) p.catch(() => {}); } if (ctx && ctx.state !== 'running') ctx.resume(); }
  };
})();
