/* Respaldo de ARCANA: copia cuentas, planes, pagos y configuración de Firestore a un archivo JSON.
   Lo corre GitHub cada día (.github/workflows/respaldo.yml) y lo guarda CIFRADO. No incluye las visitas ni las
   lecturas (son anónimas y numerosas) ni preguntas ni notas (nunca se guardan en la nube).
   Uso local:  FIREBASE_SA="$(cat clave.json)" node scripts/respaldo.mjs respaldo.json */
import { webcrypto } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const PROYECTO = 'arcana-b1260';
export const COLECCIONES = ['personas', 'pagos', 'config', 'sistema'];
const FS = `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents`;

const b64u = (s) => Buffer.from(s).toString('base64url');
export async function tokenServicio(sa, fetchFn = fetch) {
  const ahora = Math.floor(Date.now() / 1000);
  const cab = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const cuerpo = b64u(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: ahora, exp: ahora + 3600 }));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const clave = await webcrypto.subtle.importKey('pkcs8', Buffer.from(pem, 'base64'), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const firma = Buffer.from(await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5', clave, new TextEncoder().encode(cab + '.' + cuerpo))).toString('base64url');
  const r = await fetchFn('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + cab + '.' + cuerpo + '.' + firma });
  const d = await r.json();
  if (!r.ok || !d.access_token) throw new Error('No se pudo obtener el acceso de servicio (' + r.status + ')');
  return d.access_token;
}

export async function respaldar({ sa, fetchFn = fetch }) {
  const token = await tokenServicio(sa, fetchFn);
  const salida = { app: 'arcana', version: 1, proyecto: PROYECTO, fecha: new Date().toISOString(), colecciones: {} };
  for (const col of COLECCIONES) {
    const docs = []; let pagina = '';
    do {
      const r = await fetchFn(`${FS}/${col}?pageSize=300${pagina ? '&pageToken=' + encodeURIComponent(pagina) : ''}`, { headers: { Authorization: 'Bearer ' + token } });
      if (r.status === 404) break;
      if (!r.ok) throw new Error(`No se pudo leer ${col} (${r.status})`);
      const d = await r.json();
      (d.documents || []).forEach((x) => docs.push({ id: x.name.split('/').pop(), fields: x.fields || {} }));
      pagina = d.nextPageToken || '';
    } while (pagina);
    salida.colecciones[col] = docs;
  }
  // comprobaciones de cordura: un respaldo vacío o sin la lista de administradores no sirve y debe dar alarma
  const cfg = salida.colecciones.config || [];
  if (!cfg.some((x) => x.id === 'admin')) throw new Error('El respaldo no trae config/admin: algo anda mal con el acceso o con la base de datos');
  return salida;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.env.FIREBASE_SA) { console.error('Falta el secreto FIREBASE_SA (la clave de servicio de Firebase).'); process.exit(2); }
  const destino = process.argv[2] || 'respaldo.json';
  try {
    const r = await respaldar({ sa: JSON.parse(process.env.FIREBASE_SA) });
    writeFileSync(destino, JSON.stringify(r));
    console.log('Respaldo listo:', Object.entries(r.colecciones).map(([k, v]) => `${k}=${v.length}`).join(' · '));
  } catch (e) { console.error('RESPALDO FALLÓ:', e.message); process.exit(1); }
}
