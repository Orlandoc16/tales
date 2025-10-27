#!/usr/bin/env node

/**
 * Script de migración para Supabase
 * Ejecuta los esquemas SQL y configura el storage
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

class SupabaseMigrator {
    constructor() {
        require('dotenv').config();
        
        this.supabaseUrl = process.env.SUPABASE_URL;
        this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!this.supabaseUrl || !this.serviceRoleKey) {
            throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos');
        }
        
        this.supabase = createClient(this.supabaseUrl, this.serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
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

    async executeSQLFile(filePath, description) {
        this.log(`Ejecutando ${description}...`);
        
        try {
            const sqlContent = fs.readFileSync(filePath, 'utf8');
            
            // Dividir el SQL en statements individuales
            const statements = sqlContent
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            
            for (const statement of statements) {
                if (statement.trim()) {
                    const { error } = await this.supabase.rpc('exec_sql', {
                        sql: statement + ';'
                    });
                    
                    if (error) {
                        // Algunos errores son esperados (como "ya existe")
                        if (!error.message.includes('already exists') && 
                            !error.message.includes('ya existe')) {
                            this.log(`⚠️  Warning en ${description}: ${error.message}`, 'warning');
                        }
                    }
                }
            }
            
            this.log(`✓ ${description} completado`, 'success');
            
        } catch (error) {
            this.log(`✗ Error ejecutando ${description}: ${error.message}`, 'error');
            throw error;
        }
    }

    async createStorageBuckets() {
        this.log('Configurando buckets de storage...');
        
        const buckets = [
            {
                id: 'photos',
                name: 'photos',
                public: false,
                fileSizeLimit: 10485760, // 10MB
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
            },
            {
                id: 'generated-images',
                name: 'generated-images',
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
            },
            {
                id: 'pdfs',
                name: 'pdfs',
                public: true,
                fileSizeLimit: 52428800, // 50MB
                allowedMimeTypes: ['application/pdf']
            },
            {
                id: 'templates',
                name: 'templates',
                public: true,
                fileSizeLimit: 1048576, // 1MB
                allowedMimeTypes: ['text/html', 'text/css', 'image/svg+xml', 'application/json']
            }
        ];
        
        for (const bucket of buckets) {
            try {
                const { data, error } = await this.supabase.storage.createBucket(bucket.id, {
                    public: bucket.public,
                    fileSizeLimit: bucket.fileSizeLimit,
                    allowedMimeTypes: bucket.allowedMimeTypes
                });
                
                if (error) {
                    if (error.message.includes('already exists')) {
                        this.log(`✓ Bucket '${bucket.id}' ya existe`, 'info');
                    } else {
                        this.log(`⚠️  Error creando bucket '${bucket.id}': ${error.message}`, 'warning');
                    }
                } else {
                    this.log(`✓ Bucket '${bucket.id}' creado`, 'success');
                }
            } catch (error) {
                this.log(`✗ Error con bucket '${bucket.id}': ${error.message}`, 'error');
            }
        }
    }

    async testDatabaseConnection() {
        this.log('Probando conexión a la base de datos...');
        
        try {
            const { data, error } = await this.supabase
                .from('cuentos.system_config')
                .select('config_key')
                .limit(1);
            
            if (error) {
                this.log(`✗ Error de conexión: ${error.message}`, 'error');
                return false;
            }
            
            this.log('✓ Conexión a base de datos exitosa', 'success');
            return true;
            
        } catch (error) {
            this.log(`✗ Error probando conexión: ${error.message}`, 'error');
            return false;
        }
    }

    async seedInitialData() {
        this.log('Insertando datos iniciales...');
        
        try {
            // Verificar si ya existen datos
            const { data: existingConfig } = await this.supabase
                .from('cuentos.system_config')
                .select('config_key')
                .limit(1);
            
            if (existingConfig && existingConfig.length > 0) {
                this.log('✓ Datos iniciales ya existen', 'info');
                return;
            }
            
            // Insertar configuración inicial
            const initialConfig = [
                {
                    config_key: 'pdf_templates',
                    config_value: {
                        default: 'modern_kids',
                        fantasy: 'magical_theme',
                        adventure: 'explorer_theme',
                        educational: 'learning_theme'
                    },
                    description: 'Templates disponibles para PDFs'
                },
                {
                    config_key: 'image_generation_params',
                    config_value: {
                        width: 1024,
                        height: 1024,
                        quality: 'high',
                        style: 'cartoon'
                    },
                    description: 'Parámetros por defecto para generación de imágenes'
                },
                {
                    config_key: 'story_generation_params',
                    config_value: {
                        max_words: 800,
                        reading_level: 'elementary',
                        include_moral: true
                    },
                    description: 'Parámetros por defecto para generación de historias'
                }
            ];
            
            const { error } = await this.supabase
                .from('cuentos.system_config')
                .insert(initialConfig);
            
            if (error) {
                this.log(`⚠️  Error insertando datos iniciales: ${error.message}`, 'warning');
            } else {
                this.log('✓ Datos iniciales insertados', 'success');
            }
            
        } catch (error) {
            this.log(`✗ Error en seed de datos: ${error.message}`, 'error');
        }
    }

    async verifyMigration() {
        this.log('Verificando migración...');
        
        try {
            // Verificar tablas principales
            const tables = [
                'cuentos.story_requests',
                'cuentos.story_content',
                'cuentos.generated_images',
                'cuentos.pdf_outputs',
                'cuentos.analytics'
            ];
            
            for (const table of tables) {
                const { data, error } = await this.supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    this.log(`✗ Error verificando tabla ${table}: ${error.message}`, 'error');
                } else {
                    this.log(`✓ Tabla ${table} verificada`, 'success');
                }
            }
            
            // Verificar buckets
            const { data: buckets, error: bucketsError } = await this.supabase.storage.listBuckets();
            
            if (bucketsError) {
                this.log(`⚠️  Error verificando buckets: ${bucketsError.message}`, 'warning');
            } else {
                const requiredBuckets = ['photos', 'generated-images', 'pdfs', 'templates'];
                const existingBuckets = buckets.map(b => b.id);
                
                for (const bucket of requiredBuckets) {
                    if (existingBuckets.includes(bucket)) {
                        this.log(`✓ Bucket '${bucket}' verificado`, 'success');
                    } else {
                        this.log(`✗ Bucket '${bucket}' no encontrado`, 'error');
                    }
                }
            }
            
        } catch (error) {
            this.log(`✗ Error en verificación: ${error.message}`, 'error');
        }
    }

    async run() {
        try {
            this.log('🚀 Iniciando migración de Supabase...', 'info');
            
            // Ejecutar esquemas SQL
            const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
            if (fs.existsSync(schemaPath)) {
                await this.executeSQLFile(schemaPath, 'esquema principal');
            } else {
                this.log('⚠️  Archivo schema.sql no encontrado', 'warning');
            }
            
            const storagePath = path.join(process.cwd(), 'supabase', 'storage.sql');
            if (fs.existsSync(storagePath)) {
                await this.executeSQLFile(storagePath, 'configuración de storage');
            } else {
                this.log('⚠️  Archivo storage.sql no encontrado', 'warning');
            }
            
            // Configurar storage
            await this.createStorageBuckets();
            
            // Probar conexión
            await this.testDatabaseConnection();
            
            // Insertar datos iniciales
            await this.seedInitialData();
            
            // Verificar migración
            await this.verifyMigration();
            
            this.log('\n🎉 Migración de Supabase completada exitosamente!', 'success');
            this.log('\nLa base de datos está lista para usar con el generador de cuentos.', 'info');
            
        } catch (error) {
            this.log(`✗ Error durante la migración: ${error.message}`, 'error');
            process.exit(1);
        }
    }
}

// Ejecutar migración si es llamado directamente
if (require.main === module) {
    const migrator = new SupabaseMigrator();
    migrator.run();
}

module.exports = SupabaseMigrator;