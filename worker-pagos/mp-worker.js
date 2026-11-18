/*
 * ARCANA — Worker de Cloudflare: suscripciones con Mercado Pago.
 *
 * Qué hace
 *   POST /crear-suscripcion   { tier: 'full'|'premium', idToken }  → { init_point }  (la persona paga en Mercado Pago)
 *   POST /cancelar-suscripcion { idToken }                          → { ok: true }
 *   POST|GET /mp-webhook       aviso de Mercado Pago                → sube o baja el plan de la cuenta en Firestore
 *
 * Reglas de seguridad
 *   - Quien paga se identifica con su sesión de ARCANA (idToken de Firebase): el Worker la verifica, nadie puede
 *     pagar «a nombre de» otra cuenta.
 *   - El aviso (webhook) nunca se cree: siempre se vuelve a pedir a Mercado Pago el estado real de la suscripción.
 *   - Un plan asignado a mano desde el panel (porPago = false) nunca se baja por un aviso de pago.
 *
 * DESPLIEGUE (panel de Cloudflare, igual que el Worker de Cotizadía; sin wrangler)
 *   1. Cloudflare → Workers & Pages → Create → Worker → pega este archivo completo → Deploy.
 *   2. Settings → Variables and Secrets → agrega como «Secret» (nunca como texto plano):
 *        MP_ACCESS_TOKEN  Access Token de Mercado Pago (primero el de PRUEBA, después el de producción)
 *        FIREBASE_SA      el JSON completo de la clave de cuenta de servicio de Firebase del proyecto arcana-b1260
 *                         (Firebase → Configuración del proyecto → Cuentas de servicio → Generar clave privada)
 *   3. Copia la URL del Worker (https://….workers.dev) y pégala en nube-config.js: window.ARCANA_PAGOS = 'https://….workers.dev';
 *   4. No hay que configurar el webhook a mano: la notification_url va en cada suscripción que se crea.
 */

const PROYECTO = 'arcana-b1260';
const API_KEY_WEB = 'AIzaSyDDjucDQIW33H9MQaG5cecg-FOljQFa-04'; // clave pública de la app web (la misma de nube-config.js); no es un secreto
const ORIGEN_PERMITIDO = 'https://pipp0.github.io';
const VOLVER_A = 'https://pipp0.github.io/arcana/?pago=ok';

// Precios mensuales en CLP (deben coincidir con lo que se muestra en el sitio)
const PLAN_PRECIOS = { full: 3990, premium: 6990 };
const NOMBRE_PLAN = { full: 'Full', premium: 'Premium' };
const RANGO = { free: 0, full: 1, premium: 2 };

const FS = `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents`;

/* ---------- utilidades ---------- */
function conCors(resp) {
  resp.headers.set('Access-Control-Allow-Origin', ORIGEN_PERMITIDO);
  resp.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  resp.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return resp;
}
const json = (obj, status) => conCors(new Response(JSON.stringify(obj), { status: status || 200, headers: { 'Content-Type': 'application/json' } }));

const b64u = (s) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uBytes = (buf) => b64u(String.fromCharCode(...new Uint8Array(buf)));
function pemABuffer(pem) {
  const b = atob(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''));
  const a = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
  return a.buffer;
}

