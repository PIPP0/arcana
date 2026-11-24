/* ARCANA — conexión opcional con la nube (Firebase).
   Sin configuración (nube-config.js en null) no hace nada y el sitio no pide ni un archivo extra.
   Con configuración, carga Firebase en segundo plano, ya con la página lista, para no frenar nada.
   Mide solo pasos y elecciones, nunca la pregunta ni las notas. Respeta «no rastrear». */
(function () {
  'use strict';
  const cfg = window.ARCANA_NUBE || null;
  const VERSION = '10.12.2';
  const BASE = `https://www.gstatic.com/firebasejs/${VERSION}/`;
  const DEF = { cobros: true, cobrosAbiertos: false, cartaDelDia: true, desfile: true, planes: true, cuentas: true, medicion: true,
    mazos: { rws: true, dodal: true, sola: true }, aviso: { activo: false, texto: '' } };
  const CACHE = 'arcana.func.v1', CACHE_P = 'arcana.perf.v1';
  /* Perfiles: lo que cada uno incluye. null en un tope = sin límite. El admin lo cambia en config/perfiles. */
  const T3 = { una: true, tiempo: true, perspectivas: true };
  const PERF_DEF = {
    invitado: { precio: '', periodo: '', sonido: true, estilos: { 1: true, 2: false, 3: false, 4: false, 5: false }, calendario: false, tiradas: { una: true, tiempo: false, perspectivas: false }, mazos: { rws: true, dodal: false, sola: false }, temaLibre: false, diario: false, lecturasDia: 3, guardadas: 0, recuperarDias: 0 },
    free: { precio: 'Gratis', periodo: 'Disponible hoy', sonido: true, calendario: true, estilos: { 1: true, 2: false, 3: false, 4: false, 5: false }, tiradas: { una: true, tiempo: true, perspectivas: false }, mazos: { rws: true, dodal: true, sola: false }, temaLibre: false, diario: true, lecturasDia: 5, guardadas: 10, recuperarDias: 0 },
    full: { precio: '$3.990', periodo: 'al mes', sonido: true, calendario: true, estilos: { 1: true, 2: true, 3: true, 4: false, 5: false }, tiradas: Object.assign({}, T3), mazos: { rws: true, dodal: true, sola: true }, temaLibre: true, diario: true, lecturasDia: 15, guardadas: 100, recuperarDias: 1 },
    premium: { precio: '$6.990', periodo: 'al mes', sonido: true, calendario: true, estilos: { 1: true, 2: true, 3: true, 4: true, 5: true }, tiradas: Object.assign({}, T3), mazos: { rws: true, dodal: true, sola: true }, temaLibre: true, diario: true, lecturasDia: null, guardadas: null, recuperarDias: null }
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
  let miPerfil = 'invitado';
  let usuario = null, ficha = null;
  /* Se recuerda quién era la última cuenta y su plan, para pintar la página ya con su plan al abrirla (Firebase tarda ~1 s en confirmar la sesión).
     Es solo para la pantalla: lo que se puede hacer de verdad lo siguen decidiendo las reglas del servidor. */
  const CUENTA_K = 'arcana.cuenta.v1';
  let cuentaCache = null;
  try { cuentaCache = JSON.parse(localStorage.getItem(CUENTA_K) || 'null'); } catch (e) { /* sin almacenamiento */ }
  if (cuentaCache && cuentaCache.uid && cuentaCache.usuario && cuentaCache.usuario.uid === cuentaCache.uid && PERFILES.includes(cuentaCache.perfil)) { miPerfil = cuentaCache.perfil; usuario = cuentaCache.usuario; } else cuentaCache = null;
  const guardarCuenta = () => { try { if (usuario && miPerfil !== 'invitado') localStorage.setItem(CUENTA_K, JSON.stringify({ uid: usuario.uid, perfil: miPerfil, usuario })); } catch (e) { /* idem */ } };
  const olvidarCuenta = () => { cuentaCache = null; try { localStorage.removeItem(CUENTA_K); } catch (e) { /* idem */ } };
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
  const ses = { sid: aleatorio(20), v: idVisitante(), uid: null, dia: hoyChile(), disp: disp(), vistas: {}, lecturas: 0, cartaHoy: false, creada: false };
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
      const yo = c.auth.currentUser; if (yo && !yo.isAnonymous) d.uid = yo.uid; // solo con sesión iniciada: la visita se asocia a la cuenta
      ['mazo', 'tema', 'tirada'].forEach((k) => { if (ses[k]) d[k] = ses[k]; });
      if (ses.sinUid) delete d.uid;
      const escribir = async () => { if (!ses.creada) { d.inicio = fs.serverTimestamp(); await fs.setDoc(ref, d); ses.creada = true; } else { await fs.updateDoc(ref, d); } };
      try { await escribir(); }
      catch (e1) {
        // si las reglas aún no aceptan el campo uid, se vuelve a medir sin él (anónimo) en vez de perder la visita
        if (d.uid) { ses.sinUid = true; delete d.uid; await escribir(); } else throw e1;
      }
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
      usuario = u && !u.isAnonymous && u.email ? { uid: u.uid, nombre: u.displayName || '', email: u.email, proveedor: (u.providerData && u.providerData[0] && u.providerData[0].providerId === 'password') ? 'correo' : 'google' } : null;
      if (!usuario) ficha = null;
      if (usuario && cuentaCache && cuentaCache.uid !== usuario.uid) { miPerfil = 'invitado'; olvidarCuenta(); } // entró otra cuenta: no se usa el plan recordado
      if (!usuario) olvidarCuenta();
      avisarU();
      if (usuario) { if (miPerfil === 'invitado') { miPerfil = 'free'; avisarF(); } tocarPersona(u, c, false); leerPerfil(u, c); } else if (miPerfil !== 'invitado') { miPerfil = 'invitado'; avisarF(); }
    });
  }
  async function leerPerfil(u, c) {
    try {
      const s = await c.fs.getDoc(c.fs.doc(c.db, 'personas', u.uid));
      const p = s.exists() && PERFILES.includes(s.data().perfil) ? s.data().perfil : 'free';
      if (s.exists()) { const d = s.data(); ficha = { nombre: d.nombre || '', avatar: d.avatar || null, hoy: d.hoy && typeof d.hoy === 'object' ? d.hoy : null, cal: d.cal && typeof d.cal === 'object' ? d.cal : {}, mazoHoy: typeof d.mazoHoy === 'string' ? d.mazoHoy : '', vistas: Array.isArray(d.vistas) ? d.vistas : [], recup: d.recup && typeof d.recup === 'object' ? d.recup : null, porPago: d.porPago === true, accesos: d.accesos || 0, creado: d.creado && d.creado.toDate ? d.creado.toDate() : null }; avisarU(); }
      if (p !== miPerfil) { miPerfil = p; avisarF(); }
      guardarCuenta();
    } catch (e) { /* sin ficha o sin red: se queda con el plan recordado (o Free) */ }
  }

  const N = window.Nube = {
    activa: !!cfg,
    funciones: () => F,
    usuario: () => usuario,
    ficha: () => ficha,
    perfil: () => (cfg ? miPerfil : 'premium'),
    todosPerfiles: () => PF,
    /* Lo que el perfil de esta persona incluye. Sin nube conectada (desarrollo local) se ve todo. */
    permisos: () => (cfg ? PF[miPerfil] : PERF_DEF.premium),
    alCambiarFunciones(f) { oyentesF.push(f); f(F); },
    alCambiarUsuario(f) { oyentesU.push(f); },
    vista(id) { if (!midiendo()) return; ses.vistas[id] = (ses.vistas[id] || 0) + 1; marcar(); },
    eleccion(o) { if (!midiendo()) return; Object.assign(ses, { mazo: ['rws', 'dodal', 'sola'].includes(o.mazo) ? o.mazo : ses.mazo, /* las reglas solo aceptan los tres mazos clásicos */ tema: o.tema || ses.tema, tirada: o.tirada || ses.tirada }); marcar(); },
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
    pagosActivos: () => !!window.ARCANA_PAGOS,
    cobrosEnPausa: () => F.cobros === false,
    /* Los cobros reales se abren a mano desde el admin (Funciones). Mientras estén cerrados, «Suscribirme» solo anota el interés. */
    cobrosAbiertos: () => F.cobrosAbiertos === true,
    /* Pide al servidor de pagos el enlace de Mercado Pago para el plan elegido. Devuelve la dirección a la que ir a pagar. */
    async suscribir(tier) {
      const base = window.ARCANA_PAGOS; if (!base) throw new Error('pagos-no-disponibles');
      const c = await conectar(); const u = c && c.auth.currentUser; if (!u || u.isAnonymous) throw new Error('sin-sesion');
      const r = await fetch(base.replace(/\/$/, '') + '/crear-suscripcion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier, idToken: await u.getIdToken() }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.init_point) throw new Error(d.error || 'error-pago');
      return d.init_point;
    },
    async cancelarSuscripcion() {
      const base = window.ARCANA_PAGOS; if (!base) throw new Error('pagos-no-disponibles');
      const c = await conectar(); const u = c && c.auth.currentUser; if (!u || u.isAnonymous) throw new Error('sin-sesion');
      const r = await fetch(base.replace(/\/$/, '') + '/cancelar-suscripcion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: await u.getIdToken() }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'error-cancelar');
      await leerPerfil(u, c);
    },
    /* Pregunta al servidor de pagos si el pago ya quedó aprobado (por si el aviso de Mercado Pago no llegó). */
    async sincronizarPago() {
      const base = window.ARCANA_PAGOS; if (!base) return;
      const c = await conectar(); const u = c && c.auth.currentUser; if (!u || u.isAnonymous) return;
      try { await fetch(base.replace(/\/$/, '') + '/sincronizar-suscripcion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: await u.getIdToken() }) }); } catch (e) { /* se reintenta */ }
    },
    /* Vuelve a leer el plan de la cuenta (después de pagar, el servidor lo cambia unos segundos más tarde). */
    async refrescarPerfil() { const c = await conectar(); const u = c && c.auth.currentUser; if (u && !u.isAnonymous) await leerPerfil(u, c); return miPerfil; },
    async guardarFicha(cambios) {
      const c = await conectar(); const u = c && c.auth.currentUser; if (!u || u.isAnonymous) throw new Error('sin-sesion');
      const datos = {};
      if ('nombre' in cambios) datos.nombre = String(cambios.nombre || '').slice(0, 80);
      if ('avatar' in cambios) datos.avatar = cambios.avatar ? cambios.avatar : c.fs.deleteField();
      if ('hoy' in cambios && cambios.hoy) datos.hoy = { dia: String(cambios.hoy.dia), carta: Number(cambios.hoy.carta) };
      // calendario de la carta del día, mazo elegido, cartas vistas y días recuperados: se guardan en la cuenta para verlos igual en todos los dispositivos
      if ('cal' in cambios && cambios.cal) Object.keys(cambios.cal).forEach((f) => { const v = cambios.cal[f]; if (/^\d{4}-\d{2}-\d{2}$/.test(f) && Number.isInteger(v) && v >= 0 && v <= 77) datos['cal.' + f] = v; });
      if ('mazoHoy' in cambios) datos.mazoHoy = cambios.mazoHoy ? String(cambios.mazoHoy).slice(0, 20) : c.fs.deleteField();
      if ('vistas' in cambios && Array.isArray(cambios.vistas)) datos.vistas = cambios.vistas.filter((x) => Number.isInteger(x) && x >= 0 && x <= 77).slice(0, 78);
      if ('recup' in cambios && cambios.recup && typeof cambios.recup.sem === 'string') datos.recup = { sem: cambios.recup.sem.slice(0, 10), dias: Object.assign({}, cambios.recup.dias || {}) };
      await c.fs.updateDoc(c.fs.doc(c.db, 'personas', u.uid), datos);
      const nuevaCal = 'cal' in cambios && cambios.cal ? { cal: Object.assign({}, (ficha && ficha.cal) || {}, cambios.cal) } : {};
      ficha = Object.assign({}, ficha || {}, nuevaCal, 'mazoHoy' in cambios ? { mazoHoy: cambios.mazoHoy || '' } : {}, 'vistas' in cambios && Array.isArray(cambios.vistas) ? { vistas: datos.vistas } : {}, 'recup' in cambios && datos.recup ? { recup: datos.recup } : {}, 'nombre' in cambios ? { nombre: datos.nombre } : {}, 'avatar' in cambios ? { avatar: cambios.avatar || null } : {}, 'hoy' in cambios && cambios.hoy ? { hoy: datos.hoy } : {});
      avisarU();
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
