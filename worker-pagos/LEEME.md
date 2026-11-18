# Pagos de ARCANA con Mercado Pago

Servidor: un Cloudflare Worker (gratis, sin tarjeta). Archivo: `mp-worker.js`.

## Cómo funciona
1. En ARCANA, «Suscribirme a Full/Premium» (con la sesión iniciada) pide al Worker el enlace de pago.
2. La persona paga en Mercado Pago (suscripción mensual en CLP: Full $3.990, Premium $6.990).
3. Mercado Pago avisa al Worker; este vuelve a consultar el estado real y sube el plan de la cuenta en Firestore
   (`personas/{uid}`: `perfil`, `porPago: true`, `mpId`). Al volver al sitio, ARCANA lo detecta sola.
4. Si la suscripción se cancela o se pausa, la cuenta baja a Free. Un plan asignado a mano desde el panel nunca se baja.
5. La persona también puede cancelar desde Mi perfil → «Cancelar suscripción».

## Direcciones desde las que se puede pagar
El Worker acepta `https://arcanatarot.cl`, `https://www.arcanatarot.cl` y, mientras exista, `https://pipp0.github.io`. Después del pago, la persona vuelve a la misma dirección desde la que pagó (lista `ORIGENES` en `mp-worker.js`).

## Despliegue (una vez, desde el panel de Cloudflare, sin wrangler)
1. Cloudflare → Workers & Pages → Create → Worker → pegar `mp-worker.js` completo → Deploy.
2. Settings → Variables and Secrets → tipo **Secret**:
   - `MP_ACCESS_TOKEN`: Access Token de Mercado Pago. Empieza con el de **prueba** (Credenciales de prueba).
   - `FIREBASE_SA`: el JSON completo de la clave de servicio de arcana-b1260
     (Firebase → Configuración del proyecto → Cuentas de servicio → Generar clave privada).
3. Copiar la URL del Worker y ponerla en `nube-config.js`: `window.ARCANA_PAGOS = 'https://….workers.dev';`
4. Publicar las reglas de `nube/firestore.rules` (incluyen la colección `pagos` y los campos `porPago`/`mpId`).
5. Probar con un comprador de prueba de Mercado Pago. Cuando todo funcione, cambiar `MP_ACCESS_TOKEN` por el de producción.

Las claves se pegan directamente en Cloudflare; nunca en un chat ni en un archivo del repositorio.
