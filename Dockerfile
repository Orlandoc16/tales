# Dockerfile para Generador de Cuentos Infantiles - EasyPanel Compatible
FROM node:18-alpine

# Instalar dependencias del sistema necesarias para Puppeteer y Sharp
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    python3 \
    make \
    g++ \
    vips-dev

# Configurar Puppeteer para usar Chromium instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S n8n -u 1001 -G nodejs

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias de Node.js
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY --chown=n8n:nodejs . .

# Crear directorios necesarios con permisos correctos
RUN mkdir -p /app/temp/pdfs /app/temp/images /app/uploads /app/logs && \
    chown -R n8n:nodejs /app/temp /app/uploads /app/logs

# Variables de entorno por defecto para EasyPanel
ENV NODE_ENV=production \
    N8N_HOST=0.0.0.0 \
    N8N_PORT=5678 \
    N8N_PROTOCOL=http \
    N8N_BASIC_AUTH_ACTIVE=true \
    N8N_BASIC_AUTH_USER=admin \
    N8N_BASIC_AUTH_PASSWORD=changeme123 \
    N8N_USER_FOLDER=/app \
    N8N_WORKFLOWS_FOLDER=/app/workflows \
    N8N_CUSTOM_EXTENSIONS=/app/lib \
    PDF_TEMP_PATH=/app/temp/pdfs \
    LOG_LEVEL=info \
    REDIS_HOST=localhost \
    REDIS_PORT=6379

# Exponer puerto para EasyPanel
EXPOSE 5678

# Cambiar a usuario no-root
USER n8n

# Comando de inicio con health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node scripts/health-check.js || exit 1

# Script de inicio que ejecuta setup y migración antes de iniciar n8n
CMD ["sh", "-c", "npm run setup && npm run migrate && npm start"]