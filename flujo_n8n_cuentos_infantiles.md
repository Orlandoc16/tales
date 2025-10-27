# Flujo n8n — Generador de cuentos personalizados (foto + intereses → cuento + imágenes → PDF)

## Resumen
Este flujo toma:
- una **foto** del niño/niña (upload o URL),
- un **texto corto** con intereses del niño (ej.: “le gustan dinosaurios, tocar guitarra y la lluvia”),
y genera:
1. Una **historia** original (moral, fantasía, esperanza, algo de poesía, diferenciando pronombres en función de si es niño o niña) usando **Gemini**.
2. Varias **imágenes** ilustrativas que incorporan el rostro/rasgos del niño como personaje principal usando **Nanobanana** (usar la foto como referencia).
3. Ensambla un **PDF** con la historia y muchas imágenes — listo para descargar/compartir.

Las historias serán bonitas, modernas y audaces.

---

## Requisitos previos / Variables de entorno
Define estas variables en n8n (o en el entorno donde se ejecute):
- `GEMINI_API_KEY` — credenciales para llamar a Gemini (o endpoint/GCP).
- `NANOBANANA_API_KEY` — credenciales para Nanobanana.
- `STORAGE_BASE_URL` — (opcional) base URL para servir imágenes subidas (p.ej. S3, Supabase Storage).
- `PDF_TEMP_PATH` — ruta temporal para crear archivos PDF.
- `FROM_EMAIL` / `STORAGE_CREDS` — opcional.

---

## Esquema del flujo (nodos n8n)
1. **Webhook** (HTTP Request Trigger) — recibe `multipart/form-data` con:
   - `photo` (archivo) o `photo_url` (string)
   - `name` (string) — nombre del niño/a
   - `gender` (string) — `male`, `female`, `other`
   - `interests` (string)
   - `language` (optional, default `es`)
2. **Set / Function** — normalizar datos.
3. **Upload Photo** — guardar la foto.
4. **Call Gemini** — generar la historia.
5. **Parse Story** — dividir la historia y generar prompts para imágenes.
6. **Loop / SplitInBatches** — generar imágenes con Nanobanana.
7. **Build HTML** — construir HTML del cuento.
8. **Generate PDF** — renderizar HTML a PDF.
9. **Respond** — devolver enlace del PDF.
10. **Error handling** — manejar errores.

---

(Contenido completo con código, prompts y detalles técnicos como en la explicación anterior)

---
