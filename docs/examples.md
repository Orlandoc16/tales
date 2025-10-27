# 📖 Ejemplos de Uso - Generador de Cuentos Infantiles

## 🎯 Introducción

Esta guía contiene ejemplos prácticos de cómo usar el sistema de generación de cuentos infantiles. Incluye casos de uso comunes, ejemplos de código y respuestas esperadas.

## 🚀 Ejemplos Básicos

### 1. Cuento Simple sin Foto

#### Petición:
```bash
curl -X POST http://localhost:5678/webhook/generate-story \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María",
    "gender": "female",
    "interests": "mariposas y flores",
    "language": "es",
    "style": "fantasy"
  }'
```

#### Respuesta:
```json
{
  "success": true,
  "story_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "pdf_url": "https://proyecto.supabase.co/storage/v1/object/public/pdfs/cuento_maria_f47ac10b.pdf",
  "title": "María y el Jardín Mágico de las Mariposas",
  "processing_time": 42.5,
  "images_count": 4,
  "word_count": 680,
  "chapters": 4,
  "download_url": "https://proyecto.supabase.co/storage/v1/object/public/pdfs/cuento_maria_f47ac10b.pdf",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### 2. Cuento Educativo con Foto

#### Petición con archivo:
```bash
curl -X POST http://localhost:5678/webhook/generate-story \
  -F "name=Carlos" \
  -F "gender=male" \
  -F "interests=dinosaurios y paleontología" \
  -F "language=es" \
  -F "style=educational" \
  -F "photo=@./carlos_photo.jpg"
```

#### Respuesta:
```json
{
  "success": true,
  "story_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "pdf_url": "https://proyecto.supabase.co/storage/v1/object/public/pdfs/cuento_carlos_a1b2c3d4.pdf",
  "title": "Carlos: El Pequeño Paleontólogo",
  "processing_time": 58.3,
  "images_count": 5,
  "word_count": 920,
  "chapters": 5,
  "download_url": "https://proyecto.supabase.co/storage/v1/object/public/pdfs/cuento_carlos_a1b2c3d4.pdf",
  "timestamp": "2024-01-20T11:15:00.000Z",
  "photo_processed": true
}
```

### 3. Cuento Científico Avanzado

#### Petición:
```bash
curl -X POST http://localhost:5678/webhook/generate-story \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sofia",
    "gender": "female",
    "interests": "robots, inteligencia artificial y programación",
    "language": "es",
    "style": "scientific"
  }'
