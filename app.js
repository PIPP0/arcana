/* ARCANA — demo de validación. Todo ocurre en el dispositivo: sin servidor, sin analítica. */
(function () {
  'use strict';
  const { CARTAS, cara, reverso } = window.ARCANA_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (t) => String(t).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const CLAVE = 'arcana.lecturas.v1';

  const MAZOS = [
    { id: 'aureo', nombre: 'Áureo', desc: 'Trazos dorados sobre azul de medianoche. Sobrio y nocturno.', libre: true },
    { id: 'marfil', nombre: 'Marfil', desc: 'Tinta oscura sobre papel marfil. Claro, limpio y editorial.', libre: true },
    { id: 'botanico', nombre: 'Botánico', desc: 'Verde profundo y tonos de herbario. En preparación.', libre: false }
  ];

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

  const estado = { mazo: 'aureo', tema: 'general', pregunta: '', tirada: null, orden: [], elegidas: [], reveladas: new Set(), guardada: false };

  /* ---------- utilidades ---------- */
  function barajar() {
    // Fisher–Yates con azar criptográfico. El orden queda fijo antes de que la persona elija.
    const a = CARTAS.map((_, i) => i), buf = new Uint32Array(1);
    for (let i = a.length - 1; i > 0; i--) {
      let j;
      const lim = Math.floor(0x100000000 / (i + 1)) * (i + 1);
      do { crypto.getRandomValues(buf); } while (buf[0] >= lim);
      j = buf[0] % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    estado.orden = a;
  }
  const carta = (html, cls = '') => `<span class="carta ${cls}">${html}</span>`;
  const de = (t) => (t.startsWith('el ') ? 'del ' + t.slice(3) : 'de ' + t);
  const lista = (arr) => (arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1]);

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
  function ir(id, foco = true) {
    if (id === 'tirada') estado.pregunta = $('#pregunta').value.trim();
    if (id === 'barajar') prepararBarajar();
    if (id === 'espacio') pintarHistorial();
    $$('.vista').forEach((v) => { v.hidden = v.id !== 'v-' + id; });
    document.body.classList.toggle('con-fija', id === 'elegir');
    document.body.className = document.body.className.replace(/mazo-\w+/g, '').trim();
    document.body.classList.add('mazo-' + estado.mazo);
    window.scrollTo(0, 0);
    if (foco) { const h = $('#v-' + id + ' h1, #v-' + id + ' h2'); if (h) h.focus({ preventScroll: true }); }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ir]');
    if (b) ir(b.dataset.ir);
  });

  /* ---------- inicio ---------- */
  $('#heroCartas').innerHTML = [17, 19, 18].map((i) => carta(cara(i), 'mazo-aureo')).join('');

  /* ---------- mazos ---------- */
  $('#listaMazos').innerHTML = MAZOS.map((m) =>
    `<button type="button" class="mazo mazo-${m.id}" data-mazo="${m.id}" ${m.libre ? '' : 'disabled aria-disabled="true"'}>
      <span class="muestra" aria-hidden="true">${carta(reverso())}${carta(cara(m.id === 'marfil' ? 2 : m.id === 'botanico' ? 3 : 17))}</span>
      <span><h3>${m.nombre}</h3><p>${m.desc}</p><span class="etiqueta">${m.libre ? '22 arcanos mayores · Gratis' : 'Próximamente'}</span></span>
    </button>`).join('');
  $('#listaMazos').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mazo]');
    if (!b || b.disabled) return;
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
    $('#pila').innerHTML = Array.from({ length: 7 }, (_, i) =>
      `<span class="carta" style="--i:${i};--d:${i % 2 ? 1 : -1}">${reverso()}</span>`).join('');
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
    const back = reverso();
    $('#mesa').innerHTML = estado.orden.map((_, k) =>
      `<button type="button" aria-pressed="false" data-k="${k}" aria-label="Carta ${k + 1} de 22, boca abajo" style="--k:${k};--g:${((k * 37) % 7) - 3}deg">${carta(back)}</button>`).join('');
    actualizarElegir();
  }
  function actualizarElegir() {
    const n = estado.tirada.pos.length, falta = n - estado.elegidas.length;
    $('#estadoElegir').textContent = falta === 0 ? 'Listo. Confirma tu elección o cambia alguna carta.'
      : falta === 1 ? (n === 1 ? 'Toca la carta que te llame.' : 'Falta 1 carta.') : `Faltan ${falta} cartas.`;
    $('#btnConfirmar').disabled = falta !== 0;
    $$('#mesa button').forEach((b) => {
      const pos = estado.elegidas.indexOf(Number(b.dataset.k));
      b.setAttribute('aria-pressed', String(pos >= 0));
      const o = b.querySelector('.orden'); if (o) o.remove();
      if (pos >= 0) b.insertAdjacentHTML('beforeend', `<span class="orden" aria-hidden="true">${pos + 1}</span>`);
      b.setAttribute('aria-label', `Carta ${Number(b.dataset.k) + 1} de 22, boca abajo` + (pos >= 0 ? `, elegida para ${estado.tirada.pos[pos].nombre}` : ''));
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
    const ids = cartasDeLectura(), pos = estado.tirada.pos;
    estado.reveladas = new Set();
    $('#ranuras').className = 'ranuras' + (ids.length === 1 ? ' una' : '');
    $('#ranuras').innerHTML = ids.map((id, i) =>
      `<div class="ranura"><p class="pos">${pos[i].nombre}</p>
        <button type="button" class="giro" data-i="${i}" aria-label="Revelar la carta de ${pos[i].nombre}">
          <span class="dentro"><span class="lado carta">${reverso()}</span><span class="lado frente carta">${cara(id)}</span></span>
        </button>
        <p class="nombre" data-n="${i}"></p></div>`).join('');
    $('#interpretacion').hidden = true; $('#interpretacion').innerHTML = '';
    $('#accionesRevelar').hidden = ids.length === 1;
    $('#tituloLectura').textContent = 'Revela tus cartas';
    $('#estadoLectura').textContent = ids.length === 1 ? 'Toca la carta para darla vuelta.' : 'Toca cada carta para darla vuelta.';
  }
  function revelar(i) {
    if (estado.reveladas.has(i)) return;
    estado.reveladas.add(i);
    const ids = cartasDeLectura(), b = $(`.giro[data-i="${i}"]`), k = CARTAS[ids[i]];
    b.classList.add('vista-carta'); b.disabled = true;
    b.setAttribute('aria-label', `${estado.tirada.pos[i].nombre}: ${k.nombre}`);
    $(`[data-n="${i}"]`).textContent = k.nombre;
    roce(0.22);
    if (estado.reveladas.size === ids.length) {
      $('#accionesRevelar').hidden = true;
      $('#tituloLectura').textContent = 'Tu lectura';
      $('#estadoLectura').textContent = ids.length === 1 ? `Salió ${k.nombre}.` : `Salieron ${lista(ids.map((x) => CARTAS[x].nombre))}.`;
      const lento = !matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(pintarInterpretacion, lento ? 900 : 0);
    } else {
      $('#estadoLectura').textContent = `${estado.tirada.pos[i].nombre}: ${k.nombre}.`;
    }
  }
  $('#ranuras').addEventListener('click', (e) => { const b = e.target.closest('.giro'); if (b) revelar(Number(b.dataset.i)); });
  $('#btnRevelarTodas').addEventListener('click', () => cartasDeLectura().forEach((_, i) => revelar(i)));

  function sintesis(ks) {
    const t = estado.tirada.id;
    if (t === 'una') return `${ks[0].nombre} te deja una imagen para hoy: ${ks[0].hilo}.`;
    if (t === 'tiempo') return `Leídas en orden, tus cartas trazan un recorrido: vienes ${de(ks[0].hilo)}, hoy te encuentras con ${ks[1].hilo} y se abre, como posibilidad, ${ks[2].hilo}.`;
    return `Juntas, tus cartas muestran tres ángulos de lo mismo: la situación lleva la marca ${de(ks[0].hilo)}, el desafío te pone frente a ${ks[1].hilo} y la posibilidad apunta hacia ${ks[2].hilo}.`;
  }

  function pintarInterpretacion() {
    const ids = cartasDeLectura(), ks = ids.map((i) => CARTAS[i]), pos = estado.tirada.pos;
    const tema = TEMAS.find((t) => t.id === estado.tema);
    const cls = 'mazo-' + estado.mazo;
    let h = `<div><p class="intro">${tema.intro}</p>${estado.pregunta ? `<p class="cita">Tu pregunta: «${esc(estado.pregunta)}». Tenla presente mientras lees.</p>` : ''}</div>`;
    h += ks.map((k, i) =>
      `<article class="bloque">${carta(cara(ids[i]), cls)}
        <div><p class="pos">${pos[i].nombre}</p><h3>${k.nombre}</h3><p class="claves">${k.claves}</p>
        <p class="texto">${LECTURA_POS[pos[i].id](k)}</p></div></article>`).join('');
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
      const cartas = (r.cartas || []).filter((i) => CARTAS[i]);
      return `<article class="registro">
        <p class="fecha">${fmtFecha.format(new Date(r.fecha))}</p>
        <h3 style="margin-top:6px">${t.nombre} · ${tema.nombre}</h3>
        <div class="mini-cartas mazo-${esc(r.mazo)}">${cartas.map((i) => carta(cara(i))).join('')}</div>
        <p>${cartas.map((i, n) => `${t.pos[n] ? t.pos[n].nombre + ': ' : ''}${CARTAS[i].nombre}`).join(' · ')}</p>
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

  ir('inicio', false);
})();
