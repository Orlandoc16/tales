#!/usr/bin/env node

/**
 * Script de verificación de salud del sistema
 * Verifica que todos los servicios estén funcionando correctamente
 */

const { createClient } = require('@supabase/supabase-js');
const Redis = require('redis');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class HealthChecker {
  constructor() {
    this.results = {
      overall: 'unknown',
      services: {},
      timestamp: new Date().toISOString()
    };
    
    // Cargar variables de entorno
    require('dotenv').config();
  }

  /**
   * Verificar conexión a Supabase
   */
  async checkSupabase() {
    console.log('🔍 Verificando Supabase...');
    
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Variables de Supabase no configuradas');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Probar conexión con una consulta simple
      const { data, error } = await supabase
        .from('story_requests')
        .select('count')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = tabla no existe (OK en primera instalación)
        throw error;
      }
      
      this.results.services.supabase = {
        status: 'healthy',
        url: supabaseUrl,
        message: 'Conexión exitosa'
      };
      
      console.log('✅ Supabase: Conexión exitosa');
      
    } catch (error) {
      this.results.services.supabase = {
        status: 'unhealthy',
        error: error.message,
        message: 'Error de conexión'
      };
      
      console.log('❌ Supabase: Error de conexión');
      console.log(`   Error: ${error.message}`);
    }
  }

  /**
   * Verificar conexión a Redis
   */
  async checkRedis() {
    console.log('🔍 Verificando Redis...');
    
    let redisClient = null;
    
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379
      };
      
      if (process.env.REDIS_PASSWORD) {
        redisConfig.password = process.env.REDIS_PASSWORD;
      }
      
      redisClient = Redis.createClient(redisConfig);
      
      await redisClient.connect();
      
      // Probar operación básica
      await redisClient.set('health_check', 'ok', { EX: 10 });
      const result = await redisClient.get('health_check');
      
      if (result !== 'ok') {
        throw new Error('No se pudo escribir/leer en Redis');
      }
      
      // Obtener información del servidor
      const info = await redisClient.info('server');
      const version = info.match(/redis_version:([^\r\n]+)/)?.[1] || 'unknown';
      
      this.results.services.redis = {
        status: 'healthy',
        host: redisConfig.host,
        port: redisConfig.port,
        version: version,
        message: 'Conexión exitosa'
      };
      
      console.log('✅ Redis: Conexión exitosa');
      console.log(`   Versión: ${version}`);
      
    } catch (error) {
      this.results.services.redis = {
        status: 'unhealthy',
        error: error.message,
        message: 'Error de conexión'
      };
      
      console.log('❌ Redis: Error de conexión');
      console.log(`   Error: ${error.message}`);
    } finally {
      if (redisClient) {
        try {
          await redisClient.disconnect();
        } catch (error) {
          // Ignorar errores de desconexión
        }
      }
    }
  }

  /**
   * Verificar APIs externas
   */
  async checkExternalAPIs() {
    console.log('🔍 Verificando APIs externas...');
    
    // Verificar Gemini API
    await this.checkGeminiAPI();
    
    // Verificar Nanobanana API
    await this.checkNanobananaAPI();
  }

  /**
   * Verificar Gemini API
   */
  async checkGeminiAPI() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'tu-gemini-api-key') {
        throw new Error('API Key de Gemini no configurada');
      }
      
      // Hacer una petición simple a la API
      const response = await axios.get(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        { timeout: 10000 }
      );
      
      if (response.status === 200) {
        this.results.services.gemini = {
          status: 'healthy',
          message: 'API Key válida',
          models: response.data.models?.length || 0
        };
        
        console.log('✅ Gemini API: Conexión exitosa');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
    } catch (error) {
      this.results.services.gemini = {
        status: 'unhealthy',
        error: error.message,
        message: 'Error de conexión o API Key inválida'
      };
      
      console.log('❌ Gemini API: Error de conexión');
      console.log(`   Error: ${error.message}`);
    }
  }

  /**
   * Verificar Nanobanana API
   */
  async checkNanobananaAPI() {
    try {
      const apiKey = process.env.NANOBANANA_API_KEY;
      
      if (!apiKey || apiKey === 'tu-nanobanana-api-key') {
        throw new Error('API Key de Nanobanana no configurada');
      }
      
      // Hacer una petición simple a la API (endpoint de status si existe)
      const response = await axios.get(
        'https://api.nanobanana.com/v1/status',
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000,
          httpsAgent: new (require('https').Agent)({
            rejectUnauthorized: false,
            secureProtocol: 'TLSv1_2_method'
          })
        }
      );
      
      this.results.services.nanobanana = {
        status: 'healthy',
        message: 'API Key válida'
      };
      
      console.log('✅ Nanobanana API: Conexión exitosa');
      
    } catch (error) {
      // Si el endpoint de status no existe, intentar con un endpoint diferente
      if (error.response?.status === 404) {
        this.results.services.nanobanana = {
          status: 'warning',
          message: 'API Key configurada (endpoint de status no disponible)'
        };
        
        console.log('⚠️  Nanobanana API: API Key configurada (no se pudo verificar completamente)');
      } else {
        this.results.services.nanobanana = {
          status: 'unhealthy',
          error: error.message,
          message: 'Error de conexión o API Key inválida'
        };
        
        console.log('❌ Nanobanana API: Error de conexión');
        console.log(`   Error: ${error.message}`);
      }
    }
  }

  /**
   * Verificar sistema de archivos
   */
  async checkFileSystem() {
    console.log('🔍 Verificando sistema de archivos...');
    
    try {
      const directories = [
        'temp/pdfs',
        'temp/images',
        'logs',
        'uploads'
      ];
      
      const checks = [];
      
      for (const dir of directories) {
        const fullPath = path.join(process.cwd(), dir);
        
        try {
          await fs.access(fullPath);
          
          // Probar escritura
          const testFile = path.join(fullPath, 'health_check.tmp');
          await fs.writeFile(testFile, 'test');
          await fs.unlink(testFile);
          
          checks.push({ dir, status: 'ok' });
        } catch (error) {
          checks.push({ dir, status: 'error', error: error.message });
        }
      }
      
      const failedChecks = checks.filter(c => c.status === 'error');
      
      if (failedChecks.length === 0) {
        this.results.services.filesystem = {
          status: 'healthy',
          directories: checks.length,
          message: 'Todos los directorios accesibles'
        };
        
        console.log('✅ Sistema de archivos: Todos los directorios accesibles');
      } else {
        this.results.services.filesystem = {
          status: 'unhealthy',
          failed: failedChecks,
          message: `${failedChecks.length} directorios con problemas`
        };
        
        console.log('❌ Sistema de archivos: Problemas detectados');
        failedChecks.forEach(check => {
          console.log(`   ${check.dir}: ${check.error}`);
        });
      }
      
    } catch (error) {
      this.results.services.filesystem = {
        status: 'unhealthy',
        error: error.message,
        message: 'Error verificando sistema de archivos'
      };
      
      console.log('❌ Sistema de archivos: Error general');
      console.log(`   Error: ${error.message}`);
    }
  }

  /**
   * Verificar variables de entorno
   */
  checkEnvironmentVariables() {
    console.log('🔍 Verificando variables de entorno...');
    
    const requiredVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'GEMINI_API_KEY',
      'NANOBANANA_API_KEY'
    ];
    
    const optionalVars = [
      'REDIS_HOST',
      'REDIS_PORT',
      'REDIS_PASSWORD',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    const configured = requiredVars.filter(varName => process.env[varName]);
    const optional = optionalVars.filter(varName => process.env[varName]);
    
    if (missing.length === 0) {
      this.results.services.environment = {
        status: 'healthy',
        required: configured.length,
        optional: optional.length,
        message: 'Todas las variables requeridas configuradas'
      };
      
      console.log('✅ Variables de entorno: Todas las requeridas configuradas');
      console.log(`   Requeridas: ${configured.length}/${requiredVars.length}`);
      console.log(`   Opcionales: ${optional.length}/${optionalVars.length}`);
    } else {
      this.results.services.environment = {
        status: 'unhealthy',
        missing: missing,
        message: `${missing.length} variables requeridas faltantes`
      };
      
      console.log('❌ Variables de entorno: Variables faltantes');
      missing.forEach(varName => {
        console.log(`   Faltante: ${varName}`);
      });
    }
  }

  /**
   * Calcular estado general
   */
  calculateOverallHealth() {
    const services = Object.values(this.results.services);
    const healthy = services.filter(s => s.status === 'healthy').length;
    const warning = services.filter(s => s.status === 'warning').length;
    const unhealthy = services.filter(s => s.status === 'unhealthy').length;
    
    if (unhealthy > 0) {
      this.results.overall = 'unhealthy';
    } else if (warning > 0) {
      this.results.overall = 'warning';
    } else if (healthy === services.length) {
      this.results.overall = 'healthy';
    } else {
      this.results.overall = 'unknown';
    }
    
    this.results.summary = {
      total: services.length,
      healthy,
      warning,
      unhealthy
    };
  }

  /**
   * Mostrar resumen final
   */
  showSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE SALUD DEL SISTEMA');
    console.log('='.repeat(60));
    
    const statusEmoji = {
      healthy: '✅',
      warning: '⚠️',
      unhealthy: '❌',
      unknown: '❓'
    };
    
    console.log(`Estado general: ${statusEmoji[this.results.overall]} ${this.results.overall.toUpperCase()}`);
    console.log(`Servicios verificados: ${this.results.summary.total}`);
    console.log(`  - Saludables: ${this.results.summary.healthy}`);
    console.log(`  - Con advertencias: ${this.results.summary.warning}`);
    console.log(`  - Con problemas: ${this.results.summary.unhealthy}`);
    
    if (this.results.overall !== 'healthy') {
      console.log('\n🔧 ACCIONES RECOMENDADAS:');
      
      Object.entries(this.results.services).forEach(([service, result]) => {
        if (result.status !== 'healthy') {
          console.log(`\n${service.toUpperCase()}:`);
          console.log(`  Estado: ${statusEmoji[result.status]} ${result.status}`);
          console.log(`  Problema: ${result.message}`);
          
          // Sugerencias específicas
          if (service === 'supabase') {
            console.log('  Solución: Verifica SUPABASE_URL y SUPABASE_ANON_KEY en .env');
          } else if (service === 'redis') {
            console.log('  Solución: Inicia Redis con: docker run -d --name redis-cuentos -p 6379:6379 redis:alpine');
          } else if (service === 'gemini') {
            console.log('  Solución: Configura GEMINI_API_KEY válida en .env');
          } else if (service === 'nanobanana') {
            console.log('  Solución: Configura NANOBANANA_API_KEY válida en .env');
          }
        }
      });
    }
    
    console.log(`\nVerificación completada: ${this.results.timestamp}`);
  }

  /**
   * Guardar resultados en archivo
   */
  async saveResults() {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      await fs.mkdir(logsDir, { recursive: true });
      
      const filename = `health-check-${new Date().toISOString().split('T')[0]}.json`;
      const filepath = path.join(logsDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 Resultados guardados en: ${filepath}`);
    } catch (error) {
      console.log(`⚠️  No se pudieron guardar los resultados: ${error.message}`);
    }
  }

  /**
   * Ejecutar verificación completa
   */
  async runHealthCheck() {
    console.log('🏥 Iniciando verificación de salud del sistema...\n');
    
    try {
      this.checkEnvironmentVariables();
      await this.checkSupabase();
      await this.checkRedis();
      await this.checkExternalAPIs();
      await this.checkFileSystem();
      
      this.calculateOverallHealth();
      this.showSummary();
      await this.saveResults();
      
      // Código de salida basado en el estado
      const exitCode = this.results.overall === 'healthy' ? 0 : 1;
      process.exit(exitCode);
      
    } catch (error) {
      console.error('\n❌ Error durante la verificación de salud:');
      console.error(error.message);
      process.exit(1);
    }
  }
}

// Ejecutar verificación si se llama directamente
if (require.main === module) {
  const healthChecker = new HealthChecker();
  healthChecker.runHealthCheck().catch(console.error);
}

module.exports = HealthChecker;