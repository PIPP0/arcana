# Conectar ARCANA con su nube (Firebase, plan gratuito)

Son unos 10 minutos, desde tu cuenta de Google. No se vincula ninguna tarjeta: el plan Spark no cobra nunca. Si algún día se pasa del límite diario, simplemente deja de anotar hasta el día siguiente.

1. **Crear el proyecto.** Entra a <https://console.firebase.google.com>, «Agregar proyecto», nómbralo `arcana`. Desactiva Google Analytics.
2. **Activar el acceso.** Compilación → Authentication → Comenzar → pestaña «Método de acceso»: activa **Google** (pon tu correo como correo de asistencia) y activa **Anónimo**. En «Configuración → Dominios autorizados» agrega `pipp0.github.io`.
3. **Crear la base de datos.** Compilación → Firestore Database → Crear base de datos → **modo producción** → ubicación `southamerica-east1` (São Paulo).
4. **Pegar las reglas.** En Firestore, pestaña «Reglas»: borra lo que haya, pega el contenido completo de `nube/firestore.rules` y pulsa «Publicar».
5. **Autorizar a quien administra.** En Firestore, pestaña «Datos» → «Iniciar colección» → ID de colección `config` → ID del documento `admin` → campo `correos`, tipo **array**, con el correo en minúsculas (por ejemplo `nombre@gmail.com`). Solo ese correo, entrando con Google, abrirá el panel.
6. **Obtener la configuración web.** Engranaje → «Configuración del proyecto» → «Tus apps» → icono web `</>` → registra la app (sin Hosting) → copia el objeto `firebaseConfig`.
7. **Pegarla en el sitio.** Abre `nube-config.js` y reemplaza `window.ARCANA_NUBE = null;` por `window.ARCANA_NUBE = { …lo que copiaste… };`. Pégalo directo en el archivo, no en el chat.
8. Avísame y publico el cambio. El panel queda en `/admin/`.

**Qué se mide y qué no.** Visitas anónimas (pasos recorridos, mazo, tema, tirada), lecturas completadas (cartas que salieron) y las fichas de quienes entran con Google. Nunca se guardan preguntas ni notas, ni se mide a quien tenga activado «no rastrear».