/* ---------- acceso de servidor a Firestore (cuenta de servicio) ---------- */
let cacheToken = null;
async function tokenServicio(env) {
  if (cacheToken && cacheToken.exp > Date.now() + 60000) return cacheToken.t;
  const sa = JSON.parse(env.FIREBASE_SA);
  const ahora = Math.floor(Date.now() / 1000);
  const cab = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const cuerpo = b64u(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: ahora, exp: ahora + 3600 }));
  const clave = await crypto.subtle.importKey('pkcs8', pemABuffer(sa.private_key), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const firma = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', clave, new TextEncoder().encode(cab + '.' + cuerpo));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + cab + '.' + cuerpo + '.' + b64uBytes(firma)
  });
  const d = await r.json();
  if (!r.ok || !d.access_token) throw new Error('token de servicio: ' + r.status);
  cacheToken = { t: d.access_token, exp: Date.now() + (d.expires_in || 3600) * 1000 };
  return cacheToken.t;
}
function dec(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('mapValue' in v) return decCampos(v.mapValue.fields || {});
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(dec);
  return null;
}
const decCampos = (f) => Object.keys(f).reduce((o, k) => { o[k] = dec(f[k]); return o; }, {});
function enc(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { mapValue: { fields: Object.keys(v).reduce((o, k) => { o[k] = enc(v[k]); return o; }, {}) } };
}
async function fsLeer(env, ruta) {
  const r = await fetch(`${FS}/${ruta}`, { headers: { Authorization: 'Bearer ' + (await tokenServicio(env)) } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('Firestore GET ' + ruta + ' -> ' + r.status);
  return decCampos((await r.json()).fields || {});
}
/* Escribe solo los campos indicados (updateMask). Con existe = true falla si el documento no existe. */
async function fsEscribir(env, ruta, datos, existe) {
  const llaves = Object.keys(datos);
  const q = llaves.map((k) => 'updateMask.fieldPaths=' + encodeURIComponent(k)).join('&') + (existe ? '&currentDocument.exists=true' : '');
  const r = await fetch(`${FS}/${ruta}?${q}`, {
    method: 'PATCH', headers: { Authorization: 'Bearer ' + (await tokenServicio(env)), 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: llaves.reduce((o, k) => { o[k] = enc(datos[k]); return o; }, {}) })
  });
  if (!r.ok) throw new Error('Firestore PATCH ' + ruta + ' -> ' + r.status);
}

/* ---------- Mercado Pago ---------- */
async function mp(env, metodo, ruta, carga) {
  const r = await fetch('https://api.mercadopago.com' + ruta, {
    method: metodo, headers: { Authorization: 'Bearer ' + env.MP_ACCESS_TOKEN, 'Content-Type': 'application/json' },
    body: carga ? JSON.stringify(carga) : undefined
  });
  const d = await r.json();
  if (!r.ok) throw new Error('MP ' + metodo + ' ' + ruta + ' -> ' + r.status + ': ' + JSON.stringify(d));
  return d;
}

/* ---------- quién es la persona (sesión de ARCANA) ---------- */
async function personaDeSesion(idToken) {
  if (!idToken || typeof idToken !== 'string') return null;
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + API_KEY_WEB, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken })
  });
  if (!r.ok) return null;
  const u = ((await r.json()).users || [])[0];
  if (!u || !u.localId || !u.email) return null; // las visitas anónimas no tienen correo: no pueden pagar
  return { uid: u.localId, email: String(u.email).toLowerCase() };
}

/* ---------- rutas ---------- */
async function crearSuscripcion(request, env) {
  let b; try { b = await request.json(); } catch (e) { return json({ error: 'cuerpo inválido' }, 400); }
  const tier = String((b && b.tier) || '');
  if (!PLAN_PRECIOS[tier]) return json({ error: 'plan inválido' }, 400);
  const yo = await personaDeSesion(b && b.idToken);
  if (!yo) return json({ error: 'sesión inválida: entra a tu cuenta e intenta de nuevo' }, 401);

  const persona = await fsLeer(env, 'personas/' + yo.uid);
  if (!persona) return json({ error: 'no encuentro tu ficha: abre Mi perfil y vuelve a intentar' }, 404);
  if (persona.porPago && persona.perfil === tier) return json({ error: 'ya tienes este plan' }, 409);

  const token = crypto.randomUUID();
  const referencia = 'arc_' + yo.uid + '_' + token;
  const host = new URL(request.url).host;
  try {
    await fsEscribir(env, 'pagos/' + token, { uid: yo.uid, tier, email: yo.email, estado: 'pendiente', creado: Date.now() });
    const s = await mp(env, 'POST', '/preapproval', {
      reason: 'ARCANA · Plan ' + NOMBRE_PLAN[tier],
      external_reference: referencia,
      payer_email: yo.email,
      auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: PLAN_PRECIOS[tier], currency_id: 'CLP' },
      back_url: VOLVER_A,
      notification_url: 'https://' + host + '/mp-webhook',
      status: 'pending'
    });
    await fsEscribir(env, 'pagos/' + token, { preapprovalId: s.id }, true);
    return json({ init_point: s.init_point || s.sandbox_init_point });
  } catch (e) {
    console.error('crear-suscripcion', e);
    return json({ error: 'no se pudo iniciar el pago, intenta de nuevo' }, 500);
  }
}

