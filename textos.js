/* ARCANA — textos de las lecturas, separados del resto para poder revisarlos y probarlos solos.
   Todo se elige de forma determinista a partir de las cartas de la lectura: la misma lectura siempre dice lo mismo,
   pero dos lecturas con cartas distintas no comparten el mismo esqueleto. Se mide con scripts/auditar-textos.js. */
(function () {
  'use strict';

  const TEMAS = [
    { id: 'general', nombre: 'Reflexión general',
      intro: ['Esta lectura es una pausa para mirar el momento que estás viviendo.',
        'Tómate un respiro: estas cartas no predicen nada, solo te muestran lo que vives desde otros ángulos.',
        'Antes de leer, respira una vez. Lo que sigue es una invitación a mirar tu momento actual con más calma.'],
      cierre: ['No hay una respuesta correcta que encontrar aquí: quédate con la imagen que más te haya resonado.',
        'Si de todo esto solo te llevas una idea, que sea la que sentiste primero. Esa suele ser la importante.',
        'Estas cartas son un espejo, no un veredicto. Vuelve a ellas cuando quieras mirarte de nuevo.'],
      acciones: ['Elige una sola frase de esta lectura y vuelve a ella durante el día.', 'Anota lo primero que pensaste al ver tus cartas, antes de leer nada.',
        'Cuéntale a alguien de confianza qué carta te llamó más la atención.', 'Dedica cinco minutos esta noche a escribir cómo te sientes con lo que leíste.',
        'Elige un objeto o un gesto del día que te recuerde esta lectura.', 'Observa mañana en qué momento aparece lo que hoy leíste.'] },
    { id: 'amor', nombre: 'Amor y relaciones',
      intro: ['Esta lectura mira tus vínculos: lo que das, lo que recibes y lo que esperas.',
        'Esta lectura se acerca a tus relaciones con cariño: lo que ofreces, lo que necesitas y lo que todavía no has dicho.',
        'Las cartas hablan hoy de tus vínculos. Léelas pensando en una relación concreta, sin buscar respuestas sobre la otra persona.'],
      cierre: ['Las cartas hablan de tu mirada, no de lo que siente o hará otra persona. Eso solo se sabe conversando.',
        'Las relaciones se construyen conversando. Si algo resonó, ese es un buen punto de partida para una conversación real.',
        'Esta lectura habla de lo tuyo: lo que sientes y lo que puedes hacer. Lo del otro lado solo se sabe preguntando.'],
      acciones: ['Piensa en una conversación pendiente y en qué te gustaría decir en ella.', 'Reconoce un gesto concreto que valoras en ese vínculo.',
        'Escribe qué necesitas pedir en una relación y todavía no has pedido.', 'Haz hoy un gesto de cariño pequeño, sin esperar nada a cambio.',
        'Pregúntate qué parte de lo que sientes es tuya y qué parte es expectativa.', 'Agradece por escrito algo que alguien cercano hizo por ti.'] },
    { id: 'trabajo', nombre: 'Trabajo y proyectos',
      intro: ['Esta lectura mira lo que haces y construyes: tus esfuerzos, tus dudas y tus ganas.',
        'Esta lectura se asoma a tu trabajo y tus proyectos: dónde pones energía, dónde dudas y qué quieres construir.',
        'Mira estas cartas como un espejo de tu momento profesional: no dan órdenes, ayudan a ordenar ideas.'],
      cierre: ['Toma esto como una mirada simbólica. Las decisiones laborales o de dinero merecen datos concretos y, si hace falta, consejo profesional.',
        'Toma lo que te sirva y deja lo demás: una lectura simbólica no reemplaza datos, números ni asesoría profesional.',
        'Lo laboral y lo económico se decide con información concreta. Usa estas cartas para ordenar ideas, no para reemplazarla.'],
      acciones: ['Escribe el paso más pequeño que podrías dar esta semana.', 'Identifica qué parte de tu proyecto depende de ti y cuál no.',
        'Anota qué te da energía y qué te la quita en tu trabajo esta semana.', 'Elige una tarea pendiente y define cuándo, exactamente, la harás.',
        'Pide una opinión concreta a alguien que conozca tu trabajo.', 'Revisa tus tiempos de descanso: ¿alcanzan para sostener lo que te propones?'] },
    { id: 'crecimiento', nombre: 'Crecimiento personal',
      intro: ['Esta lectura mira tu propio camino: quién estás siendo y hacia dónde quieres crecer.',
        'Esta lectura te acompaña en tu proceso personal: lo que ya cambió, lo que está cambiando y lo que viene.',
        'Un momento para conversar contigo: las cartas muestran cómo estás creciendo, a tu propio ritmo.'],
      cierre: ['Crecer rara vez es lineal. Lo que hoy notas ya es parte del cambio.',
        'Cada persona crece a su ritmo. Lo que hoy te incomoda de esta lectura probablemente es lo que más quiere moverse.',
        'No tienes que cambiar todo hoy. Un gesto pequeño y sostenido pesa más que una gran promesa.'],
      acciones: ['Nombra un hábito pequeño que te acerque a quien quieres ser.', 'Reconoce algo en lo que ya cambiaste respecto de hace un año.',
        'Escribe una frase amable que te dirías ante un error.', 'Elige algo que vienes postergando y dale quince minutos hoy.',
        'Pregúntate qué te gustaría que fuera distinto en seis meses y qué paso ya depende de ti.', 'Cuéntale una conclusión de esta lectura a alguien que te conozca bien.'] },
    { id: 'decisiones', nombre: 'Decisiones',
      intro: ['Esta lectura acompaña una decisión: no la toma por ti, pero puede ayudarte a mirarla mejor.',
        'Frente a una decisión, estas cartas no te dicen qué elegir; te ayudan a ver qué pesa más en ti.',
        'Antes de decidir, mira tu situación desde varios lados. Esta lectura te da esas miradas, no la respuesta.'],
      cierre: ['Las cartas no eligen por ti. Si la decisión es importante, date tiempo y conversa con alguien de confianza.',
        'Una decisión importante merece tiempo y buena información. Usa esta lectura para escucharte mejor, no para elegir por ti.',
        'Si dudas, conversa con alguien de confianza. Las cartas ayudan a ordenar lo que sientes; la decisión sigue siendo tuya.'],
      acciones: ['Escribe qué ganarías y qué soltarías con cada opción.', 'Pregúntate qué elegirías si nadie fuera a opinar.',
        'Anota qué es lo peor que podría pasar con cada opción y cuánto podrías manejarlo.', 'Ponte un plazo para decidir y escríbelo.',
        'Conversa la decisión con alguien que te quiera y no tenga interés en el resultado.', 'Imagina cómo te sentirías mañana si ya hubieras elegido cada opción.'] },
    { id: 'libre', nombre: 'Pregunta libre',
      intro: ['Esta lectura parte de tu propia pregunta.',
        'Tu pregunta es el centro de esta lectura: las cartas la miran desde distintos ángulos sin responderla por ti.',
        'Parte por tu pregunta y deja que cada carta la ilumine de una forma distinta.'],
      cierre: ['A veces lo más valioso de una lectura es descubrir que la pregunta era otra.',
        'Puede que tu pregunta cambie después de esta lectura. Eso también es una respuesta.',
        'Quédate con la pregunta que ahora te parezca más verdadera, aunque no sea la que traías.'],
      acciones: ['Vuelve a leer tu pregunta: ¿la harías igual ahora?', 'Anota qué carta te incomodó y por qué.',
        'Reescribe tu pregunta con otras palabras y mira si cambia.', 'Anota qué carta te dio paz y cuál te inquietó.',
        'Vuelve a esta lectura en una semana y compara.', 'Cuéntale tu pregunta a alguien cercano, sin las cartas, y escucha qué te responde.'] }
  ];

  const AMBITO = {
    general: { en: 'en este momento de tu vida', a: 'tu día a día', pas: 'en tu historia reciente' },
    amor: { en: 'en tus vínculos', a: 'tus relaciones', pas: 'en la historia de tus vínculos' },
    trabajo: { en: 'en tu trabajo y tus proyectos', a: 'tu trabajo', pas: 'en tu recorrido de trabajo' },
    crecimiento: { en: 'en tu camino personal', a: 'tu propio crecimiento', pas: 'en tu propio recorrido' },
    decisiones: { en: 'frente a la decisión que tienes delante', a: 'esa decisión', pas: 'en lo que te trajo hasta esta decisión' },
    libre: { en: 'en aquello que preguntas', a: 'tu pregunta', pas: 'en lo que hay detrás de tu pregunta' }
  };

  /* ---- utilidades ---- */
  const mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const de = (t) => (t.startsWith('el ') ? 'del ' + t.slice(3) : 'de ' + t);
  const al = (t) => (t.startsWith('el ') ? 'al ' + t.slice(3) : 'a ' + t);
  const claves = (k) => k.claves.split(' · ').map((x) => x.toLowerCase());
  const primera = (t) => { const i = t.indexOf('. '); return i < 0 ? t : t.slice(0, i + 1); };
  const resto = (t) => { const i = t.indexOf('. '); return i < 0 ? '' : t.slice(i + 2); };
  // número estable a partir de texto (FNV-1a): misma lectura, mismas variantes
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const elige = (arr, semilla, sal) => arr[hash(semilla + '|' + sal) % arr.length];
  // dos elementos distintos
  function eligeDos(arr, semilla, sal) { const a = hash(semilla + '|' + sal) % arr.length; let b = hash(semilla + '|' + sal + 'b') % arr.length; if (b === a) b = (a + 1 + (hash(semilla + sal + 'c') % (arr.length - 1))) % arr.length; return [arr[a], arr[b]]; }

  /* ---- una carta en su posición ---- */
  function reflexion(pos, k, tema, semilla) {
    const A = AMBITO[tema] || AMBITO.general, [c1, c2] = [claves(k)[0], claves(k)[1] || claves(k)[0]], p1 = primera(k.esencia);
    const V = {
      pasado: [
        `Mira hacia atrás, ${A.pas}: ¿cuándo notaste por primera vez ${k.hilo}? Esta carta no te pide volver ahí, sino reconocer qué de eso sigue contigo y qué ya puedes dejar donde está.`,
        `En tu pasado, ${A.pas}, quedó una huella de ${c1} y ${c2}. ¿Qué de eso sigues cargando, y qué ya cumplió su tiempo?`,
        `Lo que te trajo hasta aquí tuvo ${c1} como sello. ${k.luz} Mira ese tramo con gratitud, no con juicio.`,
        `Piensa en ${A.pas}. Ya había rastros ${de(k.hilo)}, aunque todavía no tuvieran nombre. ¿Qué te enseñaron, y qué te habría gustado saber entonces?`
      ],
      presente: [
        `Hoy, ${A.en}, la carta pone al centro ${k.hilo}. ${k.sombra} ¿Dónde lo has notado en estos días?`,
        `Lo que está vivo ahora ${A.en} es ${c1}, con ${c2} de fondo. ¿Cómo se nota en lo que decides esta semana?`,
        `Ahora mismo, ${A.en}, la imagen es esta: ${k.hilo}. ${k.sombra}`,
        `El momento que vives ${A.en} tiene un tono: ${k.hilo}. ${k.luz} ¿Qué cambiaría hoy si lo tomaras en serio?`
      ],
      futuro: [
        `Nada está escrito, pero esta carta abre una posibilidad ${A.en}. ${k.luz} ¿Qué gesto pequeño, tuyo, la haría más probable?`,
        `Hacia adelante, la carta apunta ${al(k.hilo)}. No es una promesa, es una dirección posible ${A.en}. ¿Qué paso de esta semana te acercaría?`,
        `${mayus(c1)} y ${c2} son lo que esta carta te propone cultivar ${A.en}. ${k.luz}`,
        `Si miras hacia adelante ${A.en}, lo que podría abrirse tiene que ver con ${k.hilo}. ${k.sombra} Decirlo en voz alta ya ayuda a prepararlo.`
      ],
      situacion: [
        `${mayus(A.en)}, el punto de partida está en ${k.hilo}. ¿Lo reconoces en lo que estás viviendo? ¿Qué nombre le pondrías tú?`,
        `${mayus(A.en)}, tu terreno de hoy se compone de ${c1} y ${c2}. ¿Qué parte te resulta más familiar?`,
        `Para entender tu situación ${A.en}, empieza por ${k.hilo}. ¿Qué parte de esto ya sabías y qué parte te sorprende?`
      ],
      desafio: [
        `${k.sombra} Llévalo a ${A.a}: ¿dónde te está pasando justo eso?`,
        `Lo que tienes enfrente: ${k.hilo}. ${k.sombra} No es un defecto: es el punto donde esta carta te pide atención ${A.en}.`,
        `${mayus(A.en)}, el obstáculo no es la carta sino cómo la vives. ${k.sombra} ¿Qué harías distinto si lo notaras a tiempo?`
      ],
      posibilidad: [
        `${k.luz} ${mayus(A.en)}, ¿cómo se vería eso en la práctica esta semana?`,
        `Lo que se abre tiene que ver con ${k.hilo}. ${k.luz} Elige un gesto pequeño y repítelo tres días.`,
        `${mayus(c1)} y ${c2}: ahí está la puerta. ${k.luz} ¿Qué te falta para cruzarla ${A.en}?`
      ],
      mensaje: [
        `${k.luz} Llévalo a ${A.a}: ¿qué cambiaría hoy si miraras las cosas desde ${k.hilo}?`,
        `Para ${A.a}, hoy quédate con una sola palabra: ${c1}. ${k.luz}`,
        `Una sola imagen para ${A.a}: ${k.hilo}. ${k.luz} ¿Cómo se vería hoy, en algo pequeño?`
      ]
    };
    return elige(V[pos] || V.mensaje, semilla + k.nombre, 'r' + pos + tema);
  }

  /* ---- varias cartas juntas ---- */
  function sintesis(ks, tid, semilla) {
    const h = ks.map((k) => k.hilo); let s;
    if (tid === 'una' || ks.length === 1) s = elige([
      `${ks[0].nombre} te deja una imagen para hoy: ${h[0]}.`,
      `Esta carta trae a tu día ${h[0]}. Quédate con eso mientras dure.`,
      `Una sola carta, un solo tono: ${h[0]}. Es suficiente para mirar tu día con otros ojos.`], semilla, 's1');
    else if (tid === 'tiempo') s = elige([
      `Leídas en orden, tus cartas trazan un recorrido: vienes ${de(h[0])}, hoy te encuentras con ${h[1]} y miras, como posibilidad, hacia ${h[2]}.`,
      `Tu recorrido, en tres tiempos: en el pasado, ${h[0]}; hoy, ${h[1]}; y como posibilidad, ${h[2]}.`,
      `Tres momentos, un mismo hilo: primero ${h[0]}, después ${h[1]} y al final ${h[2]}. Léelos juntos: cada uno ayuda a entender el siguiente.`], semilla, 's3t');
    else s = elige([
      `Juntas, tus cartas muestran tres ángulos de lo mismo: la situación lleva la marca ${de(h[0])}, el desafío te pone ante ${h[1]} y la posibilidad apunta hacia ${h[2]}.`,
      `Mirado desde tres lados: la situación trae ${h[0]}; el desafío pasa por ${h[1]}; y la posibilidad apunta ${al(h[2])}.`,
      `Las tres cartas se contestan entre sí. Dónde estás: ${h[0]}. Lo que se atraviesa: ${h[1]}. Hacia dónde puedes ir: ${h[2]}.`], semilla, 's3p');
    if (ks.length > 1) {
      const may = ks.filter((k) => !k.palo).length, palos = ks.filter((k) => k.palo).map((k) => k.palo);
      const rep = palos.find((p, i) => palos.indexOf(p) !== i);
      const SENT = { Bastos: 'la acción y las ganas', Copas: 'los afectos', Espadas: 'las ideas y las palabras', Oros: 'lo concreto y cotidiano' };
      if (may === ks.length) s += elige([' Las tres son arcanos mayores: la lectura habla de temas de fondo más que de asuntos del día a día.', ' Salieron tres arcanos mayores: es una lectura de asuntos profundos, de esos que se piensan con calma.'], semilla, 'm');
      else if (may === 0 && rep) s += elige([` Se repite el palo de ${rep}: el acento está en ${SENT[rep]}.`, ` Dos cartas son de ${rep}: la lectura insiste en ${SENT[rep]}.`], semilla, 'p');
      else if (may === 0) s += ' Son todas arcanos menores: la lectura se mueve en lo cotidiano, en gestos y situaciones concretas.';
    }
    return s;
  }

  /* lo que une a las cartas: se arma con lo que dice cada una */
  function profundo(ks, tid, semilla, usado) {
    usado = usado || '';
    const nuevo = (t) => !usado.includes(t);
    const cl = (k) => { const a = claves(k); return a.length > 1 ? `${a[0]} y ${a[1]}` : a[0]; };
    if (ks.length === 1) return `<p><b>Lo que esta carta te pide mirar.</b> ${ks[0].nombre} habla de ${cl(ks[0])}.${nuevo(ks[0].luz) ? ' ' + ks[0].luz : ''}${nuevo(ks[0].sombra) ? ' ' + ks[0].sombra : ''}</p>`;
    const [a, b, c] = ks;
    const une = elige([
      `${a.nombre} pone sobre la mesa ${cl(a)}; ${b.nombre} lo atraviesa con ${cl(b)}; y ${c.nombre} apunta hacia ${cl(c)}. No son tres mensajes sueltos: cada una cambia el sentido de la siguiente.`,
      `Empieza con ${cl(a)} (${a.nombre}), pasa por ${cl(b)} (${b.nombre}) y termina en ${cl(c)} (${c.nombre}). Léelas como una sola frase en tres partes.`,
      `${cl(a)}, ${cl(b)}, ${cl(c)}: esas tres palabras clave dibujan tu lectura. ${a.nombre} abre, ${b.nombre} mueve y ${c.nombre} orienta.`], semilla, 'u');
    const q = tid === 'tiempo'
      ? elige([`¿Qué ${de(a.hilo)} quieres llevar contigo hacia ${c.hilo}, y qué prefieres soltar por el camino?`, `Si lo de hoy es ${b.hilo}, ¿qué te gustaría estar haciendo cuando te acerques ${al(c.hilo)}?`, `¿Qué conversación tendrías con tu yo del pasado sobre ${a.hilo}, ahora que miras hacia ${c.hilo}?`], semilla, 'qt')
      : elige([`¿Qué cambiaría si miraras ${b.hilo} no como un obstáculo, sino como el puente hacia ${c.hilo}?`, `Si tu punto de partida es ${a.hilo}, ¿qué primer paso te acerca ${al(c.hilo)}?`, `¿Qué parte ${de(b.hilo)} puedes atravesar hoy, aunque sea un poco?`], semilla, 'qp');
    return `<p><b>Lo que une a tus cartas.</b> ${une}</p>${nuevo(b.sombra) ? `<p><b>Lo que pide atención.</b> ${b.sombra}</p>` : ''}${nuevo(c.luz) ? `<p><b>Lo que te invita.</b> ${c.luz}</p>` : ''}<p><b>Para llevarte.</b> ${q}</p>`;
  }

  const PREG_TEMA = {
    amor: (h) => [`¿Qué lugar le das ${al(h)} en la forma en que te vinculas?`, `¿Cómo se ve ${h} en tus relaciones más cercanas?`, `Si tuvieras que expresar ${h} con un gesto hacia alguien que quieres, ¿cuál sería?`],
    trabajo: (h) => [`¿Dónde aparece ${h} en tu trabajo, y qué harías distinto si lo tomaras en serio?`, `¿Qué parte de tu trabajo se parece hoy ${al(h)}?`, `Si tu proyecto pudiera hablar, ¿qué diría sobre ${h}?`],
    crecimiento: (h) => [`¿Qué descubres sobre quien estás siendo cuando miras ${h}?`, `¿Cuándo fue la última vez que viviste ${h}, y qué cambió en ti?`, `¿Qué parte de ti pide más espacio para ${h}?`],
    decisiones: (h) => [`Si eligieras desde ${h}, ¿qué opción tomarías?`, `¿Qué opción de tu decisión se parece más ${al(h)}, y cuál se le opone?`, `¿Qué necesitas saber de ti para decidir con ${h} como guía?`]
  };
  const preguntaTema = (tema, h, semilla) => (PREG_TEMA[tema] ? elige(PREG_TEMA[tema](h), semilla, 'pt' + tema) : null);

  const tema = (id) => TEMAS.find((t) => t.id === id) || TEMAS[0];
  window.ARCANA_TEXTOS = {
    TEMAS, tema, reflexion, sintesis, profundo, preguntaTema,
    intro: (id, semilla) => elige(tema(id).intro, semilla, 'i' + id),
    cierre: (id, semilla) => elige(tema(id).cierre, semilla, 'c' + id),
    acciones: (id, semilla) => eligeDos(tema(id).acciones, semilla, 'a' + id),
    primera, resto, mayus, hash
  };
})();
