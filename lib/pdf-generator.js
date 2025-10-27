/**
 * Generador de PDFs profesionales para cuentos infantiles
 * Utiliza Puppeteer y Handlebars para crear PDFs con diseño atractivo
 */

const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class PDFGenerator {
  constructor(options = {}) {
    this.templatesPath = options.templatesPath || path.join(__dirname, '../templates');
    this.outputPath = options.outputPath || path.join(__dirname, '../temp/pdfs');
    this.browser = null;
    
    // Configurar helpers de Handlebars
    this.setupHandlebarsHelpers();
  }

  /**
   * Configurar helpers personalizados para Handlebars
   */
  setupHandlebarsHelpers() {
    // Helper para capitalizar texto
    handlebars.registerHelper('capitalize', function(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    // Helper para comparación
    handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });

    // Helper para formatear fecha
    handlebars.registerHelper('formatDate', function(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    // Helper para contar elementos
    handlebars.registerHelper('length', function(array) {
      return array ? array.length : 0;
    });

    // Helper condicional
    handlebars.registerHelper('if_eq', function(a, b, opts) {
      if (a === b) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    });
  }

  /**
   * Inicializar el navegador Puppeteer
   */
  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  /**
   * Cerrar el navegador
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Cargar y compilar template de Handlebars
   */
  async loadTemplate(templateName = 'story-template.hbs') {
    try {
      const templatePath = path.join(this.templatesPath, templateName);
      const templateContent = await fs.readFile(templatePath, 'utf8');
      return handlebars.compile(templateContent);
    } catch (error) {
      throw new Error(`Error cargando template ${templateName}: ${error.message}`);
    }
  }

  /**
   * Cargar estilos CSS
   */
  async loadStyles(stylesName = 'pdf-styles.css') {
    try {
      const stylesPath = path.join(this.templatesPath, stylesName);
      return await fs.readFile(stylesPath, 'utf8');
    } catch (error) {
      console.warn(`No se pudieron cargar los estilos ${stylesName}: ${error.message}`);
      return '';
    }
  }

  /**
   * Generar HTML a partir de los datos del cuento
   */
  async generateHTML(storyData) {
    try {
      // Cargar template
      const template = await this.loadTemplate();
      
      // Preparar datos para el template
      const templateData = {
        ...storyData,
        images_count: storyData.generatedImages ? storyData.generatedImages.length : 0,
        show_credits: true,
        timestamp: new Date().toISOString()
      };

      // Generar HTML
      const html = template(templateData);
      
      return html;
    } catch (error) {
      throw new Error(`Error generando HTML: ${error.message}`);
    }
  }

  /**
   * Generar PDF a partir de HTML
   */
  async generatePDFFromHTML(html, options = {}) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // Configurar viewport
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2
      });

      // Configurar contenido HTML
      await page.setContent(html, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 60000
      });

      // Esperar a que las fuentes se carguen
      await page.evaluateHandle('document.fonts.ready');

      // Configuración del PDF
      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        },
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        ...options
      };

      // Generar PDF
      const pdfBuffer = await page.pdf(pdfOptions);
      
      await page.close();
      
      return pdfBuffer;
    } catch (error) {
      throw new Error(`Error generando PDF: ${error.message}`);
    }
  }

  /**
   * Guardar PDF en el sistema de archivos
   */
  async savePDF(pdfBuffer, fileName) {
    try {
      // Asegurar que el directorio existe
      await fs.mkdir(this.outputPath, { recursive: true });
      
      const filePath = path.join(this.outputPath, fileName);
      await fs.writeFile(filePath, pdfBuffer);
      
      return {
        filePath,
        fileName,
        size: pdfBuffer.length
      };
    } catch (error) {
      throw new Error(`Error guardando PDF: ${error.message}`);
    }
  }

  /**
   * Método principal para generar un cuento completo en PDF
   */
  async generateStoryPDF(storyData, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validar datos de entrada
      this.validateStoryData(storyData);
      
      // Generar HTML
      const html = await this.generateHTML(storyData);
      
      // Generar PDF
      const pdfBuffer = await this.generatePDFFromHTML(html, options.pdfOptions);
      
      // Generar nombre de archivo único
      const fileName = options.fileName || `cuento_${storyData.id}_${Date.now()}.pdf`;
      
      // Guardar PDF
      const fileInfo = await this.savePDF(pdfBuffer, fileName);
      
      const processingTime = (Date.now() - startTime) / 1000;
      
      return {
        ...fileInfo,
        processingTime,
        success: true,
        metadata: {
          title: storyData.story?.title,
          chapters: storyData.story?.chapters?.length || 0,
          images: storyData.generatedImages?.length || 0,
          wordCount: storyData.story?.word_count || 0,
          style: storyData.style,
          language: storyData.language
        }
      };
    } catch (error) {
      throw new Error(`Error en generación completa de PDF: ${error.message}`);
    }
  }

  /**
   * Validar datos del cuento
   */
  validateStoryData(storyData) {
    const required = ['id', 'name', 'story'];
    const missing = required.filter(field => !storyData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
    }

    if (!storyData.story.title) {
      throw new Error('El cuento debe tener un título');
    }

    if (!storyData.story.chapters || !Array.isArray(storyData.story.chapters)) {
      throw new Error('El cuento debe tener capítulos válidos');
    }

    if (storyData.story.chapters.length === 0) {
      throw new Error('El cuento debe tener al menos un capítulo');
    }
  }

  /**
   * Generar vista previa HTML (para desarrollo/debug)
   */
  async generatePreview(storyData, outputPath) {
    try {
      const html = await this.generateHTML(storyData);
      const previewPath = outputPath || path.join(this.outputPath, `preview_${storyData.id}.html`);
      
      await fs.writeFile(previewPath, html, 'utf8');
      
      return {
        previewPath,
        success: true
      };
    } catch (error) {
      throw new Error(`Error generando vista previa: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de generación
   */
  async getGenerationStats() {
    try {
      const files = await fs.readdir(this.outputPath);
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));
      
      let totalSize = 0;
      for (const file of pdfFiles) {
        const stats = await fs.stat(path.join(this.outputPath, file));
        totalSize += stats.size;
      }
      
      return {
        totalPDFs: pdfFiles.length,
        totalSize,
        averageSize: pdfFiles.length > 0 ? Math.round(totalSize / pdfFiles.length) : 0,
        outputPath: this.outputPath
      };
    } catch (error) {
      return {
        totalPDFs: 0,
        totalSize: 0,
        averageSize: 0,
        error: error.message
      };
    }
  }

  /**
   * Limpiar archivos temporales antiguos
   */
  async cleanupOldFiles(maxAgeHours = 24) {
    try {
      const files = await fs.readdir(this.outputPath);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.outputPath, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
      
      return {
        deletedCount,
        success: true
      };
    } catch (error) {
      return {
        deletedCount: 0,
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = PDFGenerator;