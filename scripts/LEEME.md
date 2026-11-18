# Vigilancia, respaldo y recuperación de ARCANA

Todo corre gratis en GitHub Actions y en el Worker de Cloudflare. No hay servicios de pago.

## 1. Vigilancia (cada 15 minutos) — no necesita nada de ti
`.github/workflows/vigilancia.yml` ejecuta `scripts/vigilar.sh`. Comprueba:
- la portada, el código principal y las imágenes en https://arcanatarot.cl
- que `www` responda y que el certificado HTTPS no esté por vencer (alerta a menos de 10 días)
- que el DNS apunte a GitHub Pages
- que Firestore responda y sus reglas sigan publicadas
- el servidor de pagos y que la conciliación diaria haya corrido en las últimas 36 horas (solo si ya está configurado)

Si algo falla, el trabajo queda en rojo y **GitHub te avisa por correo**. Para recibirlo: GitHub → Settings → Notifications → «Actions» → marca «Send notifications for failed workflows only» y «Email».
Se puede lanzar a mano desde la pestaña Actions → Vigilancia → Run workflow.

## 2. Conciliación diaria de pagos (Worker de Cloudflare)
El Worker repara avisos de pago que se hayan perdido: sube a quien pagó y no figuraba, y baja a quien canceló. Deja el resultado en `sistema/estado`, que la vigilancia revisa.
Para activarla, una sola vez: Cloudflare → Workers & Pages → tu Worker → Settings → **Triggers → Cron Triggers → Add** → `17 7 * * *` (una vez al día).

## 3. Respaldo diario cifrado
`.github/workflows/respaldo.yml` copia `personas`, `pagos`, `config` y `sistema` y guarda el archivo **cifrado** durante 30 días (pestaña Actions → la última ejecución → Artifacts). No incluye visitas ni lecturas (anónimas) ni preguntas ni notas (nunca se guardan en la nube).

Para activarlo, una vez, desde tu terminal (los secretos no pasan por el chat):
1. Firebase → Configuración del proyecto → **Cuentas de servicio** → **Generar clave privada**. Se descarga un `.json`.
2. Súbela a GitHub sin abrirla:
   `gh secret set FIREBASE_SA --repo PIPP0/arcana < ~/Downloads/NOMBRE-DE-LA-CLAVE.json`
3. Inventa una frase larga y guárdala en tu gestor de contraseñas. Súbela:
   `gh secret set RESPALDO_CLAVE --repo PIPP0/arcana`  (te pide el valor; pégalo ahí)
4. Borra el `.json` de Descargas. **La frase de cifrado es la única forma de abrir los respaldos: si la pierdes, no se pueden leer.**
5. Prueba: Actions → Respaldo → Run workflow.

## Cómo recuperar
1. Descarga el artefacto `respaldo-arcana-N` desde Actions y descífralo:
   `openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in respaldo.json.enc -out respaldo.json`
2. Simula (no escribe nada): `FIREBASE_SA="$(cat clave.json)" node scripts/restaurar.mjs respaldo.json`
3. Aplica: `FIREBASE_SA="$(cat clave.json)" node scripts/restaurar.mjs respaldo.json --aplicar`
   (`--solo personas` restaura una sola colección; nunca borra documentos.)

## Si hay un problema con los cobros
Admin → Funciones → apaga **«Cobros (botón Suscribirme)»**. Nadie podrá iniciar pagos nuevos (ni desde el sitio ni por el servidor), y los planes ya pagados no se tocan. Puedes dejar un aviso en la franja superior del sitio con «Aviso del sitio».
