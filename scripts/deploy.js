#!/usr/bin/env node

/**
 * Script de deployment para el sistema de generación de cuentos infantiles
 * Configura el entorno de producción y despliega todos los componentes
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

class DeploymentManager {
  constructor() {
    this.projectRoot = process.cwd();
    this.envFile = path.join(this.projectRoot, '.env');
    this.envExampleFile = path.join(this.projectRoot, '.env.example');
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Ejecutar comando con manejo de errores
   */
  execCommand(command, options = {}) {
    try {
      console.log(`🔄 Ejecutando: ${command}`);
      const result = execSync(command, { 
        stdio: 'inherit', 
        cwd: this.projectRoot,
        ...options 
      });
      return result;
    } catch (error) {
      console.error(`❌ Error ejecutando comando: ${command}`);
      console.error(error.message);
      throw error;
    }
  }

  /**
   * Preguntar al usuario
   */
  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Verificar si un archivo existe
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verificar dependencias del sistema
   */
  async checkSystemDependencies() {
    console.log('\n🔍 Verificando dependencias del sistema...');
    
    const dependencies = [
      { name: 'Node.js', command: 'node --version', required: true },
      { name: 'npm', command: 'npm --version', required: true },
      { name: 'Docker', command: 'docker --version', required: false },
      { name: 'Redis CLI', command: 'redis-cli --version', required: false }
    ];

    for (const dep of dependencies) {
      try {
        const version = execSync(dep.command, { encoding: 'utf8', stdio: 'pipe' });
        console.log(`✅ ${dep.name}: ${version.trim()}`);
      } catch (error) {
        if (dep.required) {
          console.error(`❌ ${dep.name} es requerido pero no está instalado`);
          throw new Error(`Dependencia faltante: ${dep.name}`);
        } else {
          console.log(`⚠️  ${dep.name}: No instalado (opcional)`);
        }
      }
    }
  }

  /**
   * Configurar variables de entorno
   */
  async setupEnvironmentVariables() {
    console.log('\n🔧 Configurando variables de entorno...');
    
    const envExists = await this.fileExists(this.envFile);
    
    if (envExists) {
      const overwrite = await this.askQuestion(
        '📝 El archivo .env ya existe. ¿Deseas sobrescribirlo? (y/N): '
      );
      
      if (overwrite.toLowerCase() !== 'y') {
        console.log('📋 Usando archivo .env existente');
        return;
      }
    }

    // Leer template de .env.example
    const envExample = await fs.readFile(this.envExampleFile, 'utf8');
    let envContent = envExample;

    console.log('\n📝 Configurando variables de entorno interactivamente...');
    console.log('💡 Presiona Enter para usar el valor por defecto entre []');

    // Variables críticas que necesitan configuración
    const criticalVars = [
      {
        key: 'SUPABASE_URL',
        description: 'URL de tu proyecto Supabase',
        default: 'https://tu-proyecto.supabase.co'
      },
      {
        key: 'SUPABASE_ANON_KEY',
        description: 'Clave anónima de Supabase',
        default: 'tu-clave-anonima'
      },
      {
        key: 'SUPABASE_SERVICE_ROLE_KEY',
        description: 'Clave de service role de Supabase',
        default: 'tu-clave-service-role'
      },
      {
        key: 'GEMINI_API_KEY',
        description: 'API Key de Google Gemini',
        default: 'tu-gemini-api-key'
      },
      {
        key: 'NANOBANANA_API_KEY',
        description: 'API Key de Nanobanana',
        default: 'tu-nanobanana-api-key'
      },
      {
        key: 'REDIS_HOST',
        description: 'Host de Redis',
        default: 'localhost'
      },
      {
        key: 'REDIS_PORT',
        description: 'Puerto de Redis',
        default: '6379'
      }
    ];

    for (const variable of criticalVars) {
      const value = await this.askQuestion(
        `${variable.description} [${variable.default}]: `
      );
      
      const finalValue = value || variable.default;
      const regex = new RegExp(`${variable.key}=.*`, 'g');
      envContent = envContent.replace(regex, `${variable.key}=${finalValue}`);
    }

    // Escribir archivo .env
    await fs.writeFile(this.envFile, envContent);
    console.log('✅ Archivo .env configurado correctamente');
  }

  /**
   * Instalar dependencias
   */
  async installDependencies() {
    console.log('\n📦 Instalando dependencias...');
    
    // Detectar gestor de paquetes
    const hasYarn = await this.fileExists(path.join(this.projectRoot, 'yarn.lock'));
    const hasPnpm = await this.fileExists(path.join(this.projectRoot, 'pnpm-lock.yaml'));
    
    let packageManager = 'npm';
    if (hasPnpm) packageManager = 'pnpm';
    else if (hasYarn) packageManager = 'yarn';
    
    console.log(`📋 Usando ${packageManager} como gestor de paquetes`);
    
    this.execCommand(`${packageManager} install`);
    console.log('✅ Dependencias instaladas correctamente');
  }

  /**
   * Configurar base de datos Supabase
   */
  async setupDatabase() {
    console.log('\n🗄️ Configurando base de datos Supabase...');
    
    const runMigration = await this.askQuestion(
      '🔄 ¿Deseas ejecutar las migraciones de Supabase? (Y/n): '
    );
    
    if (runMigration.toLowerCase() !== 'n') {
      try {
        this.execCommand('node scripts/migrate-supabase.js');
        console.log('✅ Migraciones de Supabase ejecutadas correctamente');
      } catch (error) {
        console.error('❌ Error ejecutando migraciones de Supabase');
        console.error('💡 Puedes ejecutarlas manualmente más tarde con: node scripts/migrate-supabase.js');
      }
    }
  }

  /**
   * Configurar Redis
   */
  async setupRedis() {
    console.log('\n🔴 Configurando Redis...');
    
    const setupRedis = await this.askQuestion(
      '🔄 ¿Deseas configurar Redis localmente? (y/N): '
    );
    
    if (setupRedis.toLowerCase() === 'y') {
      try {
        // Intentar iniciar Redis con Docker
        console.log('🐳 Intentando iniciar Redis con Docker...');
        this.execCommand('docker run -d --name redis-cuentos -p 6379:6379 redis:alpine');
        console.log('✅ Redis iniciado con Docker en puerto 6379');
      } catch (error) {
        console.log('⚠️  No se pudo iniciar Redis con Docker');
        console.log('💡 Asegúrate de tener Redis instalado y ejecutándose en el puerto 6379');
      }
    }
  }

  /**
   * Configurar n8n
   */
  async setupN8n() {
    console.log('\n🔄 Configurando n8n...');
    
    // Crear directorio de workflows si no existe
    const workflowsDir = path.join(this.projectRoot, 'workflows');
    await fs.mkdir(workflowsDir, { recursive: true });
    
    // Crear archivo de configuración de n8n
    const n8nConfig = {
      "database": {
        "type": "sqlite",
        "database": "./n8n.sqlite"
      },
      "credentials": {
        "overwrite": {
          "data": {}
        }
      },
      "workflows": {
        "defaultName": "Cuento Generator"
      }
    };
    
    await fs.writeFile(
      path.join(this.projectRoot, 'n8n-config.json'),
      JSON.stringify(n8nConfig, null, 2)
    );
    
    console.log('✅ Configuración de n8n creada');
    
    const importWorkflow = await this.askQuestion(
      '📥 ¿Deseas importar el workflow de cuentos a n8n? (Y/n): '
    );
    
    if (importWorkflow.toLowerCase() !== 'n') {
      console.log('💡 Para importar el workflow manualmente:');
      console.log('   1. Inicia n8n: npm run dev');
      console.log('   2. Ve a http://localhost:5678');
      console.log('   3. Importa el archivo: workflows/cuento-generator.json');
    }
  }

  /**
   * Crear directorios necesarios
   */
  async createDirectories() {
    console.log('\n📁 Creando directorios necesarios...');
    
    const directories = [
      'temp/pdfs',
      'temp/images',
      'logs',
      'uploads',
      'backups'
    ];
    
    for (const dir of directories) {
      const fullPath = path.join(this.projectRoot, dir);
      await fs.mkdir(fullPath, { recursive: true });
      console.log(`📂 Creado: ${dir}`);
    }
    
    console.log('✅ Directorios creados correctamente');
  }

  /**
   * Configurar scripts de inicio
   */
  async setupStartupScripts() {
    console.log('\n🚀 Configurando scripts de inicio...');
    
    // Script de inicio para desarrollo
    const devScript = `#!/bin/bash
echo "🚀 Iniciando entorno de desarrollo..."

# Verificar Redis
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis no está ejecutándose. Iniciando con Docker..."
    docker run -d --name redis-cuentos -p 6379:6379 redis:alpine || echo "❌ No se pudo iniciar Redis"
fi

# Iniciar n8n
echo "🔄 Iniciando n8n..."
npm run dev
`;

    // Script de inicio para producción
    const prodScript = `#!/bin/bash
echo "🚀 Iniciando entorno de producción..."

# Verificar servicios
echo "🔍 Verificando servicios..."
node scripts/health-check.js

# Iniciar aplicación
echo "🔄 Iniciando aplicación..."
npm start
`;

    await fs.writeFile(path.join(this.projectRoot, 'start-dev.sh'), devScript);
    await fs.writeFile(path.join(this.projectRoot, 'start-prod.sh'), prodScript);
    
    // Hacer ejecutables en sistemas Unix
    try {
      this.execCommand('chmod +x start-dev.sh start-prod.sh');
    } catch (error) {
      // Ignorar en Windows
    }
    
    console.log('✅ Scripts de inicio configurados');
  }

  /**
   * Ejecutar tests básicos
   */
  async runTests() {
    console.log('\n🧪 Ejecutando tests básicos...');
    
    const runTests = await this.askQuestion(
      '🔄 ¿Deseas ejecutar los tests? (Y/n): '
    );
    
    if (runTests.toLowerCase() !== 'n') {
      try {
        this.execCommand('npm test');
        console.log('✅ Tests ejecutados correctamente');
      } catch (error) {
        console.log('⚠️  Algunos tests fallaron. Revisa la configuración.');
      }
    }
  }

  /**
   * Mostrar resumen final
   */
  showFinalSummary() {
    console.log('\n🎉 ¡Deployment completado!');
    console.log('\n📋 Resumen de configuración:');
    console.log('   ✅ Variables de entorno configuradas');
    console.log('   ✅ Dependencias instaladas');
    console.log('   ✅ Base de datos Supabase configurada');
    console.log('   ✅ Directorios creados');
    console.log('   ✅ Scripts de inicio configurados');
    
    console.log('\n🚀 Próximos pasos:');
    console.log('   1. Revisar el archivo .env y ajustar las configuraciones');
    console.log('   2. Iniciar Redis: docker run -d --name redis-cuentos -p 6379:6379 redis:alpine');
    console.log('   3. Iniciar n8n: npm run dev');
    console.log('   4. Importar el workflow desde: workflows/cuento-generator.json');
    console.log('   5. Probar el endpoint: POST http://localhost:5678/webhook/generate-story');
    
    console.log('\n📚 Documentación:');
    console.log('   - API: docs/api-documentation.md');
    console.log('   - Configuración: docs/configuration-guide.md');
    console.log('   - Troubleshooting: docs/troubleshooting.md');
    
    console.log('\n💡 Comandos útiles:');
    console.log('   - Desarrollo: npm run dev');
    console.log('   - Producción: npm start');
    console.log('   - Tests: npm test');
    console.log('   - Migrar DB: node scripts/migrate-supabase.js');
    console.log('   - Health Check: node scripts/health-check.js');
  }

  /**
   * Ejecutar deployment completo
   */
  async deploy() {
    try {
      console.log('🚀 Iniciando deployment del Generador de Cuentos Infantiles');
      console.log('=' .repeat(60));
      
      await this.checkSystemDependencies();
      await this.createDirectories();
      await this.setupEnvironmentVariables();
      await this.installDependencies();
      await this.setupDatabase();
      await this.setupRedis();
      await this.setupN8n();
      await this.setupStartupScripts();
      await this.runTests();
      
      this.showFinalSummary();
      
    } catch (error) {
      console.error('\n❌ Error durante el deployment:');
      console.error(error.message);
      console.error('\n💡 Revisa los logs y la documentación para resolver el problema');
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
}

// Ejecutar deployment si se llama directamente
if (require.main === module) {
  const deployment = new DeploymentManager();
  deployment.deploy().catch(console.error);
}

module.exports = DeploymentManager;