async function cancelarSuscripcion(request, env) {
  let b; try { b = await request.json(); } catch (e) { return json({ error: 'cuerpo inválido' }, 400); }
  const yo = await personaDeSesion(b && b.idToken);
  if (!yo) return json({ error: 'sesión inválida' }, 401);
  const persona = await fsLeer(env, 'personas/' + yo.uid);
  if (!persona || !persona.porPago || !persona.mpId) return json({ error: 'no tienes una suscripción pagada' }, 400);
  try {
    await mp(env, 'PUT', '/preapproval/' + persona.mpId, { status: 'cancelled' });
    await fsEscribir(env, 'personas/' + yo.uid, { perfil: 'free', porPago: false }, true);
    return json({ ok: true });
  } catch (e) {
    console.error('cancelar-suscripcion', e);
    return json({ error: 'no se pudo cancelar, intenta de nuevo' }, 500);
  }
}

async function webhook(request, env, url) {
  let cuerpo = {};
  try { cuerpo = await request.json(); } catch (e) { /* algunas notificaciones llegan solo con la URL */ }
  const id = (cuerpo.data && cuerpo.data.id) || url.searchParams.get('id') || url.searchParams.get('data.id');
  const tipo = cuerpo.type || url.searchParams.get('type') || url.searchParams.get('topic');
  if (!id || (tipo !== 'preapproval' && tipo !== 'subscription_preapproval')) return json({ ok: true });
  try {
    const info = await mp(env, 'GET', '/preapproval/' + encodeURIComponent(id)); // el estado real, no el que dice el aviso
    const partes = String(info.external_reference || '').split('_'); // arc_{uid}_{token}
    if (partes[0] !== 'arc' || partes.length < 3) return json({ ok: true });
    const token = partes[partes.length - 1], uid = partes.slice(1, -1).join('_');

    const pendiente = await fsLeer(env, 'pagos/' + token);
    if (!pendiente || pendiente.uid !== uid || !PLAN_PRECIOS[pendiente.tier]) return json({ ok: true });
    const monto = info.auto_recurring && Number(info.auto_recurring.transaction_amount);
    if (monto !== PLAN_PRECIOS[pendiente.tier]) return json({ ok: true }); // el monto cobrado debe ser el del plan

    const persona = await fsLeer(env, 'personas/' + uid);
    if (!persona) return json({ ok: true });
    await fsEscribir(env, 'pagos/' + token, { estado: info.status === 'authorized' ? 'activa' : info.status, mpStatus: info.status, actualizado: Date.now() }, true);

    if (info.status === 'authorized') {
      // un plan asignado a mano y más alto no se baja por un pago de un plan menor
      const manualMayor = !persona.porPago && (RANGO[persona.perfil] || 0) > (RANGO[pendiente.tier] || 0);
      if (!manualMayor) await fsEscribir(env, 'personas/' + uid, { perfil: pendiente.tier, porPago: true, mpId: String(info.id) }, true);
    } else if ((info.status === 'cancelled' || info.status === 'paused') && persona.porPago && persona.mpId === String(info.id)) {
      await fsEscribir(env, 'personas/' + uid, { perfil: 'free', porPago: false }, true);
    }
  } catch (e) {
    // no relanzar: si respondemos distinto de 2xx, Mercado Pago reintenta la notificación sin parar
    console.error('mp-webhook', e);
  }
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return conCors(new Response(null, { status: 204 }));
    if (url.pathname === '/crear-suscripcion' && request.method === 'POST') return crearSuscripcion(request, env);
    if (url.pathname === '/cancelar-suscripcion' && request.method === 'POST') return cancelarSuscripcion(request, env);
    if (url.pathname === '/mp-webhook' && (request.method === 'POST' || request.method === 'GET')) return webhook(request, env, url);
    if (url.pathname === '/') return json({ ok: true, servicio: 'arcana-pagos' });
    return json({ error: 'no encontrado' }, 404);
  }
};
