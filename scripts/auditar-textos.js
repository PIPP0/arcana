/* Mide cuánto se parecen entre sí las lecturas con cartas distintas (esqueleto repetido).
   Uso: node scripts/auditar-textos.js            (compara la versión antigua con la actual)
   Un número alto en "parecido medio" o en "texto repetido" quiere decir que dos personas leerían casi lo mismo. */
global.window = {};
const R = require('path').resolve(__dirname, '..') + '/';
require(R + 'cards.js'); require(R + 'menores.js'); require(R + 'textos.js');
const C = window.ARCANA_DATA.CARTAS, T = window.ARCANA_TEXTOS;
const TIRADAS = { una: ['mensaje'], tiempo: ['pasado', 'presente', 'futuro'], perspectivas: ['situacion', 'desafio', 'posibilidad'] };
const de = (t) => (t.startsWith('el ') ? 'del ' + t.slice(3) : 'de ' + t), mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const quitar = (h) => h.replace(/<[^>]+>/g, ' ');

/* ---- versión antigua, tal como estaba antes de textos.js ---- */
const AMB = {
  general: ['en este momento de tu vida', 'tu día a día', 'en tu historia reciente'], amor: ['en tus vínculos', 'tus relaciones', 'en la historia de tus vínculos'],
  trabajo: ['en tu trabajo y tus proyectos', 'tu trabajo', 'en tu recorrido de trabajo'], crecimiento: ['en tu camino personal', 'tu propio crecimiento', 'en tu propio recorrido'],
  decisiones: ['frente a la decisión que tienes delante', 'esa decisión', 'en lo que te trajo hasta esta decisión'], libre: ['en aquello que preguntas', 'tu pregunta', 'en lo que hay detrás de tu pregunta']
};
function viejoRef(pos, k, tema) {
  const [en, a, pas] = AMB[tema];
  switch (pos) {
    case 'pasado': return `Mira hacia atrás, ${pas}: ¿en qué momento apareció ${k.hilo}? Esta carta no te pide volver ahí, sino reconocer qué de eso sigue contigo y qué ya puedes dejar donde está.`;
    case 'presente': return `Hoy, ${en}, la carta pone al centro ${k.hilo}. ${k.sombra} ¿Dónde lo has notado en estos días?`;
    case 'futuro': return `Nada está escrito, pero esta carta abre una posibilidad ${en}. ${k.luz} ¿Qué gesto pequeño, tuyo, la haría más probable?`;
    case 'situacion': return `${mayus(en)}, el punto de partida es ${k.hilo}. ¿Lo reconoces en lo que estás viviendo? ¿Qué nombre le pondrías tú?`;
    case 'desafio': return `${k.sombra} Llévalo a ${a}: ¿dónde te está pasando justo eso?`;
    case 'posibilidad': return `${k.luz} ${mayus(en)}, ¿cómo se vería eso en la práctica esta semana?`;
    default: return `${k.luz} Llévalo a ${a}: ¿qué cambiaría hoy si miraras las cosas desde ${k.hilo}?`;
  }
}
const viejoTema = {
  general: ['Esta lectura es una pausa para mirar el momento que estás viviendo.', 'No hay una respuesta correcta que encontrar aquí: quédate con la imagen que más te haya resonado.', ['Elige una sola frase de esta lectura y vuelve a ella durante el día.', 'Anota lo primero que pensaste al ver tus cartas, antes de leer nada.']],
  amor: ['Esta lectura mira tus vínculos: lo que das, lo que recibes y lo que esperas.', 'Las cartas hablan de tu mirada, no de lo que siente o hará otra persona. Eso solo se sabe conversando.', ['Piensa en una conversación pendiente y en qué te gustaría decir en ella.', 'Reconoce un gesto concreto que valoras en ese vínculo.']],
  trabajo: ['Esta lectura mira lo que haces y construyes: tus esfuerzos, tus dudas y tus ganas.', 'Toma esto como una mirada simbólica. Las decisiones laborales o de dinero merecen datos concretos y, si hace falta, consejo profesional.', ['Escribe el paso más pequeño que podrías dar esta semana.', 'Identifica qué parte de tu proyecto depende de ti y cuál no.']],
  crecimiento: ['Esta lectura mira tu propio camino: quién estás siendo y hacia dónde quieres crecer.', 'Crecer rara vez es lineal. Lo que hoy notas ya es parte del cambio.', ['Nombra un hábito pequeño que te acerque a quien quieres ser.', 'Reconoce algo en lo que ya cambiaste respecto de hace un año.']],
  decisiones: ['Esta lectura acompaña una decisión: no la toma por ti, pero puede ayudarte a mirarla mejor.', 'Las cartas no eligen por ti. Si la decisión es importante, date tiempo y conversa con alguien de confianza.', ['Escribe qué ganarías y qué soltarías con cada opción.', 'Pregúntate qué elegirías si nadie fuera a opinar.']],
  libre: ['Esta lectura parte de tu propia pregunta.', 'A veces lo más valioso de una lectura es descubrir que la pregunta era otra.', ['Vuelve a leer tu pregunta: ¿la harías igual ahora?', 'Anota qué carta te incomodó y por qué.']]
};
function viejo(ks, tir, tema) {
  const pos = TIRADAS[tir], VT = viejoTema[tema], h = ks.map((k) => k.hilo);
  let s = VT[0] + ' ' + ks.map((k, i) => `${k.esencia} ${k.claves} ${viejoRef(pos[i], k, tema)}`).join(' ');
  s += tir === 'una' ? ` ${ks[0].nombre} te deja una imagen para hoy: ${h[0]}.`
    : tir === 'tiempo' ? ` Leídas en orden, tus cartas trazan un recorrido: vienes ${de(h[0])}, hoy te encuentras con ${h[1]} y se abre, como posibilidad, ${h[2]}.`
      : ` Juntas, tus cartas muestran tres ángulos de lo mismo: la situación lleva la marca ${de(h[0])}, el desafío te pone ante ${h[1]} y la posibilidad apunta hacia ${h[2]}.`;
  if (ks.length > 1) s += ` ${ks[0].nombre} pone sobre la mesa ${ks[0].claves}; ${ks[1].nombre} lo atraviesa con ${ks[1].claves}; y ${ks[2].nombre} apunta hacia ${ks[2].claves}. No son tres mensajes sueltos: cada una cambia el sentido de la siguiente. ${ks[1].sombra} ${ks[2].luz} ¿Qué cambiaría si miraras ${ks[1].hilo} no como un obstáculo, sino como el puente hacia ${ks[2].hilo}?`;
  s += ` ${VT[1]} ${ks.map((k) => k.pregunta).join(' ')} ${VT[2].join(' ')}`;
  return s;
}
function nuevo(ks, tir, tema) {
  const pos = TIRADAS[tir], semilla = ks.map((k) => k.nombre).join('-') + tir;
  const refl = ks.map((k, i) => T.reflexion(pos[i], k, tema, semilla));
  let s = T.intro(tema, semilla) + ' ' + ks.map((k, i) => `${k.esencia} ${k.claves} ${refl[i]}`).join(' ');
  s += ' ' + T.sintesis(ks, tir, semilla) + ' ' + quitar(T.profundo(ks, tir, semilla, refl.join(' '))) + ' ' + T.cierre(tema, semilla);
  const pt = T.preguntaTema(tema, ks[Math.floor(ks.length / 2)].hilo, semilla);
  s += ' ' + ks.map((k) => k.pregunta).join(' ') + (pt ? ' ' + pt : '') + ' ' + T.acciones(tema, semilla).join(' ');
  return s;
}

