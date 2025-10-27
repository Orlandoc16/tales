# ⚙️ Guía de Configuración - Generador de Cuentos Infantiles

## 🎯 Introducción

Esta guía te ayudará a configurar completamente el sistema de generación de cuentos infantiles basado en n8n. Sigue los pasos en orden para asegurar una instalación exitosa.

## 📋 Prerrequisitos del Sistema

### Requisitos Mínimos
- **Node.js:** 18.0.0 o superior
- **RAM:** 4GB mínimo, 8GB recomendado
- **Almacenamiento:** 10GB libres
- **Sistema Operativo:** Windows 10+, macOS 10.15+, Ubuntu 18.04+

### Servicios Externos Requeridos
- **Supabase:** Cuenta y proyecto configurado
- **Google Cloud:** API de Gemini habilitada
- **Nanobanana:** Cuenta y API key
- **Redis:** Servidor local o en la nube (opcional)

## 🚀 Instalación Paso a Paso

### 1. Preparación del Entorno

```bash
# Verificar versión de Node.js
node --version
# Debe mostrar v18.0.0 o superior

# Verificar npm
npm --version

# Crear directorio del proyecto
mkdir n8n-cuentos-infantiles
cd n8n-cuentos-infantiles

# Clonar o descargar el proyecto
git clone <repository-url> .
```

### 2. Instalación de Dependencias

```bash
# Instalar dependencias del proyecto
npm install

# Verificar instalación
npm list --depth=0
```

### 3. Configuración de Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar archivo .env
# En Windows: notepad .env
# En macOS/Linux: nano .env
```

#### Configuración Detallada de .env

```bash
# ===== CONFIGURACIÓN N8N =====
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=tu_password_seguro

# ===== WEBHOOK CONFIGURATION =====
WEBHOOK_URL=http://localhost:5678/webhook
WEBHOOK_TEST_URL=http://localhost:5678/webhook/test

# ===== SUPABASE CONFIGURATION =====
SUPABASE_URL=https://tu-proyecto-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===== AI SERVICES =====
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-pro
GEMINI_MAX_TOKENS=2048
GEMINI_TEMPERATURE=0.7

NANOBANANA_API_KEY=nb_...
NANOBANANA_BASE_URL=https://api.nanobanana.com
NANOBANANA_MODEL=stable-diffusion-xl

# ===== REDIS CACHE =====
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=3600

# ===== STORAGE CONFIGURATION =====
STORAGE_BASE_URL=https://tu-proyecto-id.supabase.co/storage/v1/object/public
PDF_TEMP_PATH=./temp/pdfs
IMAGES_TEMP_PATH=./temp/images
MAX_FILE_SIZE=10485760

# ===== PDF GENERATION =====
PDF_TIMEOUT=60000
PDF_QUALITY=high
PDF_FORMAT=A4
PDF_MARGIN_TOP=20
PDF_MARGIN_BOTTOM=20
PDF_MARGIN_LEFT=20
PDF_MARGIN_RIGHT=20

# ===== MONITORING & LOGGING =====
LOG_LEVEL=info
LOG_FILE=./logs/app.log
ENABLE_ANALYTICS=true
SENTRY_DSN=

# ===== RATE LIMITING =====
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_SKIP_SUCCESSFUL=false

# ===== QUEUE CONFIGURATION =====
QUEUE_CONCURRENCY=3
QUEUE_MAX_RETRIES=3
QUEUE_RETRY_DELAY=5000
QUEUE_TIMEOUT=300000

# ===== DEVELOPMENT =====
NODE_ENV=development
DEBUG=false
ENABLE_CORS=true
```

## 🗄️ Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Clic en "New Project"
4. Completa los datos:
   - **Name:** cuentos-infantiles
   - **Database Password:** (genera una contraseña segura)
   - **Region:** Selecciona la más cercana

### 2. Obtener Credenciales

```bash
# En el dashboard de Supabase:
# 1. Ve a Settings > API
# 2. Copia la URL del proyecto
# 3. Copia la clave anon/public
# 4. Copia la clave service_role (¡mantén secreta!)
```

### 3. Configurar Base de Datos

```bash
# Ejecutar migraciones
node scripts/migrate-supabase.js

# Verificar tablas creadas
# En Supabase Dashboard > Table Editor
# Deberías ver: story_requests, story_content, generated_images, etc.
```

### 4. Configurar Storage

```bash
# Los buckets se crean automáticamente:
# - photos: Para fotos de usuarios
# - generated-images: Para imágenes generadas por IA
# - pdfs: Para PDFs finales
# - templates: Para plantillas HTML/CSS
```

### 5. Configurar Políticas RLS

Las políticas de Row Level Security se configuran automáticamente, pero puedes verificarlas:

```sql
-- Verificar políticas en Supabase SQL Editor
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 🤖 Configuración de APIs de IA

### 1. Google Gemini API

#### Obtener API Key:
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto o selecciona uno existente
3. Habilita la API de Gemini
4. Ve a "Credentials" > "Create Credentials" > "API Key"
5. Copia la clave y pégala en `GEMINI_API_KEY`

