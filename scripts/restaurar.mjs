/* Restaura un respaldo de ARCANA (el archivo ya descifrado) a Firestore.
   Por seguridad NO escribe nada si no le pasas --aplicar: primero muestra qué haría. Nunca borra documentos.
   Uso:  FIREBASE_SA="$(cat clave.json)" node scripts/restaurar.mjs respaldo.json            (solo muestra)
         FIREBASE_SA="$(cat clave.json)" node scripts/restaurar.mjs respaldo.json --aplicar  (escribe)
   Opcional: --solo personas   restaura únicamente esa colección. */
import { readFileSync } from 'node:fs';
import { PROYECTO, tokenServicio } from './respaldo.mjs';

const FS = `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents`;
const [, , archivo, ...flags] = process.argv;
const aplicar = flags.includes('--aplicar');
const solo = flags.includes('--solo') ? flags[flags.indexOf('--solo') + 1] : null;
if (!archivo || !process.env.FIREBASE_SA) { console.error('Uso: FIREBASE_SA="$(cat clave.json)" node scripts/restaurar.mjs respaldo.json [--aplicar] [--solo coleccion]'); process.exit(2); }

const r = JSON.parse(readFileSync(archivo, 'utf8'));
if (r.app !== 'arcana' || r.proyecto !== PROYECTO) { console.error('Ese archivo no es un respaldo de ARCANA (' + PROYECTO + ').'); process.exit(2); }
const token = aplicar ? await tokenServicio(JSON.parse(process.env.FIREBASE_SA)) : null;
let n = 0;
for (const [col, docs] of Object.entries(r.colecciones)) {
  if (solo && col !== solo) continue;
  for (const d of docs) {
    n++;
    if (!aplicar) { console.log(`[simulación] ${col}/${d.id}`); continue; }
    const res = await fetch(`${FS}/${col}/${d.id}`, { method: 'PATCH', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: d.fields }) });
    if (!res.ok) { console.error(`FALLÓ ${col}/${d.id} (${res.status})`); process.exit(1); }
  }
}
console.log(aplicar ? `Restaurados ${n} documentos (respaldo del ${r.fecha}).` : `Simulación: se restaurarían ${n} documentos (respaldo del ${r.fecha}). Agrega --aplicar para escribir.`);
