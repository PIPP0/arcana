/* ARCANA — panel de administración.
   Solo lee lo que el sitio mide de forma anónima y las fichas de quienes entraron con Google.
   Nunca hay preguntas ni notas de nadie. Entra únicamente un correo verificado de config/admin. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const NUBE = window.ARCANA_NUBE || null;
  const CARTAS = (window.ARCANA_DATA && window.ARCANA_DATA.CARTAS) || [];
  const BASE = 'https://www.gstatic.com/firebasejs/10.12.2/';

  const MAZOS = { rws: 'Rider-Waite-Smith', dodal: 'Tarot de Marsella', sola: 'Sola-Busca' };
  const TEMAS = { general: 'Reflexión general', amor: 'Amor y relaciones', trabajo: 'Trabajo y proyectos', crecimiento: 'Crecimiento personal', decisiones: 'Decisiones', libre: 'Pregunta libre' };
  const TIRADAS = { una: 'Una carta', tiempo: 'Tres cartas', perspectivas: 'Tres perspectivas' };
  const PASOS = [['inicio', 'Portada'], ['mazo', 'Elige mazo'], ['intencion', 'Elige tema'], ['tirada', 'Elige tirada'], ['barajar', 'Baraja'], ['elegir', 'Elige cartas'], ['lectura', 'Revela']];
  const DEF = { cobros: true, cartaDelDia: true, desfile: true, planes: true, cuentas: true, medicion: true, mazos: { rws: true, dodal: true, sola: true }, aviso: { activo: false, texto: '' } };
  const T3 = { una: true, tiempo: true, perspectivas: true };
  const PERF_DEF = {
    invitado: { precio: '', periodo: '', sonido: true, estilos: { 1: true, 2: false, 3: false, 4: false, 5: false }, calendario: false, tiradas: { una: true, tiempo: false, perspectivas: false }, mazos: { rws: true, dodal: false, sola: false }, temaLibre: false, diario: false, lecturasDia: 3, guardadas: 0, recuperarDias: 0 },
    free: { precio: 'Gratis', periodo: 'Disponible hoy', sonido: true, calendario: true, estilos: { 1: true, 2: false, 3: false, 4: false, 5: false }, tiradas: { una: true, tiempo: true, perspectivas: false }, mazos: { rws: true, dodal: true, sola: false }, temaLibre: false, diario: true, lecturasDia: 5, guardadas: 10, recuperarDias: 0 },
    full: { precio: '$3.990', periodo: 'al mes', sonido: true, calendario: true, estilos: { 1: true, 2: true, 3: true, 4: false, 5: false }, tiradas: Object.assign({}, T3), mazos: { rws: true, dodal: true, sola: true }, temaLibre: true, diario: true, lecturasDia: 15, guardadas: 100, recuperarDias: 1 },
    premium: { precio: '$6.990', periodo: 'al mes', sonido: true, calendario: true, estilos: { 1: true, 2: true, 3: true, 4: true, 5: true }, tiradas: Object.assign({}, T3), mazos: { rws: true, dodal: true, sola: true }, temaLibre: true, diario: true, lecturasDia: null, guardadas: null, recuperarDias: null }
  };
  const ESTILOS_SONIDO = [[1, 'Cristal y campanas'], [2, 'Cuenco tibetano y aliento'], [3, 'Arpa celestial'], [4, 'Cajita de música'], [5, 'Ritual y misterio']];
  const PERFILES = [['free', 'Free'], ['full', 'Full'], ['premium', 'Premium']];
  const PERFILES_TODOS = [['invitado', 'Invitado (sin sesión)']].concat(PERFILES);
  const esObj = (x) => x && typeof x === 'object' && !Array.isArray(x) && !(x instanceof Date);
  const clonar = (o) => (esObj(o) ? Object.keys(o).reduce((r, k) => { r[k] = clonar(o[k]); return r; }, {}) : o);
  const mezclar = (a, b) => { const o = clonar(a); Object.keys(b || {}).forEach((k) => { o[k] = esObj(b[k]) ? mezclar(o[k] || {}, b[k]) : b[k]; }); return o; };

  const fHora = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
  const fFecha = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', day: 'numeric', month: 'short', year: 'numeric' });
  const fDia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' });
  const hora = (d) => (d ? fHora.format(d) : '—');
  const fecha = (d) => (d ? fFecha.format(d) : '—');
  const n0 = (n) => new Intl.NumberFormat('es-CL').format(Math.round(n));
  const pct = (a, b) => (b ? Math.round((a * 1000) / b) / 10 : 0) + ' %';
  const nombreCarta = (i) => (CARTAS[i] ? CARTAS[i].nombre : 'Carta ' + i);
  const pad = (i) => String(i).padStart(2, '0');

  let aTimer;
  function aviso(t) { const el = $('#aviso'); el.textContent = t; el.classList.add('ver'); clearTimeout(aTimer); aTimer = setTimeout(() => el.classList.remove('ver'), 2800); }

  /* ================= acceso a los datos ================= */
  let D = null; // adaptador: firebase o prueba (solo en localhost)

  async function adaptadorFirebase() {
    const [app, au, fs] = await Promise.all([import(BASE + 'firebase-app.js'), import(BASE + 'firebase-auth.js'), import(BASE + 'firebase-firestore.js')]);
    const a = app.initializeApp(NUBE), auth = au.getAuth(a), db = fs.getFirestore(a);
    const lee = (d) => (d && d.toDate ? d.toDate() : null);
    return {
      modo: 'Nube real', proyecto: NUBE.projectId || '',
      alSesion(cb) { au.onAuthStateChanged(auth, (u) => cb(u && !u.isAnonymous && u.email ? { email: u.email.toLowerCase(), nombre: u.displayName || '' } : null)); },
      entrar: () => au.signInWithPopup(auth, new au.GoogleAuthProvider()),
      salir: () => au.signOut(auth),
      async correosAdmin() {
        try { const s = await fs.getDoc(fs.doc(db, 'config', 'admin')); return s.exists() ? s.data().correos || [] : null; } catch (e) { return null; }
      },
      async cargar(desde) {
        let leidas = 0;
        const traer = async (col, extra) => { const s = await fs.getDocs(fs.query(fs.collection(db, col), ...extra)); leidas += s.size; return s.docs.map((x) => Object.assign({ id: x.id }, x.data())); };
        const [ses, lec, per] = await Promise.all([
          traer('sesiones', [fs.where('dia', '>=', desde), fs.orderBy('dia', 'desc'), fs.limit(2000)]),
          traer('lecturas', [fs.where('dia', '>=', desde), fs.orderBy('dia', 'desc'), fs.limit(2000)]),
          traer('personas', [fs.orderBy('ultimoAcceso', 'desc'), fs.limit(500)])
        ]);
        return {
          leidas,
          sesiones: ses.map((s) => Object.assign(s, { inicio: lee(s.inicio), ultima: lee(s.ultima) })),
          lecturas: lec.map((l) => Object.assign(l, { fecha: lee(l.fecha) })),
          personas: per.map((p) => Object.assign(p, { uid: p.id, creado: lee(p.creado), ultimoAcceso: lee(p.ultimoAcceso) })),
          topes: { sesiones: ses.length >= 2000, lecturas: lec.length >= 2000, personas: per.length >= 500 }
        };
      },
      async leerFunciones() { const s = await fs.getDoc(fs.doc(db, 'config', 'funciones')); if (!s.exists()) return null; const d = s.data(); return Object.assign({}, d, { actualizado: lee(d.actualizado) }); },
      async leerPerfiles() { const s = await fs.getDoc(fs.doc(db, 'config', 'perfiles')); if (!s.exists()) return null; const d = s.data(); return Object.assign({}, d, { actualizado: lee(d.actualizado) }); },
      guardarPerfiles(p, email) { return fs.setDoc(fs.doc(db, 'config', 'perfiles'), Object.assign({}, p, { actualizado: fs.serverTimestamp(), por: email })); },
      asignarPerfil(uid, perfil) { return fs.updateDoc(fs.doc(db, 'personas', uid), { perfil, porPago: false }); },
      guardarFunciones(f, email) { return fs.setDoc(fs.doc(db, 'config', 'funciones'), Object.assign({}, f, { actualizado: fs.serverTimestamp(), por: email })); },
      async contar() {
        const c = async (col) => (await fs.getCountFromServer(fs.collection(db, col))).data().count;
        return { sesiones: await c('sesiones'), lecturas: await c('lecturas'), personas: await c('personas') };
      }
    };
  }

  /* ================= estado ================= */
  const E = { usuario: null, seccion: 'resumen', rango: 14, datos: null, cargando: false, error: '', correos: null, funciones: null, edit: null, perfiles: null, editP: null, buscar: '', verAnon: true, fMazo: '', fTema: '', fTirada: '', fPregunta: '', mazoMapa: 'rws', gastoLecturas: 0, cuentas: null, abierto: null };

  /* ================= pantallas ================= */
  const app = $('#app');
  function puerta(html) { app.innerHTML = `<div class="puerta"><div class="caja"><span class="marca">ARCANA</span>${html}</div></div>`; }

  function pantallaSinNube() {
    puerta(`<h1>Falta conectar la nube</h1>
      <p>El panel necesita el proyecto de Firebase de ARCANA para mostrar datos reales. Mientras no esté conectado, no hay nada que mostrar, y no se inventan datos.</p>
      <ol><li>Crea el proyecto y sus servicios, siguiendo <code>nube/PASOS.md</code>.</li><li>Pega los datos de la app web en <code>nube-config.js</code>.</li><li>Recarga esta página.</li></ol>`);
  }
  function pantallaLogin(msg) {
    puerta(`<h1>Administración</h1><p>Entra con la cuenta de Google autorizada para ver el panel.</p>
      ${msg ? `<p style="color:var(--mal)">${esc(msg)}</p>` : ''}
      <div style="margin-top:22px"><button type="button" class="btn primario" id="entrar">Entrar con Google</button></div>`);
    $('#entrar').onclick = async () => { try { await D.entrar(); } catch (e) {
      const c = (e && e.code) || (e && e.message) || 'desconocido';
      const t = { 'auth/unauthorized-domain': 'Este sitio (pipp0.github.io) no está en «Dominios autorizados» de Authentication.',
        'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes para este sitio.',
        'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
        'auth/cancelled-popup-request': 'Se canceló la ventana de Google. Intenta de nuevo.',
        'auth/operation-not-allowed': 'El acceso con Google no está activado en Authentication.' }[c];
      pantallaLogin((t || 'No se pudo iniciar sesión.') + ' (código: ' + c + ')');
    } };
  }
  function pantallaSinAcceso() {
    puerta(`<h1>Sin acceso</h1><p>La cuenta <b>${esc(E.usuario.email)}</b> no está autorizada para abrir este panel.</p>
      <div style="margin-top:22px"><button type="button" class="btn" id="salir">Salir y probar con otra cuenta</button></div>`);
    $('#salir').onclick = () => D.salir();
  }

  const ICONOS = {
    resumen: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', personas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.3c2 .7 3.5 2.6 3.5 5.7"/>',
    lecturas: '<rect x="3" y="3" width="8" height="12" rx="1.5"/><rect x="13" y="9" width="8" height="12" rx="1.5"/>', mazos: '<path d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z"/>',
    funciones: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2.2"/><circle cx="8" cy="17" r="2.2"/>', perfiles: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.3 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>', sistema: '<path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z"/>'
  };
  const SECCIONES = [['resumen', 'Resumen'], ['personas', 'Personas'], ['lecturas', 'Lecturas'], ['mazos', 'Mazos y cartas'], ['funciones', 'Funciones'], ['perfiles', 'Perfiles'], ['sistema', 'Sistema']];

  function armar() {
    app.innerHTML = `<div class="shell">
      <aside class="lateral">
        <div><div class="marca">ARCANA</div><div class="sub">Administración</div><span class="modo">${esc(D.modo)}</span></div>
        <nav aria-label="Secciones">${SECCIONES.map(([id, t]) => `<button type="button" data-s="${id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[id === 'mazos' ? 'mazos' : id]}</svg>${t}</button>`).join('')}</nav>
        <div class="yo"><span>${esc(E.usuario.email)}</span><button type="button" class="btn chico" id="salir">Salir</button></div>
      </aside>
      <main id="contenido" tabindex="-1"></main></div>`;
    $$('[data-s]').forEach((b) => { b.onclick = () => ir(b.dataset.s); });
    $('#salir').onclick = () => D.salir();
    ir(E.seccion);
    recargar(false);
  }
  function ir(id) {
    E.seccion = id; E.abierto = null;
    $$('[data-s]').forEach((b) => { if (b.dataset.s === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    pintar();
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* sin historial */ }
  }
  async function recargar(avisar) {
    if (E.cargando) return;
    E.cargando = true; E.error = ''; pintar();
    try {
      const dias = listaDias(Math.max(E.rango, 30));
      const r = await D.cargar(dias[0]);
      E.datos = r; E.gastoLecturas += r.leidas || 0;
      if (!E.funciones) { try { E.funciones = await D.leerFunciones(); } catch (e) { E.funciones = null; } E.edit = mezclar(DEF, E.funciones || {}); delete E.edit.actualizado; delete E.edit.por; }
      if (!E.editP) { try { E.perfiles = await D.leerPerfiles(); } catch (e) { E.perfiles = null; } E.editP = perfEdit(E.perfiles); }
      if (!E.correos) E.correos = await D.correosAdmin();
      if (avisar) aviso('Datos actualizados.');
    } catch (e) { E.error = 'No se pudieron leer los datos. ' + (e && e.code ? '(' + e.code + ')' : ''); }
    E.cargando = false; pintar();
  }

  /* ================= cálculos ================= */
  function listaDias(n) {
    const out = []; for (let i = n - 1; i >= 0; i--) out.push(fDia.format(new Date(Date.now() - i * 864e5)));
    return Array.from(new Set(out));
  }
  function calc() {
    const dias = listaDias(E.rango), ini = dias[0];
    const ses = E.datos.sesiones.filter((s) => s.dia >= ini), lec = E.datos.lecturas.filter((l) => l.dia >= ini);
    const porDia = {}; dias.forEach((d) => { porDia[d] = { s: 0, l: 0 }; });
    ses.forEach((s) => { if (porDia[s.dia]) porDia[s.dia].s++; });
    lec.forEach((l) => { if (porDia[l.dia]) porDia[l.dia].l++; });
    const visit = new Set(ses.map((s) => s.anon)), vDias = {};
    ses.forEach((s) => { (vDias[s.anon] = vDias[s.anon] || new Set()).add(s.dia); });
    const volvieron = Object.keys(vDias).filter((k) => vDias[k].size > 1).length;
    const embudo = PASOS.map(([id, t]) => ({ id, t, n: ses.filter((s) => (s.vistas && s.vistas[id]) > 0).length }));
    embudo.push({ id: 'fin', t: 'Lectura completada', n: ses.filter((s) => s.lecturas > 0).length });
    const cuenta = (arr, k) => arr.reduce((o, x) => { o[x[k]] = (o[x[k]] || 0) + 1; return o; }, {});
    const cartas = new Array(78).fill(0); lec.forEach((l) => (l.cartas || []).forEach((c) => { if (c >= 0 && c < 78) cartas[c]++; }));
    return { dias, ses, lec, porDia, visit, volvieron, embudo, porMazo: cuenta(lec, 'mazo'), porTema: cuenta(lec, 'tema'), porTirada: cuenta(lec, 'tirada'), porDisp: cuenta(ses, 'disp'),
      cartas, hoy: ses.filter((s) => s.cartaHoy).length, conPregunta: lec.filter((l) => l.pregunta).length };
  }

  /* ================= vistas ================= */
  function cabeza(t, sub, extra) { return `<div class="cabeza"><div><h1>${t}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div class="controles">${extra || ''}</div></div>`; }
  function rangoCtl() {
    return `<div class="seg" role="group" aria-label="Período">${[7, 14, 30].map((n) => `<button type="button" data-r="${n}" aria-pressed="${E.rango === n}">${n} días</button>`).join('')}</div>
      <button type="button" class="btn chico" id="recargar">Actualizar</button>`;
  }
  function vacio(t, d) { return `<div class="vacio"><b>${t}</b>${d}</div>`; }
  function barras(obj, nombres, total, claves) {
    const ks = (claves || Object.keys(nombres)).slice().sort((a, b) => (obj[b] || 0) - (obj[a] || 0)), max = Math.max(1, ...ks.map((k) => obj[k] || 0));
    return `<ul class="barras">${ks.map((k) => `<li><span>${esc(nombres[k] || k)}</span><span class="b"><i style="width:${((obj[k] || 0) / max) * 100}%"></i></span><span class="v">${n0(obj[k] || 0)} · ${pct(obj[k] || 0, total)}</span></li>`).join('')}</ul>`;
  }

  function grafico(c) {
    const W = 760, H = 230, L = 38, R = 12, T = 14, B = 30, w = W - L - R, h = H - T - B, n = c.dias.length;
    const max = Math.max(4, ...c.dias.map((d) => c.porDia[d].s)), tope = Math.ceil(max / 4) * 4, bw = Math.min(30, (w / n) * 0.62);
    const x = (i) => L + (w / n) * (i + 0.5), y = (v) => T + h - (v / tope) * h;
    let s = `<svg class="grafico" viewBox="0 0 ${W} ${H}" role="img" aria-label="Visitas y lecturas por día">`;
    for (let g = 0; g <= 4; g++) { const v = (tope / 4) * g; s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(255,255,255,.08)"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; }
    const salto = n > 16 ? 3 : n > 9 ? 2 : 1;
    c.dias.forEach((d, i) => {
      const v = c.porDia[d];
      s += `<rect x="${x(i) - bw / 2}" y="${y(v.s)}" width="${bw}" height="${Math.max(0, T + h - y(v.s))}" rx="3" fill="#8fa3ff" opacity=".85"><title>${d}: ${v.s} visitas, ${v.l} lecturas</title></rect>`;
      if (i % salto === 0) s += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${d.slice(8)}/${d.slice(5, 7)}</text>`;
    });
    const pts = c.dias.map((d, i) => `${x(i)},${y(Math.min(tope, c.porDia[d].l))}`).join(' ');
    s += `<polyline points="${pts}" fill="none" stroke="#e2c17c" stroke-width="2.2" stroke-linejoin="round"/>`;
    c.dias.forEach((d, i) => { s += `<circle cx="${x(i)}" cy="${y(Math.min(tope, c.porDia[d].l))}" r="3.2" fill="#e2c17c"><title>${d}: ${c.porDia[d].l} lecturas</title></circle>`; });
    return s + '</svg>';
  }

  function vResumen() {
    const c = calc(), sesN = c.ses.length;
    const act = c.ses.filter((s) => s.lecturas > 0).length, ini = c.embudo[4].n;
    const pers = E.datos.personas.length;
    const kpi = (t, n, d) => `<div class="kpi"><div class="t">${t}</div><div class="n">${n}</div><div class="d">${d}</div></div>`;
    let h = cabeza('Resumen', `Últimos ${E.rango} días, hora de Chile. Todo es anónimo: no hay preguntas ni notas.`, rangoCtl());
    if (!sesN && !E.datos.personas.length) return h + `<div class="tarjeta">${vacio('Todavía no hay datos', 'Cuando alguien abra el sitio, aquí verás visitas, lecturas y recorridos. Si ya lo abriste, revisa que la medición esté encendida en Funciones y que tu navegador no pida «no rastrear».')}</div>`;
    h += `<div class="kpis">
      ${kpi('Visitas', n0(sesN), `${n0(c.visit.size)} personas distintas · <button type="button" class="enlace-s" data-ir-s="personas">Ver detalle →</button>`)}
      ${kpi('Lecturas completadas', n0(c.lec.length), `${pct(act, sesN)} de las visitas llegó hasta el final`)}
      ${kpi('Terminan lo que empiezan', ini ? pct(act, ini) : '—', `${n0(ini)} llegaron a barajar`)}
      ${kpi('Carta del día', n0(c.hoy), `${pct(c.hoy, sesN)} de las visitas la reveló`)}
      ${kpi('Volvieron', n0(c.volvieron), 'Visitaron en más de un día')}
      ${kpi('Con cuenta', n0(pers), 'Entraron con Google')}</div>`;
    h += `<div class="tarjeta"><h2>Visitas y lecturas por día</h2>${grafico(c)}<div class="leyenda"><span><i style="background:#8fa3ff"></i>Visitas</span><span><i style="background:#e2c17c"></i>Lecturas completadas</span></div></div>`;
    const m = Math.max(1, c.embudo[0].n);
    h += `<div class="tarjeta"><h2>Dónde se quedan</h2><p class="nota">Visitas que llegaron a cada paso. Donde más baja, ahí se pierde gente.</p><ul class="embudo">${c.embudo.map((e, i) => {
      const ant = i ? c.embudo[i - 1].n : 0, caida = i && ant ? Math.round(((ant - e.n) / ant) * 100) : 0;
      return `<li><span>${esc(e.t)}</span><span class="b"><i style="width:${(e.n / m) * 100}%"></i></span><span class="v">${n0(e.n)}${i && caida > 0 ? ` · −${caida} %` : ''}</span></li>`; }).join('')}</ul></div>`;
    h += `<div class="cols"><div class="tarjeta"><h2>Mazos</h2><p class="nota">Lecturas por mazo</p>${barras(c.porMazo, MAZOS, c.lec.length)}</div>
      <div class="tarjeta"><h2>Temas</h2><p class="nota">Lo que la gente quiere explorar</p>${barras(c.porTema, TEMAS, c.lec.length)}</div>
      <div class="tarjeta"><h2>Tiradas</h2><p class="nota">Cuántas cartas eligen</p>${barras(c.porTirada, TIRADAS, c.lec.length)}</div>
      <div class="tarjeta"><h2>Dispositivo</h2><p class="nota">Visitas</p>${barras(c.porDisp, { movil: 'Celular', escritorio: 'Computador' }, sesN)}</div></div>`;
    return h;
  }

  /* ---------- personas: cuentas y visitantes anónimos en una sola lista, cada fila con el detalle de sus visitas ---------- */
  const mas = (arr) => { const c = {}; arr.forEach((x) => { if (x) c[x] = (c[x] || 0) + 1; }); return Object.keys(c).sort((a, b) => c[b] - c[a])[0] || ''; };
  const nombreEquipo = (d) => (d === 'movil' ? 'Celular' : d === 'escritorio' ? 'Computador' : '—');
  const masTarde = (a, b) => (!a ? b : !b ? a : (a > b ? a : b));
  function filasPersonas(c) {
    // si un navegador inició sesión alguna vez, todas sus visitas se asocian a esa cuenta
    const duenio = {}; c.ses.forEach((x) => { if (x.uid) duenio[x.anon] = x.uid; });
    const porUid = {}, porAnon = {};
    c.ses.forEach((x) => { const u = x.uid || duenio[x.anon]; if (u) (porUid[u] = porUid[u] || []).push(x); else (porAnon[x.anon] = porAnon[x.anon] || []).push(x); });
    const resumen = (l) => {
      l.sort((a, b) => (b.inicio || 0) - (a.inicio || 0));
      return { ses: l, n: l.length, lect: l.reduce((t, x) => t + (x.lecturas || 0), 0), primera: l.length ? l[l.length - 1].inicio : null, ultima: l.length ? (l[0].ultima || l[0].inicio) : null, disp: mas(l.map((x) => x.disp)), hoy: l.some((x) => x.cartaHoy) };
    };
    const filas = E.datos.personas.map((p) => { const r = resumen(porUid[p.uid] || []); return Object.assign(r, { tipo: 'cuenta', clave: 'c' + p.uid, p, nombre: p.nombre || 'Sin nombre', correo: p.email, entro: p.creado, ultimo: masTarde(p.ultimoAcceso, r.ultima), visitas: Math.max(r.n, p.accesos || 0) }); });
    Object.keys(porAnon).forEach((a) => { const r = resumen(porAnon[a]); filas.push(Object.assign(r, { tipo: 'visitante', clave: 'v' + a, nombre: 'Visitante #' + a.slice(0, 6), correo: '—', entro: r.primera, ultimo: r.ultima, visitas: r.n })); });
    return filas.sort((a, b) => (b.ultimo || 0) - (a.ultimo || 0));
  }
  function detalleFila(f) {
    const sub = f.ses.length ? `<div class="tabla-c"><table class="sub"><thead><tr><th>Día</th><th>Entró</th><th>Duración</th><th>Equipo</th><th>Recorrido</th><th>Mazo</th><th>Tema</th><th>Tirada</th><th>Lecturas</th><th>Carta del día</th></tr></thead><tbody>${f.ses.map((x) => {
      const dur = x.inicio && x.ultima ? Math.max(0, Math.round((x.ultima - x.inicio) / 60000)) : 0;
      const pasos = PASOS.filter(([id]) => x.vistas && x.vistas[id] > 0).map(([id, t]) => `<span class="chip">${esc(t)}${x.vistas[id] > 1 ? ' ×' + x.vistas[id] : ''}</span>`).join(' ') || '<span class="chip">Portada</span>';
      return `<tr><td>${esc(x.dia)}</td><td>${hora(x.inicio)}</td><td>${dur ? dur + ' min' : '< 1 min'}</td><td>${nombreEquipo(x.disp)}</td><td>${pasos}</td><td>${x.mazo ? esc(MAZOS[x.mazo] || x.mazo) : '—'}</td><td>${x.tema ? esc(TEMAS[x.tema] || x.tema) : '—'}</td><td>${x.tirada ? esc(TIRADAS[x.tirada] || x.tirada) : '—'}</td><td>${n0(x.lecturas || 0)}</td><td>${x.cartaHoy ? 'Sí' : '—'}</td></tr>`; }).join('')}</tbody></table></div>`
      : '<p class="nota">Todavía no hay visitas medidas asociadas a esta cuenta en este rango. Las visitas se asocian a la cuenta desde que la persona inicia sesión.</p>';
    const ficha = f.tipo === 'cuenta' ? `<dl><div><dt>Identificador</dt><dd>${esc(f.p.uid)}</dd></div><div><dt>Alta</dt><dd>${hora(f.p.creado)}</dd></div><div><dt>Último acceso</dt><dd>${hora(f.p.ultimoAcceso)}</dd></div><div><dt>Accesos con sesión</dt><dd>${n0(f.p.accesos || 0)}</dd></div>${f.p.porPago ? '<div><dt>Suscripción</dt><dd>Mercado Pago · activa</dd></div>' : ''}</dl>` : '';
    return `<tr class="det"><td colspan="8">${ficha}${sub}</td></tr>`;
  }
  function tablaFilas(F) {
    if (!F.length) return vacio(E.buscar ? 'Sin resultados' : 'Todavía no hay personas', E.buscar ? 'Prueba con otro nombre o correo.' : 'Aparecerán cuando alguien visite el sitio o cree su cuenta.');
    return `<div class="tabla-c"><table><thead><tr><th>Persona</th><th>Correo</th><th>Perfil</th><th>Entró</th><th>Último</th><th>Visitas</th><th>Lecturas</th><th>Equipo</th></tr></thead><tbody>${F.map((f) =>
      `<tr data-kv="${esc(f.clave)}"><td>${esc(f.nombre)}</td><td>${esc(f.correo)}</td><td>${f.tipo === 'cuenta' ? selPerfil(f.p) + (f.p.porPago ? ' <span class="chip ok" title="Suscripción activa con Mercado Pago">pagado</span>' : '') : '—'}</td><td>${hora(f.entro)}</td><td>${hora(f.ultimo)}</td><td>${n0(f.visitas)}</td><td>${n0(f.lect)}</td><td>${nombreEquipo(f.disp)}</td></tr>${E.abierto === f.clave ? detalleFila(f) : ''}`).join('')}</tbody></table></div>`;
  }
  const filtrarFilas = (F) => { const q = E.buscar.trim().toLowerCase(); return F.filter((f) => (f.tipo === 'cuenta' || E.verAnon) && (!q || (f.nombre + ' ' + f.correo).toLowerCase().includes(q))); };

  function vPersonas() {
    const c = calc(), F = filasPersonas(c), nAnon = F.filter((f) => f.tipo === 'visitante').length, V = filtrarFilas(F);
    let h = cabeza('Personas', `Cuentas y visitantes, en una sola lista. Toca una fila para ver cada una de sus visitas. Últimos ${E.rango} días, hora de Chile. Los visitantes sin cuenta son anónimos: cada navegador tiene un código al azar.`,
      `${rangoCtl()}<button type="button" class="btn chico" id="csvPersonas" ${V.length ? '' : 'disabled'}>Descargar CSV</button>`);
    const hoy = fDia.format(new Date()), semana = fDia.format(new Date(Date.now() - 7 * 864e5));
    const nuevas = E.datos.personas.filter((p) => p.creado && fDia.format(p.creado) >= semana).length, activasHoy = E.datos.personas.filter((p) => p.ultimoAcceso && fDia.format(p.ultimoAcceso) === hoy).length;
    const kpi = (t, n, d) => `<div class="kpi"><div class="t">${t}</div><div class="n">${n}</div><div class="d">${d}</div></div>`;
    h += `<div class="kpis">${kpi('Visitantes distintos', n0(c.visit.size), `${n0(c.ses.length)} visitas en total`)}${kpi('Con lecturas', n0(F.filter((f) => f.lect > 0).length), 'Terminaron al menos una')}${kpi('Volvieron', n0(c.volvieron), 'Visitaron en más de un día')}
      ${kpi('Cuentas', n0(E.datos.personas.length), E.datos.topes.personas ? 'Se muestran las 500 más recientes' : 'En total')}${kpi('Nuevas esta semana', n0(nuevas), 'Cuentas de los últimos 7 días')}${kpi('Activas hoy', n0(activasHoy), 'Cuentas que entraron hoy')}</div>`;
    h += `<div class="tarjeta"><div class="filtros"><input type="search" id="buscar" placeholder="Buscar por nombre o correo…" value="${esc(E.buscar)}" aria-label="Buscar personas"></div>
      <label class="chk"><input type="checkbox" id="verAnon" ${E.verAnon ? 'checked' : ''}> Incluir visitantes anónimos (${n0(nAnon)})</label>
      <div id="tablaPersonas">${tablaFilas(V)}</div>
      <p class="nota" style="margin-top:12px">Nunca se guardan preguntas ni notas. Quien no ha entrado a su cuenta es anónimo (un código al azar por navegador); cuando inicia sesión, sus visitas se asocian a su cuenta.${E.datos.topes && E.datos.topes.sesiones ? ' Se muestran las 2.000 visitas más recientes.' : ''} Para borrar una ficha, la persona usa «Borrar mi ficha» en su perfil.</p></div>`;
    return h;
  }
  const selPerfil = (p) => `<select class="sel-perfil" data-asig="${esc(p.uid)}" aria-label="Perfil de ${esc(p.email)}">${PERFILES.map(([k, n]) => `<option value="${k}" ${(p.perfil || 'free') === k ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
  function vLecturas() {
    const L = E.datos.lecturas.filter((l) => (!E.fMazo || l.mazo === E.fMazo) && (!E.fTema || l.tema === E.fTema) && (!E.fTirada || l.tirada === E.fTirada) && (!E.fPregunta || String(!!l.pregunta) === E.fPregunta))
      .sort((a, b) => (b.fecha || 0) - (a.fecha || 0));
    const sel = (id, obj, v, t) => `<select id="${id}" aria-label="${t}"><option value="">${t}</option>${Object.keys(obj).map((k) => `<option value="${k}" ${v === k ? 'selected' : ''}>${esc(obj[k])}</option>`).join('')}</select>`;
    let h = cabeza('Lecturas', 'Cada lectura completada: mazo, tema, tirada y cartas. La pregunta nunca se guarda; solo se sabe si hubo una.', `<button type="button" class="btn chico" id="recargar">Actualizar</button><button type="button" class="btn chico" id="csvLecturas" ${L.length ? '' : 'disabled'}>Descargar CSV</button>`);
    h += `<div class="tarjeta"><div class="filtros">${sel('fMazo', MAZOS, E.fMazo, 'Todos los mazos')}${sel('fTema', TEMAS, E.fTema, 'Todos los temas')}${sel('fTirada', TIRADAS, E.fTirada, 'Todas las tiradas')}${sel('fPregunta', { true: 'Con pregunta', false: 'Sin pregunta' }, E.fPregunta, 'Con o sin pregunta')}</div>`;
    if (!L.length) return h + vacio('Sin lecturas', 'No hay lecturas con esos filtros en el período cargado.') + '</div>';
    h += `<p class="nota" style="margin-top:12px">${n0(L.length)} lecturas${E.datos.topes.lecturas ? ' (se cargan las 2.000 más recientes)' : ''}. Se muestran las 100 últimas.</p>
      <div class="tabla-c"><table><thead><tr><th>Cuándo</th><th>Mazo</th><th>Tema</th><th>Tirada</th><th>Cartas</th><th>Pregunta</th><th>Equipo</th></tr></thead><tbody>${L.slice(0, 100).map((l) => `<tr>
        <td>${hora(l.fecha)}</td><td>${esc(MAZOS[l.mazo] || l.mazo)}</td><td>${esc(TEMAS[l.tema] || l.tema)}</td><td>${esc(TIRADAS[l.tirada] || l.tirada)}</td>
        <td><div class="cel"><span class="mini">${(l.cartas || []).map((c) => `<img src="../img/${esc(l.mazo)}/${pad(c)}.webp" alt="${esc(nombreCarta(c))}" title="${esc(nombreCarta(c))}" loading="lazy" decoding="async">`).join('')}</span><span>${(l.cartas || []).map((c) => esc(nombreCarta(c))).join(', ')}</span></div></td>
        <td>${l.pregunta ? 'Sí' : 'No'}</td><td>${l.disp === 'movil' ? 'Celular' : 'Computador'}</td></tr>`).join('')}</tbody></table></div></div>`;
    return h;
  }

  function vMazos() {
    const c = calc(), tot = c.lec.length, max = Math.max(1, ...c.cartas);
    const orden = c.cartas.map((n, i) => [i, n]).sort((a, b) => b[1] - a[1]);
    const mayores = c.cartas.slice(0, 22).reduce((a, b) => a + b, 0), PALOS = [['Bastos', 22], ['Copas', 36], ['Espadas', 50], ['Oros', 64]];
    const palos = {}; PALOS.forEach(([n, i]) => { palos[n] = c.cartas.slice(i, i + 14).reduce((a, b) => a + b, 0); });
    const sin = c.cartas.filter((n) => !n).length;
    let h = cabeza('Mazos y cartas', `Qué cartas salen en las ${n0(tot)} lecturas de los últimos ${E.rango} días.`, rangoCtl());
    if (!tot) return h + `<div class="tarjeta">${vacio('Sin lecturas en este período', 'Cuando haya lecturas, verás qué cartas y qué mazos prefiere la gente.')}</div>`;
    h += `<div class="cols"><div class="tarjeta"><h2>Uso de los mazos</h2>${barras(c.porMazo, MAZOS, tot)}</div>
      <div class="tarjeta"><h2>Arcanos mayores y palos</h2><p class="nota">Cartas que salieron</p>${barras(Object.assign({ Mayores: mayores }, palos), { Mayores: 'Arcanos mayores', Bastos: 'Bastos', Copas: 'Copas', Espadas: 'Espadas', Oros: 'Oros' }, c.cartas.reduce((a, b) => a + b, 0))}</div></div>`;
    h += `<div class="tarjeta"><h2>Las diez cartas más frecuentes</h2>${barras(Object.fromEntries(orden.slice(0, 10).map(([i, n]) => [i, n])), Object.fromEntries(orden.slice(0, 10).map(([i]) => [i, nombreCarta(i)])), c.cartas.reduce((a, b) => a + b, 0), orden.slice(0, 10).map(([i]) => String(i)))}</div>`;
    h += `<div class="tarjeta"><h2>Las 78 cartas</h2><p class="nota">${sin ? `${sin} cartas todavía no han salido. ` : 'Todas han salido al menos una vez. '}Con azar parejo se esperan frecuencias parecidas; con pocas lecturas es normal que varíen mucho.</p>
      <div class="filtros"><select id="mazoMapa" aria-label="Mazo para las miniaturas">${Object.keys(MAZOS).map((k) => `<option value="${k}" ${E.mazoMapa === k ? 'selected' : ''}>Ver con ${MAZOS[k]}</option>`).join('')}</select></div>
      <div class="mapa">${c.cartas.map((n, i) => `<div class="c ${n ? '' : 'cero'}" title="${esc(nombreCarta(i))}: ${n}"><img src="../img/${E.mazoMapa}/${pad(i)}.webp" alt="${esc(nombreCarta(i))}" loading="lazy"><b>${n}</b></div>`).join('')}</div></div>`;
    return h;
  }

  function interruptor(id, on, rotulo) {
    return `<span class="estado"><span class="interruptor"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} aria-label="${esc(rotulo)}"><span></span></span><em>${on ? 'Encendido' : 'Apagado'}</em></span>`;
  }
  function vFunciones() {
    const f = E.edit, c = calc(), sesN = c.ses.length, tot = c.lec.length;
    const sucio = JSON.stringify(f) !== JSON.stringify(mezclar(DEF, E.funciones ? Object.assign({}, E.funciones, { actualizado: undefined, por: undefined }) : {}).valueOf());
    const fila = (id, t, d, on, uso) => `<tr><td><b style="font-weight:400">${t}</b><div class="nota" style="color:var(--tenue);font-size:.85rem">${d}</div></td><td>${interruptor(id, on, t)}</td><td>${uso}</td></tr>`;
    let h = cabeza('Funciones', 'Enciende o apaga partes del sitio sin tocar el código. Nada se borra: al apagar algo, solo se oculta, y se puede volver a encender.', `<button type="button" class="btn chico" id="recargar">Actualizar</button>`);
    h += `<div class="tarjeta"><h2>Interruptores</h2><p class="nota">Los cambios llegan a las visitas en su próxima carga (el navegador recuerda la última configuración).</p>
      <div class="tabla-c"><table><thead><tr><th>Función</th><th>Estado</th><th>Uso medido (${E.rango} días)</th></tr></thead><tbody>
      ${fila('f_cobros', 'Cobros (botón Suscribirme)', 'Si lo apagas, nadie puede iniciar un pago nuevo (ni desde el sitio ni por el servidor de pagos). Quienes ya pagaron conservan su plan.', f.cobros, E.perfiles ? 'Mercado Pago' : 'Mercado Pago')}
      ${fila('f_cartaDelDia', 'Carta del día', 'Sección de la portada donde se voltea una carta.', f.cartaDelDia, `${n0(c.hoy)} reveladas · ${pct(c.hoy, sesN)} de las visitas`)}
      ${fila('f_desfile', 'Desfile de cartas', 'Tira de cartas en movimiento bajo la portada.', f.desfile, 'Decorativo, no se mide')}
      ${fila('f_planes', 'Planes y precios', 'Sección de planes. Todavía no hay pagos: los de pago dicen «Muy pronto».', f.planes, 'Sin compras: aún no existen')}
      ${fila('f_cuentas', 'Entrar con Google', 'Caja de cuenta en Mi espacio.', f.cuentas, `${n0(E.datos.personas.length)} cuentas`)}
      ${fila('f_medicion', 'Medición anónima', 'Si la apagas, este panel deja de recibir datos nuevos.', f.medicion, `${n0(sesN)} visitas medidas`)}
      ${Object.keys(MAZOS).map((k) => fila('f_m_' + k, 'Mazo ' + MAZOS[k], 'Si lo apagas, desaparece de la lista y de la portada.', f.mazos[k], `${n0(c.porMazo[k] || 0)} lecturas · ${pct(c.porMazo[k] || 0, tot)}`)).join('')}
      ${fila('f_aviso', 'Aviso del sitio', 'Franja dorada arriba de toda la página, con el texto que escribas abajo.', f.aviso.activo, f.aviso.activo ? 'Visible' : 'Oculto')}
      </tbody></table></div>
      <div class="campo"><label for="avisoTexto">Texto del aviso (hasta 140 caracteres)</label><input id="avisoTexto" maxlength="140" value="${esc(f.aviso.texto)}" placeholder="Por ejemplo: Hoy estamos probando mejoras. Gracias por tu paciencia."></div>
      <p class="nota" style="margin-top:12px">${E.funciones && E.funciones.actualizado ? `Última vez guardado: ${hora(E.funciones.actualizado)}${E.funciones.por ? ' por ' + esc(E.funciones.por) : ''}.` : 'Todavía no se ha guardado ninguna configuración: el sitio usa los valores de partida (todo encendido).'}</p></div>`;
    h += `<div class="tarjeta"><h2>Cómo se usan las demás funciones</h2><p class="nota">Estas no tienen interruptor: son el corazón del sitio.</p>
      <div class="cols" style="margin-top:0"><div>${barras(c.porTirada, TIRADAS, tot)}</div><div>
      <ul class="barras"><li><span>Lecturas con pregunta escrita</span><span class="b"><i style="width:${tot ? (c.conPregunta / tot) * 100 : 0}%"></i></span><span class="v">${n0(c.conPregunta)} · ${pct(c.conPregunta, tot)}</span></li>
      <li><span>Visitas que llegaron a barajar</span><span class="b"><i style="width:${sesN ? (c.embudo[4].n / sesN) * 100 : 0}%"></i></span><span class="v">${n0(c.embudo[4].n)} · ${pct(c.embudo[4].n, sesN)}</span></li>
      <li><span>Visitas que revelaron cartas</span><span class="b"><i style="width:${sesN ? (c.embudo[6].n / sesN) * 100 : 0}%"></i></span><span class="v">${n0(c.embudo[6].n)} · ${pct(c.embudo[6].n, sesN)}</span></li></ul></div></div></div>`;
    h += `<div class="barra-g" id="barraG" ${sucio ? '' : 'hidden'}><p>Hay cambios sin guardar.</p><button type="button" class="btn chico" id="descartar">Descartar</button><button type="button" class="btn primario chico" id="guardarF">Guardar y publicar</button></div>`;
    return h;
  }

  /* ---------- perfiles ---------- */
  const perfEdit = (g) => { const e = mezclar(PERF_DEF, g || {}); delete e.actualizado; delete e.por; return e; };
  function perfSucio() { return JSON.stringify(E.editP) !== JSON.stringify(perfEdit(E.perfiles)); }
  function vPerfiles() {
    const P = E.editP, cont = { free: 0, full: 0, premium: 0 };
    E.datos.personas.forEach((p) => { cont[PERFILES.some((x) => x[0] === p.perfil) ? p.perfil : 'free'] += 1; });
    const celdaB = (id, on, rot) => `<td>${interruptor(id, on, rot)}</td>`;
    const celdaN = (id, v, rot) => `<td><input type="number" min="0" step="1" class="num" id="${id}" value="${v === null || v === undefined ? '' : v}" placeholder="Sin límite" aria-label="${esc(rot)}"></td>`;
    const filaB = (t, d, f) => `<tr><td><b style="font-weight:400">${t}</b>${d ? `<div class="nota" style="color:var(--tenue);font-size:.85rem">${d}</div>` : ''}</td>${PERFILES_TODOS.map(([k]) => celdaB(f(k).id, f(k).on, t + ' · ' + k)).join('')}</tr>`;
    const filaT = (t, d, campo) => `<tr><td><b style="font-weight:400">${t}</b><div class="nota" style="color:var(--tenue);font-size:.85rem">${d}</div></td>${PERFILES_TODOS.map(([k]) => `<td><input type="text" class="txt" maxlength="24" id="pt_${k}_${campo}" value="${esc(P[k][campo] || '')}" aria-label="${esc(t + ' · ' + k)}"></td>`).join('')}</tr>`;
    const filaN = (t, d, campo) => `<tr><td><b style="font-weight:400">${t}</b><div class="nota" style="color:var(--tenue);font-size:.85rem">${d}</div></td>${PERFILES_TODOS.map(([k]) => celdaN('pn_' + k + '_' + campo, P[k][campo], t + ' · ' + k)).join('')}</tr>`;
    let h = cabeza('Perfiles', 'Qué incluye cada perfil. Quien no ha entrado usa <b>Invitado</b> (lo básico, con invitaciones a entrar gratis y suscribirse). Quien entra sin plan asignado usa Free. Lo que un perfil no incluye no se le muestra; los topes se explican cuando se agotan.', `<button type="button" class="btn chico" id="recargar">Actualizar</button>`);
    h += `<div class="kpis">${PERFILES.map(([k, n]) => `<div class="kpi"><div class="t">${n}</div><div class="n">${n0(cont[k])}</div><div class="d">cuentas con este perfil</div></div>`).join('')}</div>`;
    h += `<div class="tarjeta"><h2>Funciones por perfil</h2><p class="nota">Los interruptores generales de «Funciones» siguen mandando: si un mazo está apagado allí, no aparece en ningún perfil. Los cambios llegan a las visitas en su próxima carga.</p>
      <div class="tabla-c"><table><thead><tr><th>Función</th>${PERFILES_TODOS.map(([, n]) => `<th>${n}</th>`).join('')}</tr></thead><tbody>
      <tr class="sub"><td colspan="5"><b>Cómo se muestra en la portada</b></td></tr>
      ${filaT('Precio', 'Texto grande de la tarjeta del plan. Por ejemplo $3.990 o Gratis.', 'precio')}
      ${filaT('Periodo', 'Texto pequeño bajo el precio. Por ejemplo «al mes».', 'periodo')}
      <tr class="sub"><td colspan="5"><b>Tiradas</b></td></tr>
      ${Object.keys(TIRADAS).map((t) => filaB(TIRADAS[t], '', (k) => ({ id: `pb_${k}_t_${t}`, on: P[k].tiradas[t] !== false }))).join('')}
      <tr class="sub"><td colspan="5"><b>Mazos</b></td></tr>
      ${Object.keys(MAZOS).map((m) => filaB('Mazo ' + MAZOS[m], '', (k) => ({ id: `pb_${k}_m_${m}`, on: P[k].mazos[m] !== false }))).join('')}
      <tr class="sub"><td colspan="5"><b>Lecturas</b></td></tr>
      ${filaB('Pregunta libre', 'Tema donde la persona escribe su propia pregunta.', (k) => ({ id: `pb_${k}_temaLibre`, on: P[k].temaLibre !== false }))}
      ${filaB('Calendario de cartas', 'Calendario de la carta del día en Mi espacio. Si lo apagas, invita a entrar o a suscribirse.', (k) => ({ id: `pb_${k}_calendario`, on: P[k].calendario !== false }))}
      ${filaB('Guardar lecturas y notas', 'Diario privado en Mi espacio. Si lo apagas, no aparece el botón de guardar.', (k) => ({ id: `pb_${k}_diario`, on: P[k].diario !== false }))}
      <tr class="sub"><td colspan="5"><b>Sonido</b></td></tr>
      ${filaB('Sonido en el sitio', 'Si lo apagas, el botón «Sonido» invita a suscribirse en vez de activarse.', (k) => ({ id: `pb_${k}_sonido`, on: P[k].sonido !== false }))}
      ${ESTILOS_SONIDO.map(([n, t]) => filaB('Estilo ' + n + ' · ' + t, '', (k) => ({ id: `pb_${k}_s_${n}`, on: (P[k].estilos || {})[n] !== false }))).join('')}
      <tr class="sub"><td colspan="5"><b>Topes</b> (vacío = sin límite)</td></tr>
      ${filaN('Lecturas por día', 'Se cuentan en el dispositivo de la persona, por día de Chile.', 'lecturasDia')}
      ${filaN('Lecturas guardadas', 'Cuántas puede conservar en Mi espacio.', 'guardadas')}
      ${filaN('Días perdidos que puede recuperar', 'De la semana en curso, hacia atrás: días en que no abrió su carta. 0 = no puede; vacío = todos los que le falten.', 'recuperarDias')}
      </tbody></table></div>
      <p class="nota" style="margin-top:12px">${E.perfiles && E.perfiles.actualizado ? `Última vez guardado: ${hora(E.perfiles.actualizado)}${E.perfiles.por ? ' por ' + esc(E.perfiles.por) : ''}.` : 'Todavía no se ha guardado: el sitio usa los valores de partida que ves aquí.'}</p>
      <p class="nota">Los topes se cuentan en el navegador, así que frenan el uso normal pero no a quien borre sus datos del navegador a propósito. Todavía no hay pagos: el perfil de cada cuenta se asigna a mano en <b>Personas</b>.</p></div>`;
    h += `<div class="barra-g" id="barraG" ${perfSucio() ? '' : 'hidden'}><p>Hay cambios sin guardar.</p><button type="button" class="btn chico" id="descartarP">Descartar</button><button type="button" class="btn primario chico" id="guardarP">Guardar y publicar</button></div>`;
    return h;
  }

  function cuota(usado, tope, rot) {
    const p = Math.min(100, (usado / tope) * 100);
    return `<div style="margin-top:14px"><div style="display:flex;justify-content:space-between;gap:10px"><span>${rot}</span><span class="sello">${n0(usado)} de ${n0(tope)}</span></div><div class="cuota"><i class="${p > 85 ? 'critica' : p > 60 ? 'alta' : ''}" style="width:${p}%"></i></div></div>`;
  }
  function vSistema() {
    const hoy = fDia.format(new Date()), sesHoy = E.datos.sesiones.filter((s) => s.dia === hoy).length, lecHoy = E.datos.lecturas.filter((l) => l.dia === hoy).length;
    const ult = E.datos.sesiones.reduce((m, s) => (s.ultima && (!m || s.ultima > m) ? s.ultima : m), null);
    let h = cabeza('Sistema', 'Estado de la conexión, quiénes administran y cuánto del plan gratuito se está usando.', `<button type="button" class="btn chico" id="recargar">Actualizar</button>`);
    h += `<div class="cols"><div class="tarjeta"><h2>Conexión</h2><dl class="datos"><dt>Modo</dt><dd>${esc(D.modo)}</dd><dt>Proyecto</dt><dd>${esc(D.proyecto || '—')}</dd>
      <dt>Estado</dt><dd><span class="chip ${E.error ? 'mal' : 'ok'}">${E.error ? 'Con problemas' : 'Conectado'}</span></dd>
      <dt>Última visita medida</dt><dd>${hora(ult)}</dd><dt>Sitio</dt><dd><a href="../" style="color:var(--oro-claro)">Abrir ARCANA</a></dd></dl></div>
      <div class="tarjeta"><h2>Quién administra</h2><p class="nota">Solo estos correos verificados, entrando con Google. Se editan en Firebase, en el documento <b>config/admin</b>.</p>
      <ul class="barras">${(E.correos || []).map((m) => `<li><span>${esc(m)}</span><span></span><span class="v">${m === E.usuario.email ? 'Tú' : ''}</span></li>`).join('') || '<li><span>No se pudo leer la lista</span><span></span><span></span></li>'}</ul></div></div>`;
    h += `<div class="tarjeta"><h2>Uso del plan gratuito</h2><p class="nota">Firestore gratis permite 20.000 escrituras y 50.000 lecturas al día. Las escrituras son una estimación (unas 4 por visita y 1 por lectura).</p>
      ${cuota(sesHoy * 4 + lecHoy, 20000, 'Escrituras estimadas hoy')}${cuota(E.gastoLecturas, 50000, 'Lecturas gastadas por este panel en esta visita')}
      <p class="nota" style="margin-top:14px">Cada carga del panel lee hasta unos 4.500 documentos. Si el sitio crece, conviene subir de plan o resumir los datos por día.</p></div>`;
    h += `<div class="tarjeta"><h2>Datos guardados</h2><p class="nota">Cuenta los documentos de cada colección. Cuesta una lectura por cada mil.</p><div class="acciones"><button type="button" class="btn chico" id="contar">Contar documentos</button></div><div id="conteos"></div></div>`;
    h += `<div class="tarjeta"><h2>Privacidad</h2><p class="nota" style="font-size:.95rem">El sitio no guarda preguntas ni notas: quedan en el dispositivo de cada persona. De cada visita solo se mide por qué pasos pasó, con un identificador aleatorio del navegador. No se mide a quien activa «no rastrear». Las cuentas guardan nombre, correo y fechas de acceso, y cada persona puede borrar su ficha.</p></div>`;
    return h;
  }

  /* ================= pintado e interacción ================= */
  function pintar() {
    const m = $('#contenido'); if (!m) return;
    if (E.cargando && !E.datos) { m.innerHTML = '<p class="espera">Cargando datos…</p>'; return; }
    if (E.error && !E.datos) { m.innerHTML = cabeza('No se pudo cargar', E.error) + `<div class="tarjeta"><div class="acciones"><button type="button" class="btn primario" id="recargar">Reintentar</button></div></div>`; enlazar(); return; }
    if (!E.datos) return;
    const v = { resumen: vResumen, personas: vPersonas, lecturas: vLecturas, mazos: vMazos, funciones: vFunciones, perfiles: vPerfiles, sistema: vSistema }[E.seccion];
    const y = window.scrollY;
    m.innerHTML = (E.error ? `<p class="chip mal" style="margin-bottom:14px">${esc(E.error)}</p>` : '') + v();
    enlazar(); window.scrollTo(0, y);
  }
  function descargar(nombre, filas) {
    const csv = filas.map((r) => r.map((c) => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })); a.download = nombre; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function enlazar() {
    const r = $('#recargar'); if (r) r.onclick = () => recargar(true);
    $$('[data-ir-s]').forEach((x) => { x.onclick = () => ir(x.dataset.irS); });
    $$('[data-r]').forEach((b) => { b.onclick = () => { E.rango = Number(b.dataset.r); pintar(); }; });
    const filasClic = () => $$('tr[data-kv]').forEach((tr) => { tr.onclick = (ev) => { if (ev.target.closest('select')) return; E.abierto = E.abierto === tr.dataset.kv ? null : tr.dataset.kv; pintar(); }; });
    filasClic();
    const b = $('#buscar'); if (b) b.oninput = () => { E.buscar = b.value; E.abierto = null; $('#tablaPersonas').innerHTML = tablaFilas(filtrarFilas(filasPersonas(calc()))); filasClic(); enlazarAsignar(); };
    const va = $('#verAnon'); if (va) va.onchange = () => { E.verAnon = va.checked; E.abierto = null; pintar(); };
    [['fMazo', 'fMazo'], ['fTema', 'fTema'], ['fTirada', 'fTirada'], ['fPregunta', 'fPregunta'], ['mazoMapa', 'mazoMapa']].forEach(([id, k]) => { const s = $('#' + id); if (s) s.onchange = () => { E[k] = s.value; pintar(); }; });
    enlazarAsignar();
    function enlazarAsignar() { $$('[data-asig]').forEach((sel) => { sel.onchange = async () => {
      const uid = sel.dataset.asig, nuevo = sel.value, p = E.datos.personas.find((x) => x.uid === uid); sel.disabled = true;
      try { await D.asignarPerfil(uid, nuevo); if (p) p.perfil = nuevo; aviso('Perfil actualizado a ' + (PERFILES.find((x) => x[0] === nuevo) || [])[1] + '.'); }
      catch (e) { sel.value = (p && p.perfil) || 'free'; aviso('No se pudo cambiar el perfil.'); }
      sel.disabled = false; }; }); }
    // perfiles
    $$('[id^="pb_"]').forEach((i) => { i.onchange = () => {
      const [, k, tipo, x] = i.id.split('_');
      if (tipo === 't') E.editP[k].tiradas[x] = i.checked; else if (tipo === 'm') E.editP[k].mazos[x] = i.checked; else if (tipo === 's') { E.editP[k].estilos = E.editP[k].estilos || {}; E.editP[k].estilos[x] = i.checked; } else E.editP[k][tipo] = i.checked;
      pintar(); }; });
    $$('[id^="pn_"]').forEach((i) => { i.onchange = () => {
      const [, k, campo] = i.id.split('_'), v = i.value.trim();
      E.editP[k][campo] = v === '' ? null : Math.max(0, Math.round(Number(v)) || 0); pintar(); }; });
    $$('[id^="pt_"]').forEach((i) => { i.oninput = () => { const [, k, campo] = i.id.split('_'); E.editP[k][campo] = i.value; $('#barraG').hidden = !perfSucio(); }; });
    const dp = $('#descartarP'); if (dp) dp.onclick = () => { E.editP = perfEdit(E.perfiles); pintar(); };
    const gp = $('#guardarP'); if (gp) gp.onclick = async () => {
      gp.disabled = true;
      try { await D.guardarPerfiles(E.editP, E.usuario.email); E.perfiles = Object.assign(perfEdit(E.editP), { actualizado: new Date(), por: E.usuario.email }); aviso('Publicado. Las visitas lo verán en su próxima carga.'); pintar(); }
      catch (e) { gp.disabled = false; aviso('No se pudo guardar. Revisa tu conexión y tu acceso.'); }
    };
    const cp = $('#csvPersonas'); if (cp) cp.onclick = () => descargar('arcana-personas.csv', [['persona', 'tipo', 'correo', 'perfil', 'entro', 'ultimo', 'visitas', 'lecturas', 'equipo']].concat(filtrarFilas(filasPersonas(calc())).map((f) => [f.nombre, f.tipo, f.correo === '—' ? '' : f.correo, f.tipo === 'cuenta' ? (f.p.perfil || 'free') : '', f.entro ? new Date(f.entro).toISOString() : '', f.ultimo ? new Date(f.ultimo).toISOString() : '', f.visitas, f.lect, nombreEquipo(f.disp)])));
    const cl = $('#csvLecturas'); if (cl) cl.onclick = () => descargar('arcana-lecturas.csv', [['fecha', 'mazo', 'tema', 'tirada', 'cartas', 'con_pregunta', 'equipo']].concat(E.datos.lecturas.map((l) => [l.fecha ? l.fecha.toISOString() : '', l.mazo, l.tema, l.tirada, (l.cartas || []).map(nombreCarta).join(' | '), l.pregunta ? 'si' : 'no', l.disp])));
    // funciones
    const map = { f_cobros: (v) => { E.edit.cobros = v; }, f_cartaDelDia: (v) => { E.edit.cartaDelDia = v; }, f_desfile: (v) => { E.edit.desfile = v; }, f_planes: (v) => { E.edit.planes = v; }, f_cuentas: (v) => { E.edit.cuentas = v; }, f_medicion: (v) => { E.edit.medicion = v; }, f_aviso: (v) => { E.edit.aviso.activo = v; } };
    Object.keys(MAZOS).forEach((k) => { map['f_m_' + k] = (v) => { E.edit.mazos[k] = v; }; });
    Object.keys(map).forEach((id) => { const i = $('#' + id); if (i) i.onchange = () => {
      if (id.startsWith('f_m_') && !i.checked && Object.keys(MAZOS).filter((k) => E.edit.mazos[k]).length <= 1) { i.checked = true; aviso('Debe quedar al menos un mazo encendido.'); return; }
      map[id](i.checked); pintar(); }; });
    const at = $('#avisoTexto'); if (at) at.oninput = () => { E.edit.aviso.texto = at.value; $('#barraG').hidden = false; };
    const d = $('#descartar'); if (d) d.onclick = () => { E.edit = mezclar(DEF, E.funciones || {}); delete E.edit.actualizado; delete E.edit.por; pintar(); };
    const g = $('#guardarF'); if (g) g.onclick = async () => {
      if (E.edit.aviso.activo && !E.edit.aviso.texto.trim()) { aviso('Escribe el texto del aviso o apágalo.'); return; }
      g.disabled = true;
      try { await D.guardarFunciones(E.edit, E.usuario.email); E.funciones = mezclar(DEF, E.edit); E.funciones.actualizado = new Date(); E.funciones.por = E.usuario.email; aviso('Publicado. Las visitas lo verán en su próxima carga.'); pintar(); }
      catch (e) { g.disabled = false; aviso('No se pudo guardar. Revisa tu conexión y tu acceso.'); }
    };
    const co = $('#contar'); if (co) co.onclick = async () => { co.disabled = true; try { const r = await D.contar(); E.gastoLecturas += 3; $('#conteos').innerHTML = `<dl class="datos"><dt>Visitas (sesiones)</dt><dd>${n0(r.sesiones)}</dd><dt>Lecturas</dt><dd>${n0(r.lecturas)}</dd><dt>Personas</dt><dd>${n0(r.personas)}</dd></dl>`; } catch (e) { aviso('No se pudo contar.'); } co.disabled = false; };
  }

  /* ================= arranque ================= */
  async function iniciar() {
    const hash = location.hash.replace('#', ''); if (SECCIONES.some((s) => s[0] === hash)) E.seccion = hash;
    const local = ['localhost', '127.0.0.1'].includes(location.hostname) && /[?&]prueba=1/.test(location.search);
    if (local) {
      await new Promise((ok) => { const s = document.createElement('script'); s.src = 'prueba.js'; s.onload = ok; s.onerror = ok; document.head.appendChild(s); });
      if (window.ARCANA_ADMIN_PRUEBA) D = window.ARCANA_ADMIN_PRUEBA;
    }
    if (!D) {
      if (!NUBE) { pantallaSinNube(); return; }
      try { D = await adaptadorFirebase(); } catch (e) { puerta('<h1>No se pudo conectar</h1><p>No logré cargar Firebase. Revisa tu conexión y recarga.</p>'); return; }
    }
    let armado = false;
    D.alSesion(async (u) => {
      E.usuario = u;
      if (!u) { armado = false; E.datos = null; E.correos = null; E.funciones = null; pantallaLogin(); return; }
      const lista = await D.correosAdmin();
      if (!lista || !lista.map((x) => String(x).toLowerCase()).includes(u.email)) { pantallaSinAcceso(); return; }
      if (!armado) { armado = true; armar(); }
    });
  }
  iniciar();
})();