#### Configurar Cuotas:
```bash
# Verificar cuota actual
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models

# Configurar límites en Google Cloud Console
# APIs & Services > Quotas
```

### 2. Nanobanana API

#### Obtener API Key:
1. Ve a [nanobanana.com](https://nanobanana.com)
2. Crea una cuenta
3. Ve a Dashboard > API Keys
4. Genera una nueva clave
5. Copia y pega en `NANOBANANA_API_KEY`

#### Verificar Configuración:
```bash
# Test de conexión
curl -H "Authorization: Bearer $NANOBANANA_API_KEY" \
  https://api.nanobanana.com/v1/models
```

## 🔄 Configuración de Redis

### Opción 1: Redis Local

#### Windows:
```bash
# Descargar Redis para Windows
# https://github.com/microsoftarchive/redis/releases

# Instalar y ejecutar
redis-server.exe

# Verificar conexión
redis-cli ping
# Debe responder: PONG
```

#### macOS:
```bash
# Instalar con Homebrew
brew install redis

# Iniciar servicio
brew services start redis

# Verificar
redis-cli ping
```

#### Linux (Ubuntu):
```bash
# Instalar Redis
sudo apt update
sudo apt install redis-server

# Iniciar servicio
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verificar
redis-cli ping
```

### Opción 2: Redis con Docker

```bash
# Ejecutar Redis en Docker
docker run -d \
  --name redis-cuentos \
  -p 6379:6379 \
  redis:alpine

# Verificar contenedor
docker ps

# Conectar y probar
docker exec -it redis-cuentos redis-cli ping
```

### Opción 3: Redis en la Nube

#### Redis Cloud:
1. Ve a [redis.com](https://redis.com)
2. Crea cuenta gratuita
3. Crea una base de datos
4. Obtén la URL de conexión
5. Actualiza variables en `.env`:

```bash
REDIS_HOST=redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=tu_password
```

## 🔧 Configuración de n8n

### 1. Instalación Global (Opcional)

```bash
# Instalar n8n globalmente
npm install -g n8n

# O usar la versión local del proyecto
# (recomendado para desarrollo)
```

### 2. Configuración Inicial

```bash
# Ejecutar script de configuración
node scripts/setup.js

# Esto creará:
# - Directorios necesarios
# - Archivos de configuración
# - Configuración de n8n
```

### 3. Iniciar n8n

```bash
# Opción 1: Usar npm script
npm run dev

# Opción 2: Comando directo
npx n8n start

# Opción 3: Con configuración personalizada
N8N_CONFIG_FILES=./config/n8n.json npx n8n start
```

### 4. Configuración Web

1. Abre http://localhost:5678
2. Crea cuenta de administrador:
   - **Email:** admin@cuentos.com
   - **Password:** (usa una contraseña segura)
3. Completa la configuración inicial

### 5. Importar Workflow

```bash
# Método 1: Interfaz Web
# 1. Ve a Workflows > Import from File
# 2. Selecciona: workflows/cuento-generator.json

# Método 2: API
curl -X POST http://localhost:5678/rest/workflows/import \
  -H "Content-Type: application/json" \
  -d @workflows/cuento-generator.json
```

### 6. Configurar Credenciales

En la interfaz de n8n, configura las credenciales:

#### Supabase:
- **Name:** Supabase-Cuentos
- **Host:** tu-proyecto-id.supabase.co
- **Database:** postgres
- **User:** postgres
- **Password:** (password de tu proyecto)
- **SSL:** Enabled

#### HTTP Request (APIs):
- **Gemini API:**
  - Name: Gemini-API
  - Authentication: Header Auth
  - Header Name: Authorization
  - Header Value: Bearer YOUR_GEMINI_KEY

- **Nanobanana API:**
  - Name: Nanobanana-API
  - Authentication: Header Auth
  - Header Name: Authorization
  - Header Value: Bearer YOUR_NANOBANANA_KEY

## 🧪 Verificación de Instalación

### 1. Ejecutar Health Check

```bash
# Verificar todos los servicios
node scripts/health-check.js

# Salida esperada:
# ✅ Supabase: Connected
# ✅ Redis: Connected
# ✅ Gemini API: Available
# ✅ Nanobanana API: Available
# ✅ File System: Writable
# ✅ Environment: Valid
```

### 2. Test de Generación

```bash
# Test básico
curl -X POST http://localhost:5678/webhook/generate-story \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "gender": "other",
    "interests": "robots",
    "style": "scientific"
  }'

# Respuesta esperada:
# {
#   "success": true,
#   "story_id": "uuid-string",
#   "pdf_url": "https://...",
#   ...
# }
```

### 3. Verificar Logs

```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Verificar errores
grep "ERROR" logs/app.log

# Ver logs de n8n
# En la interfaz web: Settings > Log Streaming
```

## 🔒 Configuración de Seguridad

### 1. Autenticación n8n

```bash
# Habilitar autenticación básica
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=admin
export N8N_BASIC_AUTH_PASSWORD=tu_password_seguro
```

### 2. HTTPS (Producción)

```bash
# Configurar certificados SSL
export N8N_PROTOCOL=https
export N8N_SSL_KEY=/path/to/private.key
export N8N_SSL_CERT=/path/to/certificate.crt
```

### 3. Firewall y Red

```bash
# Permitir solo puertos necesarios
# Puerto 5678: n8n
# Puerto 6379: Redis (solo local)
# Puerto 5432: PostgreSQL (solo Supabase)
```

### 4. Variables Sensibles

```bash
# Nunca commitear .env
echo ".env" >> .gitignore

# Usar variables de entorno en producción
# No hardcodear API keys en el código
```

## 🚀 Configuración de Producción

### 1. Variables de Entorno

```bash
# Cambiar a producción
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn

# URLs de producción
N8N_HOST=tu-dominio.com
WEBHOOK_URL=https://tu-dominio.com/webhook
```

### 2. Process Manager

```bash
# Instalar PM2
npm install -g pm2

# Crear archivo ecosystem
# ecosystem.config.js ya está incluido

# Iniciar con PM2
pm2 start ecosystem.config.js

# Configurar auto-inicio
pm2 startup
pm2 save
```

### 3. Proxy Reverso (Nginx)

```nginx
# /etc/nginx/sites-available/cuentos-infantiles
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Monitoreo

```bash
# Configurar Sentry (opcional)
export SENTRY_DSN=https://tu-sentry-dsn

# Configurar logs estructurados
export LOG_FORMAT=json

# Métricas con Prometheus (opcional)
export ENABLE_METRICS=true
export METRICS_PORT=9090
```

## 🔧 Troubleshooting

### Problemas Comunes

#### Error: "Cannot connect to Supabase"
```bash
# Verificar URL y keys
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test de conexión
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
console.log('Test exitoso');
"
```

#### Error: "Redis connection refused"
```bash
# Verificar si Redis está corriendo
redis-cli ping

# Si no responde, iniciar Redis
# Windows: redis-server.exe
# macOS/Linux: redis-server
# Docker: docker start redis-cuentos
```

#### Error: "n8n workflow not found"
```bash
# Re-importar workflow
curl -X POST http://localhost:5678/rest/workflows/import \
  -H "Content-Type: application/json" \
  -d @workflows/cuento-generator.json

# Verificar en interfaz web
# Workflows > debería aparecer "Cuento Generator"
```

#### Error: "Gemini API quota exceeded"
```bash
# Verificar cuota en Google Cloud Console
# Implementar rate limiting
# Usar cache más agresivo
export REDIS_TTL=7200  # 2 horas
```

### Logs de Debug

```bash
# Habilitar debug completo
export DEBUG=true
export LOG_LEVEL=debug

# Ver logs detallados
tail -f logs/app.log | grep DEBUG

# Logs específicos de n8n
export N8N_LOG_LEVEL=debug
```

## 📊 Optimización de Performance

### 1. Cache Configuration

```bash
# Aumentar TTL para cache
REDIS_TTL=7200  # 2 horas

# Cache más agresivo para imágenes
IMAGE_CACHE_TTL=86400  # 24 horas

# Cache de templates
TEMPLATE_CACHE_ENABLED=true
```

### 2. Concurrencia

```bash
# Aumentar workers para PDFs
QUEUE_CONCURRENCY=5

# Timeout más largo para generación compleja
QUEUE_TIMEOUT=600000  # 10 minutos

# Batch processing para imágenes
IMAGE_BATCH_SIZE=4
```

### 3. Optimización de Base de Datos

```sql
-- Crear índices adicionales en Supabase
CREATE INDEX IF NOT EXISTS idx_story_requests_status 
ON story_requests(status);

CREATE INDEX IF NOT EXISTS idx_story_requests_created_at 
ON story_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cache_entries_key 
ON cache_entries(cache_key);
```

## 🔄 Mantenimiento

### Backup Automático

```bash
# Configurar backup diario
# Agregar a crontab:
0 2 * * * /path/to/project/scripts/backup-database.js

# Backup manual
node scripts/backup-database.js
```

### Limpieza de Archivos

```bash
# Limpiar archivos temporales (diario)
0 3 * * * /path/to/project/scripts/cleanup-temp.js

# Limpiar cache antiguo (semanal)
0 4 * * 0 /path/to/project/scripts/cleanup-cache.js
```

### Actualizaciones

```bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit

# Actualizar n8n
npm install n8n@latest
```

## 📞 Soporte y Recursos

### Documentación Adicional
- [API Documentation](./api-documentation.md)
- [Examples](./examples.md)
- [FAQ](./faq.md)

### Comunidad
- **GitHub Issues:** Para reportar bugs
- **Discussions:** Para preguntas generales
- **Discord:** Chat en tiempo real

### Contacto
- **Email:** soporte@cuentos-infantiles.com
- **Documentación:** https://docs.cuentos-infantiles.com

---

*¡Configuración completada! Tu sistema de generación de cuentos infantiles está listo para usar.*