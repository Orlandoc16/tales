#!/usr/bin/env node

/**
 * Script de configuración inicial para el Generador de Cuentos Infantiles
 * Configura el entorno, valida dependencias y prepara el sistema
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SetupManager {
    constructor() {
        this.projectRoot = process.cwd();
        this.requiredDirs = [
            'temp/pdfs',
            'temp/images',
            'logs',
            'workflows',
            'templates/pdf',
            'templates/html',
            'config'
        ];
        this.requiredEnvVars = [
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY',
            'GEMINI_API_KEY',
            'NANOBANANA_API_KEY'
        ];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };
        
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async createDirectories() {
        this.log('Creando estructura de directorios...');
        
        for (const dir of this.requiredDirs) {
            const fullPath = path.join(this.projectRoot, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                this.log(`✓ Directorio creado: ${dir}`, 'success');
            } else {
                this.log(`✓ Directorio ya existe: ${dir}`, 'info');
            }
        }
    }

    checkEnvironmentFile() {
        this.log('Verificando archivo de configuración...');
        
        const envPath = path.join(this.projectRoot, '.env');
        const envExamplePath = path.join(this.projectRoot, '.env.example');
        
        if (!fs.existsSync(envPath)) {
            if (fs.existsSync(envExamplePath)) {
                fs.copyFileSync(envExamplePath, envPath);
                this.log('✓ Archivo .env creado desde .env.example', 'success');
                this.log('⚠️  IMPORTANTE: Configura las variables de entorno en .env', 'warning');
            } else {
                this.log('✗ No se encontró .env.example', 'error');
                throw new Error('Archivo .env.example requerido');
            }
        } else {
            this.log('✓ Archivo .env encontrado', 'success');
        }
    }

    validateEnvironmentVariables() {
        this.log('Validando variables de entorno...');
        
        require('dotenv').config();
        
        const missing = [];
        for (const envVar of this.requiredEnvVars) {
            if (!process.env[envVar]) {
                missing.push(envVar);
            }
        }
        
        if (missing.length > 0) {
            this.log(`⚠️  Variables de entorno faltantes: ${missing.join(', ')}`, 'warning');
            this.log('Configura estas variables en el archivo .env antes de continuar', 'warning');
            return false;
        }
        
        this.log('✓ Todas las variables de entorno están configuradas', 'success');
        return true;
    }

    async installDependencies() {
        this.log('Instalando dependencias...');
        
        try {
            execSync('npm install', { 
                stdio: 'inherit',
                cwd: this.projectRoot 
            });
            this.log('✓ Dependencias instaladas correctamente', 'success');
        } catch (error) {
            this.log('✗ Error instalando dependencias', 'error');
            throw error;
        }
    }

    createConfigFiles() {
        this.log('Creando archivos de configuración...');
        
        // Configuración de n8n
        const n8nConfig = {
            "version": "1.0.0",
            "settings": {
                "executionTimeout": 300,
                "maxExecutionTimeout": 600,
                "saveDataErrorExecution": "all",
                "saveDataSuccessExecution": "all",
                "saveManualExecutions": true
            },
            "endpoints": {
                "webhook": "/webhook/generate-story",
                "status": "/webhook/status",
                "download": "/webhook/download"
            }
        };
        
        const configPath = path.join(this.projectRoot, 'config', 'n8n.json');
        fs.writeFileSync(configPath, JSON.stringify(n8nConfig, null, 2));
        this.log('✓ Configuración de n8n creada', 'success');
        
        // Configuración de Redis
        const redisConfig = {
            "host": process.env.REDIS_HOST || "localhost",
            "port": parseInt(process.env.REDIS_PORT) || 6379,
            "password": process.env.REDIS_PASSWORD || "",
            "db": parseInt(process.env.REDIS_DB) || 0,
            "keyPrefix": "cuentos:",
            "ttl": {
                "stories": 86400,
                "images": 259200,
                "pdfs": 604800
            }
        };
        
        const redisConfigPath = path.join(this.projectRoot, 'config', 'redis.json');
        fs.writeFileSync(redisConfigPath, JSON.stringify(redisConfig, null, 2));
        this.log('✓ Configuración de Redis creada', 'success');
        
        // Configuración de Supabase
        const supabaseConfig = {
            "url": process.env.SUPABASE_URL,
            "anonKey": process.env.SUPABASE_ANON_KEY,
            "serviceRoleKey": process.env.SUPABASE_SERVICE_ROLE_KEY,
            "buckets": {
                "photos": "photos",
                "generatedImages": "generated-images",
                "pdfs": "pdfs",
                "templates": "templates"
            },
            "schema": "cuentos"
        };
        
        const supabaseConfigPath = path.join(this.projectRoot, 'config', 'supabase.json');
        fs.writeFileSync(supabaseConfigPath, JSON.stringify(supabaseConfig, null, 2));
        this.log('✓ Configuración de Supabase creada', 'success');
    }

    createGitignore() {
        const gitignorePath = path.join(this.projectRoot, '.gitignore');
        
        if (!fs.existsSync(gitignorePath)) {
            const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Temporary files
temp/
*.tmp
*.temp

# n8n
.n8n/
workflows/*.json

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build outputs
dist/
build/

# Cache
.cache/
*.cache
`;
            
            fs.writeFileSync(gitignorePath, gitignoreContent);
            this.log('✓ Archivo .gitignore creado', 'success');
        }
    }

    async testConnections() {
        this.log('Probando conexiones...');
        
        if (!this.validateEnvironmentVariables()) {
            this.log('⚠️  Saltando pruebas de conexión (variables faltantes)', 'warning');
            return;
        }
        
        try {
            // Test Supabase
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );
            
            const { data, error } = await supabase.from('cuentos.system_config').select('count').limit(1);
            if (error) {
                this.log(`⚠️  Conexión a Supabase: ${error.message}`, 'warning');
            } else {
                this.log('✓ Conexión a Supabase exitosa', 'success');
            }
        } catch (error) {
            this.log(`⚠️  Error probando Supabase: ${error.message}`, 'warning');
        }
        
        try {
            // Test Redis
            const redis = require('redis');
            const client = redis.createClient({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD || undefined
            });
            
            await client.connect();
            await client.ping();
            await client.disconnect();
            this.log('✓ Conexión a Redis exitosa', 'success');
        } catch (error) {
            this.log(`⚠️  Error probando Redis: ${error.message}`, 'warning');
        }
    }

    displayNextSteps() {
        this.log('\n🎉 Configuración inicial completada!', 'success');
        this.log('\nPróximos pasos:', 'info');
        this.log('1. Configura las variables de entorno en .env', 'info');
        this.log('2. Ejecuta: npm run migrate (para configurar Supabase)', 'info');
        this.log('3. Ejecuta: npm run dev (para iniciar n8n en modo desarrollo)', 'info');
        this.log('4. Importa el workflow desde workflows/cuento-generator.json', 'info');
        this.log('\n📚 Documentación disponible en .trae/documents/', 'info');
    }

    async run() {
        try {
            this.log('🚀 Iniciando configuración del Generador de Cuentos Infantiles...', 'info');
            
            await this.createDirectories();
            this.checkEnvironmentFile();
            await this.installDependencies();
            this.createConfigFiles();
            this.createGitignore();
            await this.testConnections();
            
            this.displayNextSteps();
            
        } catch (error) {
            this.log(`✗ Error durante la configuración: ${error.message}`, 'error');
            process.exit(1);
        }
    }
}

// Ejecutar setup si es llamado directamente
if (require.main === module) {
    const setup = new SetupManager();
    setup.run();
}

module.exports = SetupManager;