/* ---- medición ---- */
let semilla = 12345; const rnd = () => { semilla = (semilla * 1664525 + 1013904223) >>> 0; return semilla / 4294967296; };
const sorteo = (n) => { const a = new Set(); while (a.size < n) a.add(Math.floor(rnd() * C.length)); return [...a].map((i) => C[i]); };
const shingles = (t) => { const w = t.toLowerCase().replace(/[^a-záéíóúñü\s]/g, ' ').split(/\s+/).filter(Boolean), s = new Set(); for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(' ')); return s; };
const jac = (a, b) => { let i = 0; a.forEach((x) => { if (b.has(x)) i++; }); return i / (a.size + b.size - i || 1); };
function medir(gen, nombre) {
  let sumaMedia = 0, sumaRep = 0, n = 0, peor = 0;
  Object.keys(TIRADAS).forEach((tir) => ['general', 'amor', 'trabajo', 'crecimiento', 'decisiones', 'libre'].forEach((tema) => {
    const L = [], vistos = new Set(); // solo combinaciones de cartas distintas: dos lecturas con las mismas cartas sí deben decir lo mismo
    while (L.length < (tir === 'una' ? 78 : 120)) { const ks = sorteo(TIRADAS[tir].length), id = ks.map((k) => k.nombre).join('|'); if (vistos.has(id)) continue; vistos.add(id); L.push(shingles(gen(ks, tir, tema))); }
    const cuenta = new Map(); L.forEach((s) => s.forEach((x) => cuenta.set(x, (cuenta.get(x) || 0) + 1)));
    let rep = 0, tot = 0; L.forEach((s) => s.forEach((x) => { tot++; if (cuenta.get(x) >= L.length * 0.25) rep++; }));
    let media = 0, m = 0, mx = 0;
    for (let i = 0; i < 400; i++) { const a = Math.floor(rnd() * L.length), b = Math.floor(rnd() * L.length); if (a === b) continue; const j = jac(L[a], L[b]); media += j; m++; if (j > mx) mx = j; }
    sumaMedia += media / m; sumaRep += rep / tot; n++; peor = Math.max(peor, mx);
  }));
  console.log(`${nombre}: parecido medio entre dos lecturas = ${(100 * sumaMedia / n).toFixed(1)} %  |  texto que se repite en 1 de cada 4 lecturas = ${(100 * sumaRep / n).toFixed(1)} %  |  pareja más parecida = ${(100 * peor).toFixed(0)} %`);
}
medir(viejo, 'ANTES '); medir(nuevo, 'AHORA ');

if (process.argv.includes('--frases')) {
  // las frases que más se repiten en un tipo de lectura (para saber qué variar)
  const tir = 'tiempo', tema = 'amor', L = [], vistos = new Set();
  while (L.length < 120) { const ks = sorteo(3), id = ks.map((k) => k.nombre).join('|'); if (vistos.has(id)) continue; vistos.add(id); L.push(shingles(nuevo(ks, tir, tema))); }
  const cuenta = new Map(); L.forEach((s) => s.forEach((x) => cuenta.set(x, (cuenta.get(x) || 0) + 1)));
  [...cuenta.entries()].filter((e) => e[1] >= 30).sort((a, b) => b[1] - a[1]).slice(0, 40).forEach((e) => console.log(e[1], e[0]));
}
