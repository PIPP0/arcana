/* ARCANA — conexión opcional con la nube (Firebase).
   Sin configuración (nube-config.js en null) no hace nada y el sitio no pide ni un archivo extra.
   Con configuración, carga Firebase en segundo plano, ya con la página lista, para no frenar nada.
   Mide solo pasos y elecciones, nunca la pregunta ni las notas. Respeta «no rastrear». */
(function () {
  'use strict';
  const cfg = window.ARCANA_NUBE || null;
  const VERSION = '10.12.2';
  const BASE = `https://www.gstatic.com/firebasejs/${VERSION}/`;
  const DEF = { cartaDelDia: true, desfile: true, planes: true, cuentas: true, medicion: true,
    mazos: { rws: true, dodal: true, sola: true }, aviso: { activo: false, texto: '' } };
  const CACHE = 'arcana.func.v1', CACHE_P = 'arcana.perf.v1';
  /* Perfiles: lo que cada uno incluye. null en un tope = sin límite. El admin lo cambia en config/perfiles. */
  const T3 = { una: true, tiempo: true, perspectivas: true };
  const PERF_DEF = {
    free: { tiradas: { una: true, tiempo: true, perspectivas: false }, mazos: { rws: true, dodal: true, sola: false }, temaLibre: false, diario: true, lecturasDia: 5, guardadas: 10 },
    full: { tiradas: Object.assign({}, T3), mazos: { rws: true, dodal: true, sola: true }, temaLibre: true, diario: true, lecturasDia: 15, guardadas: 100 },
    premium: { tiradas: Object.assign({}, T3), mazos: { rws: true, dodal: true, sola: true }, temaLibre: true, diario: true, lecturasDia: null, guardadas: null }
  };
  const PERFILES = ['free', 'full', 'premium'];

  const esObj = (x) => x && typeof x === 'object' && !Array.isArray(x);
  const clonar = (o) => (esObj(o) ? Object.keys(o).reduce((r, k) => { r[k] = clonar(o[k]); return r; }, {}) : o);
  const mezclar = (a, b) => {
    const o = clonar(a);
    Object.keys(b || {}).forEach((k) => { o[k] = esObj(b[k]) ? mezclar(o[k] || {}, b[k]) : b[k]; });
    return o;
  };
  let guardado = null;
  try { guardado = JSON.parse(localStorage.getItem(CACHE)); } catch (e) { /* sin almacenamiento */ }
  let F = mezclar(DEF, guardado);
  let guardadoP = null;
  try { guardadoP = JSON.parse(localStorage.getItem(CACHE_P)); } catch (e) { /* sin almacenamiento */ }
  let PF = mezclar(PERF_DEF, guardadoP);
  let miPerfil = 'free';
  let usuario = null;
  const oyentesF = [], oyentesU = [];
  const aleatorio = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, (x) => 'abcdefghijklmnopqrstuvwxyz0123456789'[x % 36]).join(''); };
  const hoyChile = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());
  const noRastrear = () => navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  const disp = () => (matchMedia('(max-width: 719px)').matches ? 'movil' : 'escritorio');
  function idVisitante() {
    try {
      let v = localStorage.getItem('arcana.v');
      if (!v) { v = aleatorio(20); localStorage.setItem('arcana.v', v); }
      return v;
    } catch (e) { return aleatorio(20); }
  }
  const midiendo = () => !!cfg && F.medicion !== false && !noRastrear();

  /* ---------- carga de Firebase (una sola vez, en segundo plano) ---------- */
  let conexion = null;
  function conectar() {
    if (!cfg) return Promise.resolve(null);
    if (!conexion) {
      conexion = Promise.all([import(BASE + 'firebase-app.js'), import(BASE + 'firebase-auth.js'), import(BASE + 'firebase-firestore-lite.js')])
        .then(([app, au, fs]) => {
          const a = app.initializeApp(cfg);
          return { au, fs, auth: au.getAuth(a), db: fs.getFirestore(a) };
        }).catch(() => null);
    }
    return conexion;
  }
  async function anonimo(c) {
    if (c.auth.authStateReady) await c.auth.authStateReady();
    if (!c.auth.currentUser) await c.au.signInAnonymously(c.auth);
  }

  /* ---------- interruptores del sitio ---------- */
  function avisarF() { oyentesF.forEach((f) => { try { f(F); } catch (e) { /* un oyente no frena a los otros */ } }); }
  let resolverF; const listoF = new Promise((r) => { resolverF = r; });
  async function leerFunciones() {
    const c = await conectar();
    if (!c) { resolverF(); return; }
    try {
      const s = await c.fs.getDoc(c.fs.doc(c.db, 'config', 'funciones'));
      if (s.exists()) {
        const d = s.data(); delete d.actualizado; delete d.por;
        F = mezclar(DEF, d);
        try { localStorage.setItem(CACHE, JSON.stringify(d)); } catch (e) { /* sigue igual */ }
        avisarF();
      }
    } catch (e) { /* sin permiso o sin red: se usan los valores guardados */ }
    try {
      const p = await c.fs.getDoc(c.fs.doc(c.db, 'config', 'perfiles'));
      if (p.exists()) {
        const d = p.data(); delete d.actualizado; delete d.por;
        PF = mezclar(PERF_DEF, d);
        try { localStorage.setItem(CACHE_P, JSON.stringify(d)); } catch (e) { /* sigue igual */ }
        avisarF();
      }
    } catch (e) { /* idem */ }
    resolverF();
  }

  /* ---------- medición anónima ---------- */
  const ses = { sid: aleatorio(20), v: idVisitante(), dia: hoyChile(), disp: disp(), vistas: {}, lecturas: 0, cartaHoy: false, creada: false };
  let sucia = false, reloj = null;
  function marcar() { sucia = true; if (!reloj) reloj = setTimeout(volcar, 7000); }
  async function volcar() {
    reloj = null;
    if (!sucia || !midiendo()) return;
    sucia = false;
    const c = await conectar(); if (!c) return;
    try {
      await anonimo(c);
      const { fs } = c, ref = fs.doc(c.db, 'sesiones', ses.sid);
      const d = { anon: ses.v, dia: ses.dia, disp: ses.disp, vistas: ses.vistas, lecturas: ses.lecturas, cartaHoy: ses.cartaHoy, ultima: fs.serverTimestamp() };
      ['mazo', 'tema', 'tirada'].forEach((k) => { if (ses[k]) d[k] = ses[k]; });
      if (!ses.creada) { d.inicio = fs.serverTimestamp(); await fs.setDoc(ref, d); ses.creada = true; } else { await fs.updateDoc(ref, d); }
    } catch (e) { sucia = true; }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && sucia) volcar(); });

  /* ---------- cuentas (opcional) ---------- */
  async function tocarPersona(u, c, forzar) {
    const dia = hoyChile();
    try { if (!forzar && localStorage.getItem('arcana.acceso') === u.uid + dia) return; } catch (e) { /* sigue */ }
    const { fs } = c, ref = fs.doc(c.db, 'personas', u.uid);
    try {
      const s = await fs.getDoc(ref);
      if (s.exists()) await fs.updateDoc(ref, { ultimoAcceso: fs.serverTimestamp(), accesos: (s.data().accesos || 0) + 1 });
      else await fs.setDoc(ref, { nombre: (u.displayName || '').slice(0, 80), email: (u.email || '').toLowerCase(), creado: fs.serverTimestamp(), ultimoAcceso: fs.serverTimestamp(), accesos: 1 });
      try { localStorage.setItem('arcana.acceso', u.uid + dia); } catch (e) { /* sigue */ }
    } catch (e) { /* el sitio sigue funcionando sin la ficha */ }
  }
  function avisarU() { oyentesU.forEach((f) => { try { f(usuario); } catch (e) { /* idem */ } }); }
  async function vigilarSesion() {
    const c = await conectar(); if (!c) return;
    c.au.onAuthStateChanged(c.auth, (u) => {
      usuario = u && !u.isAnonymous && u.email ? { uid: u.uid, nombre: u.displayName || '', email: u.email } : null;
      avisarU();
      if (usuario) { tocarPersona(u, c, false); leerPerfil(u, c); } else if (miPerfil !== 'free') { miPerfil = 'free'; avisarF(); }
    });
  }
  async function leerPerfil(u, c) {
    try {
      const s = await c.fs.getDoc(c.fs.doc(c.db, 'personas', u.uid));
      const p = s.exists() && PERFILES.includes(s.data().perfil) ? s.data().perfil : 'free';
      if (p !== miPerfil) { miPerfil = p; avisarF(); }
    } catch (e) { /* sin ficha o sin red: se queda en Free */ }
  }

  const N = window.Nube = {
    activa: !!cfg,
    funciones: () => F,
    usuario: () => usuario,
    perfil: () => (cfg ? miPerfil : 'premium'),
    /* Lo que el perfil de esta persona incluye. Sin nube conectada (desarrollo local) se ve todo. */
    permisos: () => (cfg ? PF[miPerfil] : PERF_DEF.premium),
    alCambiarFunciones(f) { oyentesF.push(f); f(F); },
    alCambiarUsuario(f) { oyentesU.push(f); },
    vista(id) { if (!midiendo()) return; ses.vistas[id] = (ses.vistas[id] || 0) + 1; marcar(); },
    eleccion(o) { if (!midiendo()) return; Object.assign(ses, { mazo: o.mazo || ses.mazo, tema: o.tema || ses.tema, tirada: o.tirada || ses.tirada }); marcar(); },
    cartaHoy() { if (!midiendo()) return; ses.cartaHoy = true; marcar(); },
    async lectura(o) {
      if (!cfg) return;
      await listoF;
      if (!midiendo()) return;
      ses.lecturas += 1; ses.mazo = o.mazo; ses.tema = o.tema; ses.tirada = o.tirada; marcar();
      const c = await conectar(); if (!c) return;
      try {
        await anonimo(c);
        await c.fs.addDoc(c.fs.collection(c.db, 'lecturas'), { anon: ses.v, dia: hoyChile(), fecha: c.fs.serverTimestamp(), mazo: o.mazo, tema: o.tema, tirada: o.tirada, cartas: o.cartas.slice(0, 3), pregunta: !!o.pregunta, disp: ses.disp });
      } catch (e) { /* una lectura sin registrar no afecta a quien lee */ }
    },
    async entrar() {
      const c = await conectar(); if (!c) throw new Error('sin-nube');
      const r = await c.au.signInWithPopup(c.auth, new c.au.GoogleAuthProvider());
      await tocarPersona(r.user, c, true);
    },
    async entrarConCorreo(correo, clave) {
      const c = await conectar(); if (!c) throw new Error('sin-nube');
      const r = await c.au.signInWithEmailAndPassword(c.auth, correo, clave);
      await tocarPersona(r.user, c, true);
    },
    async crearCuenta(correo, clave, nombre) {
      const c = await conectar(); if (!c) throw new Error('sin-nube');
      const r = await c.au.createUserWithEmailAndPassword(c.auth, correo, clave);
      if (nombre) { try { await c.au.updateProfile(r.user, { displayName: nombre.slice(0, 80) }); } catch (e) { /* el nombre es opcional */ } }
      try { await c.au.sendEmailVerification(r.user); } catch (e) { /* se puede reenviar después */ }
      await tocarPersona(r.user, c, true);
    },
    async recuperarClave(correo) {
      const c = await conectar(); if (!c) throw new Error('sin-nube');
      await c.au.sendPasswordResetEmail(c.auth, correo);
    },
    async salir() { const c = await conectar(); if (c) await c.au.signOut(c.auth); },
    async borrarMiFicha() {
      const c = await conectar(); const u = c && c.auth.currentUser; if (!u || u.isAnonymous) return;
      await c.fs.deleteDoc(c.fs.doc(c.db, 'personas', u.uid));
    }
  };

  if (cfg) {
    const iniciar = () => { leerFunciones(); vigilarSesion(); };
    const tarde = () => setTimeout(iniciar, 900);
    if (document.readyState === 'complete') tarde(); else window.addEventListener('load', tarde, { once: true });
  }
})();
