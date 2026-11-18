#!/usr/bin/env bash
# Vigilancia de ARCANA. La corre GitHub cada 15 minutos (.github/workflows/vigilancia.yml).
# Si algo falla, el trabajo termina en error y GitHub te avisa por correo. No usa ningún secreto.
set -u
SITIO="${SITIO:-https://arcanatarot.cl}"
PROYECTO="${PROYECTO:-arcana-b1260}"
FS="https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents"
TMP="$(mktemp -d)"
fallos=0
resumen=""

ok()   { echo "OK    $1"; }
mal()  { echo "FALLA $1"; fallos=$((fallos + 1)); resumen="${resumen}\n- $1"; }
aviso(){ echo "AVISO $1"; }

# Pide una dirección hasta 3 veces (una falla de red suelta no debe dar falsa alarma). Deja el cuerpo en $TMP/cuerpo.
pedir() {
  local c="000" i
  for i in 1 2 3; do
    c="$(curl -s -o "$TMP/cuerpo" -w "%{http_code}" --max-time 20 "$1" 2>/dev/null || echo 000)"
    case "$c" in 000|5??) sleep 8 ;; *) break ;; esac
  done
  echo "$c"
}

# 1) La portada responde y es ARCANA
c="$(pedir "$SITIO/")"
if [ "$c" = "200" ] && grep -q "ARCANA" "$TMP/cuerpo"; then ok "Portada ($SITIO) responde 200"; else mal "La portada $SITIO no responde bien (código $c)"; fi

# 2) El código principal y una imagen cargan
ver="$(grep -o 'app.js?v=[0-9]*' "$TMP/cuerpo" | head -1)"
c="$(pedir "$SITIO/${ver:-app.js}")"
if [ "$c" = "200" ] && [ "$(wc -c < "$TMP/cuerpo")" -gt 5000 ]; then ok "Código principal ($ver) carga"; else mal "No carga el código principal (código $c)"; fi
c="$(pedir "$SITIO/img/rws/00.webp")"
if [ "$c" = "200" ]; then ok "Imágenes de los mazos cargan"; else mal "No cargan las imágenes de los mazos (código $c)"; fi

# 3) www lleva al dominio principal
c="$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 "https://www.${SITIO#https://}/" 2>/dev/null || echo 000)"
case "$c" in 200|301|302) ok "www responde ($c)";; *) mal "www no responde bien (código $c)";; esac

# 4) El certificado HTTPS no está por vencer
host="${SITIO#https://}"
fin="$(echo | openssl s_client -servername "$host" -connect "$host:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)"
if [ -n "$fin" ]; then
  dias=$(( ( $(date -d "$fin" +%s) - $(date +%s) ) / 86400 ))
  if [ "$dias" -ge 10 ]; then ok "Certificado HTTPS vigente ($dias días)"; else mal "El certificado HTTPS vence en $dias días"; fi
else mal "No se pudo leer el certificado HTTPS"; fi

# 5) El DNS apunta a GitHub Pages
dns="$(curl -s --max-time 20 -H 'accept: application/dns-json' "https://cloudflare-dns.com/dns-query?name=${host}&type=A" 2>/dev/null)"
if echo "$dns" | grep -q '185\.199\.'; then ok "DNS apunta a GitHub Pages"; else mal "El DNS de $host no apunta a GitHub Pages"; fi

# 6) Firestore responde y sus reglas siguen publicadas (config/funciones es de lectura pública)
c="$(pedir "$FS/config/funciones")"
case "$c" in 200|404) ok "Firestore responde ($c)";; *) mal "Firestore no responde bien (código $c): caída o reglas rotas";; esac

# 7) Servidor de pagos y conciliación diaria (solo si ya está configurado)
pagos="$(curl -s --max-time 20 "$SITIO/nube-config.js" 2>/dev/null | sed -n "s/.*ARCANA_PAGOS *= *'\([^']*\)'.*/\1/p" | head -1)"
if [ -n "$pagos" ]; then
  c="$(pedir "${pagos%/}/")"
  if [ "$c" = "200" ] && grep -q '"ok":true' "$TMP/cuerpo"; then ok "Servidor de pagos responde"; else mal "El servidor de pagos no responde bien (código $c)"; fi
  c="$(pedir "$FS/sistema/estado")"
  if [ "$c" = "200" ]; then
    ts="$(jq -r '.fields.conciliacion.mapValue.fields.ts.integerValue // empty' "$TMP/cuerpo")"
    bien="$(jq -r '.fields.conciliacion.mapValue.fields.ok.booleanValue // empty' "$TMP/cuerpo")"
    err="$(jq -r '.fields.conciliacion.mapValue.fields.error.stringValue // empty' "$TMP/cuerpo")"
    if [ -n "$ts" ]; then
      horas=$(( ( $(date +%s) - ts / 1000 ) / 3600 ))
      if [ "$horas" -gt 36 ]; then mal "La conciliación de pagos no corre hace $horas horas"
      elif [ "$bien" != "true" ]; then mal "La última conciliación de pagos terminó con error: $err"
      else ok "Conciliación de pagos al día (hace $horas h)"; fi
    else aviso "Aún no hay resultado de conciliación de pagos"; fi
  else aviso "Conciliación de pagos sin datos todavía (¿falta el Cron Trigger en Cloudflare?)"; fi
else
  aviso "Servidor de pagos aún no configurado en nube-config.js: se omite"
fi

echo
if [ "$fallos" -gt 0 ]; then
  echo "RESULTADO: $fallos problema(s)"
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then { echo "### ARCANA: $fallos problema(s)"; printf "%b\n" "$resumen"; } >> "$GITHUB_STEP_SUMMARY"; fi
  exit 1
fi
echo "RESULTADO: todo en orden"
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then echo "### ARCANA: todo en orden" >> "$GITHUB_STEP_SUMMARY"; fi