```

#### Respuesta:
```json
{
  "success": true,
  "story_id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
  "pdf_url": "https://proyecto.supabase.co/storage/v1/object/public/pdfs/cuento_sofia_b2c3d4e5.pdf",
  "title": "Sofia y el Robot Amigable",
  "processing_time": 51.7,
  "images_count": 6,
  "word_count": 1050,
  "chapters": 6,
  "download_url": "https://proyecto.supabase.co/storage/v1/object/public/pdfs/cuento_sofia_b2c3d4e5.pdf",
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

## 🌍 Ejemplos Multiidioma

### 1. Cuento en Inglés

#### Petición:
```bash
curl -X POST http://localhost:5678/webhook/generate-story \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emma",
    "gender": "female",
    "interests": "space exploration and astronauts",
    "language": "en",
    "style": "adventure"
  }'
```

#### Respuesta:
```json
{
  "success": true,
  "story_id": "c3d4e5f6-g7h8-9012-cdef-345678901234",
  "pdf_url": "https://proyecto.supabase.co/storage/v1/object/public/pdfs/story_emma_c3d4e5f6.pdf",
  "title": "Emma's Space Adventure",
  "processing_time": 46.2,
  "images_count": 5,
  "word_count": 780,
  "chapters": 5,
  "download_url": "https://proyecto.supabase.co/storage/v1/object/public/pdfs/story_emma_c3d4e5f6.pdf",
  "timestamp": "2024-01-20T13:30:00.000Z"
}
```

## 🎨 Ejemplos por Estilo

### 1. Estilo Fantasía

#### Características:
- Criaturas mágicas
- Castillos y reinos encantados
- Magia y hechizos
- Colores púrpuras y dorados

#### Ejemplo de Contenido Generado:
```json
{
  "title": "Lucía y el Dragón de Cristal",
  "chapters": [
    {
      "number": 1,
      "title": "El Bosque Encantado",
      "content": "Lucía caminaba por el bosque cuando encontró una cueva brillante...",
      "image_prompt": "A young girl named Lucía discovering a crystal cave in an enchanted forest, magical sparkles, fantasy art style"
    },
    {
      "number": 2,
      "title": "El Dragón Amigable",
      "content": "Dentro de la cueva, un pequeño dragón de cristal la esperaba...",
      "image_prompt": "A friendly crystal dragon meeting a little girl in a magical cave, warm lighting, fantasy illustration"
    }
  ],
  "moral": "La verdadera magia está en la amistad y la bondad."
}
```

### 2. Estilo Aventura

#### Características:
- Exploración y descubrimientos
- Naturaleza y paisajes
- Mapas del tesoro
- Colores tierra y verdes

#### Ejemplo de Contenido Generado:
```json
{
  "title": "Diego y la Isla del Tesoro Perdido",
  "chapters": [
    {
      "number": 1,
      "title": "El Mapa Misterioso",
      "content": "Diego encontró un viejo mapa en el desván de su abuelo...",
      "image_prompt": "A boy named Diego holding an old treasure map in an attic, adventure style, warm colors"
    },
    {
      "number": 2,
      "title": "La Expedición Comienza",
      "content": "Con su mochila llena de provisiones, Diego partió hacia la costa...",
      "image_prompt": "A young explorer with backpack walking towards a tropical beach, adventure illustration"
    }
  ],
  "moral": "Las mejores aventuras comienzan con curiosidad y valentía."
}
```

### 3. Estilo Educativo

#### Características:
- Conceptos de aprendizaje
- Experimentos y descubrimientos
- Personajes que enseñan
- Colores azules y verdes

#### Ejemplo de Contenido Generado:
```json
{
  "title": "Ana y el Laboratorio de las Plantas",
  "chapters": [
    {
      "number": 1,
      "title": "¿Cómo Crecen las Plantas?",
      "content": "Ana siempre se preguntaba cómo las pequeñas semillas se convertían en grandes árboles...",
      "image_prompt": "A curious girl named Ana observing plant growth in a colorful laboratory, educational illustration"
    },
    {
      "number": 2,
      "title": "El Experimento de la Fotosíntesis",
      "content": "La profesora Rosa le enseñó a Ana sobre la fotosíntesis...",
      "image_prompt": "A teacher and student conducting a photosynthesis experiment with plants and sunlight, educational style"
    }
  ],
  "moral": "Aprender sobre la naturaleza nos ayuda a cuidar mejor nuestro planeta."
}
```

### 4. Estilo Científico

#### Características:
- Tecnología y robots
- Laboratorios y experimentos
- Conceptos STEM
- Colores morados y cianes

#### Ejemplo de Contenido Generado:
```json
{
  "title": "Roberto y el Robot Inventor",
  "chapters": [
    {
      "number": 1,
      "title": "El Taller de Inventos",
      "content": "Roberto adoraba construir robots en su taller...",
      "image_prompt": "A boy named Roberto building robots in a high-tech workshop, scientific illustration, futuristic colors"
    },
    {
      "number": 2,
      "title": "La Inteligencia Artificial",
      "content": "Su robot favorito, Chip, podía aprender y tomar decisiones...",
      "image_prompt": "A friendly robot named Chip interacting with a young inventor, AI and technology theme, scientific style"
    }
  ],
  "moral": "La tecnología es más poderosa cuando se usa para ayudar a otros."
}
```

## 🔄 Ejemplos de Consulta de Estado

### 1. Consultar Estado de Generación

#### Petición:
```bash
curl -X GET http://localhost:5678/webhook/story-status/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

#### Respuesta - En Proceso:
```json
{
  "story_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "processing",
  "progress": 65,
  "current_step": "generating_images",
  "estimated_completion": "2024-01-20T10:35:00.000Z",
  "created_at": "2024-01-20T10:30:00.000Z",
  "steps_completed": [
    "input_validation",
    "story_generation",
    "image_generation_started"
  ],
  "steps_remaining": [
    "image_generation_completion",
    "pdf_generation",
    "file_upload"
  ]
}
```

#### Respuesta - Completado:
```json
{
  "story_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "completed",
  "progress": 100,
  "current_step": "completed",
  "pdf_url": "https://proyecto.supabase.co/storage/v1/object/public/pdfs/cuento_maria_f47ac10b.pdf",
  "created_at": "2024-01-20T10:30:00.000Z",
  "completed_at": "2024-01-20T10:32:30.000Z",
  "processing_time": 150.5,
  "total_steps": 6,
  "steps_completed": [
    "input_validation",
    "story_generation",
    "image_generation",
    "pdf_generation",
    "file_upload",
    "cleanup"
  ]
}
```

### 2. Consultar Estado con Error

#### Respuesta - Error:
```json
{
  "story_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "error",
  "progress": 45,
  "current_step": "image_generation",
  "error_message": "API quota exceeded for image generation service",
  "error_code": "QUOTA_EXCEEDED",
  "created_at": "2024-01-20T10:30:00.000Z",
  "failed_at": "2024-01-20T10:31:45.000Z",
  "retry_available": true,
  "retry_after": "2024-01-20T11:00:00.000Z"
}
```

## 📥 Ejemplos de Descarga

### 1. Descarga Directa de PDF

#### Petición:
```bash
curl -X GET http://localhost:5678/webhook/download/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -o cuento_maria.pdf
```

#### Headers de Respuesta:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="cuento_maria_f47ac10b.pdf"
Content-Length: 2048576
Cache-Control: public, max-age=3600
```

### 2. Descarga con Metadata

#### Petición:
```bash
curl -X GET http://localhost:5678/webhook/download/f47ac10b-58cc-4372-a567-0e02b2c3d479?include_metadata=true
```

#### Respuesta:
```json
{
  "pdf_url": "https://proyecto.supabase.co/storage/v1/object/public/pdfs/cuento_maria_f47ac10b.pdf",
  "metadata": {
    "title": "María y el Jardín Mágico de las Mariposas",
    "file_size": 2048576,
    "pages": 12,
    "created_at": "2024-01-20T10:32:30.000Z",
    "style": "fantasy",
    "language": "es",
    "images_count": 4,
    "word_count": 680
  }
}
```

## 🧪 Ejemplos de Testing

### 1. Test de Validación de Entrada

#### Petición Inválida:
```bash
curl -X POST http://localhost:5678/webhook/generate-story \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "gender": "invalid",
    "interests": ""
  }'
```

#### Respuesta de Error:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "name": "Name is required and must be at least 2 characters",
    "gender": "Gender must be one of: male, female, other",
    "interests": "Interests are required and must be at least 5 characters"
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### 2. Test de Límites de Rate

#### Múltiples Peticiones Rápidas:
```bash
# Petición 1-10: Exitosas
for i in {1..10}; do
  curl -X POST http://localhost:5678/webhook/generate-story \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test$i\",\"gender\":\"other\",\"interests\":\"test\"}"
done

# Petición 11: Rate limited
curl -X POST http://localhost:5678/webhook/generate-story \
  -H "Content-Type: application/json" \
  -d '{"name":"Test11","gender":"other","interests":"test"}'
```

#### Respuesta Rate Limited:
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please wait before trying again.",
  "retry_after": 900,
  "limit": 10,
  "window": 900,
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## 🔧 Ejemplos de Integración

### 1. Integración con JavaScript/Node.js

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class CuentosAPI {
  constructor(baseURL = 'http://localhost:5678') {
    this.baseURL = baseURL;
  }

  async generateStory(storyData, photoPath = null) {
    try {
      let response;
      
      if (photoPath && fs.existsSync(photoPath)) {
        // Con foto
        const formData = new FormData();
        Object.keys(storyData).forEach(key => {
          formData.append(key, storyData[key]);
        });
        formData.append('photo', fs.createReadStream(photoPath));
        
        response = await axios.post(`${this.baseURL}/webhook/generate-story`, formData, {
          headers: formData.getHeaders(),
          timeout: 120000
        });
      } else {
        // Sin foto
        response = await axios.post(`${this.baseURL}/webhook/generate-story`, storyData, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 120000
        });
      }
      
      return response.data;
    } catch (error) {
      throw new Error(`Error generating story: ${error.message}`);
    }
  }

  async checkStatus(storyId) {
    try {
      const response = await axios.get(`${this.baseURL}/webhook/story-status/${storyId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error checking status: ${error.message}`);
    }
  }

  async downloadPDF(storyId, outputPath) {
    try {
      const response = await axios.get(`${this.baseURL}/webhook/download/${storyId}`, {
        responseType: 'stream'
      });
      
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Error downloading PDF: ${error.message}`);
    }
  }

  async waitForCompletion(storyId, maxWaitTime = 300000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.checkStatus(storyId);
      
      if (status.status === 'completed') {
        return status;
      } else if (status.status === 'error') {
        throw new Error(`Story generation failed: ${status.error_message}`);
      }
      
      // Esperar 5 segundos antes de la siguiente consulta
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error('Timeout waiting for story completion');
  }
}

// Ejemplo de uso
async function ejemplo() {
  const api = new CuentosAPI();
  
  try {
    // Generar cuento
    const result = await api.generateStory({
      name: 'Ana',
      gender: 'female',
      interests: 'ciencia y experimentos',
      style: 'educational'
    });
    
    console.log('Cuento iniciado:', result.story_id);
    
    // Esperar completación
    const finalStatus = await api.waitForCompletion(result.story_id);
    console.log('Cuento completado:', finalStatus.pdf_url);
    
    // Descargar PDF
    await api.downloadPDF(result.story_id, './cuento_ana.pdf');
    console.log('PDF descargado exitosamente');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

ejemplo();
```

### 2. Integración con Python

```python
import requests
import time
import json
from typing import Optional, Dict, Any

class CuentosAPI:
    def __init__(self, base_url: str = "http://localhost:5678"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.timeout = 120
    
    def generate_story(self, story_data: Dict[str, Any], photo_path: Optional[str] = None) -> Dict[str, Any]:
        """Genera un cuento personalizado"""
        url = f"{self.base_url}/webhook/generate-story"
        
        try:
            if photo_path:
                # Con foto
                files = {'photo': open(photo_path, 'rb')}
                response = self.session.post(url, data=story_data, files=files)
                files['photo'].close()
            else:
                # Sin foto
                headers = {'Content-Type': 'application/json'}
                response = self.session.post(url, json=story_data, headers=headers)
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Error generating story: {str(e)}")
    
    def check_status(self, story_id: str) -> Dict[str, Any]:
        """Consulta el estado de generación"""
        url = f"{self.base_url}/webhook/story-status/{story_id}"
        
        try:
            response = self.session.get(url)
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Error checking status: {str(e)}")
    
    def download_pdf(self, story_id: str, output_path: str) -> None:
        """Descarga el PDF generado"""
        url = f"{self.base_url}/webhook/download/{story_id}"
        
        try:
            response = self.session.get(url, stream=True)
            response.raise_for_status()
            
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    
        except requests.exceptions.RequestException as e:
            raise Exception(f"Error downloading PDF: {str(e)}")
    
    def wait_for_completion(self, story_id: str, max_wait_time: int = 300) -> Dict[str, Any]:
        """Espera a que se complete la generación"""
        start_time = time.time()
        
        while time.time() - start_time < max_wait_time:
            status = self.check_status(story_id)
            
            if status['status'] == 'completed':
                return status
            elif status['status'] == 'error':
                raise Exception(f"Story generation failed: {status.get('error_message', 'Unknown error')}")
            
            # Esperar 5 segundos
            time.sleep(5)
        
        raise Exception("Timeout waiting for story completion")

# Ejemplo de uso
def ejemplo():
    api = CuentosAPI()
    
    try:
        # Datos del cuento
        story_data = {
            'name': 'Carlos',
            'gender': 'male',
            'interests': 'dinosaurios y paleontología',
            'style': 'educational',
            'language': 'es'
        }
        
        # Generar cuento
        result = api.generate_story(story_data)
        print(f"Cuento iniciado: {result['story_id']}")
        
        # Esperar completación
        final_status = api.wait_for_completion(result['story_id'])
        print(f"Cuento completado: {final_status['pdf_url']}")
        
        # Descargar PDF
        api.download_pdf(result['story_id'], 'cuento_carlos.pdf')
        print("PDF descargado exitosamente")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    ejemplo()
```

### 3. Integración con React/Frontend

```jsx
import React, { useState, useCallback } from 'react';
import axios from 'axios';

const CuentoGenerator = () => {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'other',
    interests: '',
    style: 'fantasy',
    language: 'es'
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const generateStory = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      if (photo) {
        data.append('photo', photo);
      }

      const response = await axios.post(
        'http://localhost:5678/webhook/generate-story',
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 120000
        }
      );

      setResult(response.data);
      
      // Polling para verificar estado
      if (response.data.story_id) {
        pollStatus(response.data.story_id);
      }

    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [formData, photo]);

  const pollStatus = async (storyId) => {
    const maxAttempts = 60; // 5 minutos máximo
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5678/webhook/story-status/${storyId}`
        );

        const status = response.data;

        if (status.status === 'completed') {
          setResult(prev => ({ ...prev, ...status }));
          return;
        } else if (status.status === 'error') {
          setError(status.error_message);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000); // Verificar cada 5 segundos
        } else {
          setError('Timeout: La generación está tomando demasiado tiempo');
        }

      } catch (err) {
        setError('Error verificando el estado del cuento');
      }
    };

    checkStatus();
  };

  const downloadPDF = async () => {
    if (!result?.story_id) return;

    try {
      const response = await axios.get(
        `http://localhost:5678/webhook/download/${result.story_id}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cuento_${formData.name.toLowerCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError('Error descargando el PDF');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-purple-600">
        Generador de Cuentos Infantiles
      </h2>

      <form onSubmit={(e) => { e.preventDefault(); generateStory(); }}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Nombre del niño/a:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Género:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Intereses:</label>
          <textarea
            name="interests"
            value={formData.interests}
            onChange={handleInputChange}
            placeholder="Ej: dinosaurios, princesas, robots, ciencia..."
            className="w-full p-2 border rounded-md"
            rows="3"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Estilo:</label>
          <select
            name="style"
            value={formData.style}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="fantasy">Fantasía</option>
            <option value="adventure">Aventura</option>
            <option value="educational">Educativo</option>
            <option value="scientific">Científico</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Foto (opcional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Generando cuento...' : 'Generar Cuento'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded">
          <h3 className="font-bold text-green-800 mb-2">¡Cuento generado!</h3>
          <p><strong>Título:</strong> {result.title}</p>
          <p><strong>Páginas:</strong> {result.chapters}</p>
          <p><strong>Palabras:</strong> {result.word_count}</p>
          
          {result.status === 'completed' && result.pdf_url && (
            <button
              onClick={downloadPDF}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Descargar PDF
            </button>
          )}
          
          {result.status === 'processing' && (
            <p className="text-blue-600 mt-2">
              Procesando... {result.progress}% completado
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CuentoGenerator;
```

## 📊 Ejemplos de Monitoreo

### 1. Verificación de Salud del Sistema

#### Petición:
```bash
curl -X GET http://localhost:5678/webhook/health
```

#### Respuesta:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "services": {
    "supabase": {
      "status": "connected",
      "response_time": 45
    },
    "redis": {
      "status": "connected",
      "response_time": 12
    },
    "gemini_api": {
      "status": "available",
      "response_time": 234
    },
    "nanobanana_api": {
      "status": "available",
      "response_time": 567
    }
  },
  "system": {
    "memory_usage": "45%",
    "cpu_usage": "23%",
    "disk_space": "78% free"
  }
}
```

### 2. Estadísticas de Uso

#### Petición:
```bash
curl -X GET http://localhost:5678/webhook/stats
```

#### Respuesta:
```json
{
  "period": "last_24_hours",
  "total_stories": 156,
  "successful_generations": 148,
  "failed_generations": 8,
  "success_rate": 94.87,
  "average_processing_time": 52.3,
  "cache_hit_rate": 23.1,
  "popular_styles": {
    "fantasy": 45,
    "adventure": 38,
    "educational": 35,
    "scientific": 30
  },
  "languages": {
    "es": 134,
    "en": 22
  }
}
```

---

*Estos ejemplos te ayudarán a integrar y usar efectivamente el sistema de generación de cuentos infantiles. ¡Experimenta con diferentes combinaciones para crear historias únicas!*