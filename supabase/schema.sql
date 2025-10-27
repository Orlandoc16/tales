-- Generador de Cuentos Infantiles - Esquema de Base de Datos Supabase
-- Versión: 1.0.0
-- Fecha: 2024

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Crear esquema principal
CREATE SCHEMA IF NOT EXISTS cuentos;

-- Tabla principal de solicitudes de cuentos
CREATE TABLE cuentos.story_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    interests TEXT NOT NULL,
    language VARCHAR(5) DEFAULT 'es',
    style VARCHAR(20) DEFAULT 'fantasy' CHECK (style IN ('fantasy', 'adventure', 'educational', 'scientific')),
    photo_url TEXT,
    photo_metadata JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de contenido de historias generadas
CREATE TABLE cuentos.story_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_request_id UUID NOT NULL REFERENCES cuentos.story_requests(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    chapters JSONB,
    moral_lesson TEXT,
    word_count INTEGER,
    reading_time_minutes INTEGER,
    ai_model_used VARCHAR(50),
    generation_params JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de imágenes generadas
CREATE TABLE cuentos.generated_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_request_id UUID NOT NULL REFERENCES cuentos.story_requests(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(20) DEFAULT 'illustration' CHECK (image_type IN ('cover', 'illustration', 'character')),
    prompt_used TEXT NOT NULL,
    sequence_order INTEGER NOT NULL,
    generation_params JSONB,
    ai_model_used VARCHAR(50),
    file_size_bytes INTEGER,
    dimensions JSONB, -- {width: 1024, height: 1024}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de PDFs generados
CREATE TABLE cuentos.pdf_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_request_id UUID NOT NULL REFERENCES cuentos.story_requests(id) ON DELETE CASCADE,
    pdf_url TEXT NOT NULL,
    file_size_bytes INTEGER,
    page_count INTEGER,
    generation_time_seconds DECIMAL(8,2),
    template_used VARCHAR(50),
    quality_settings JSONB,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cache para optimización
CREATE TABLE cuentos.cache_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_type VARCHAR(50) NOT NULL, -- 'story', 'image', 'pdf'
    content_hash VARCHAR(64) NOT NULL,
    cached_data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    hit_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de métricas y analytics
CREATE TABLE cuentos.analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_request_id UUID REFERENCES cuentos.story_requests(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- 'request_started', 'story_generated', 'images_generated', 'pdf_created', 'download'
    event_data JSONB,
    processing_time_ms INTEGER,
    api_costs JSONB, -- {gemini: 0.05, nanobanana: 0.20}
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración del sistema
CREATE TABLE cuentos.system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización de consultas
CREATE INDEX idx_story_requests_status ON cuentos.story_requests(status);
CREATE INDEX idx_story_requests_created_at ON cuentos.story_requests(created_at);
CREATE INDEX idx_story_requests_name_trgm ON cuentos.story_requests USING gin(name gin_trgm_ops);

CREATE INDEX idx_story_content_story_id ON cuentos.story_content(story_request_id);
CREATE INDEX idx_generated_images_story_id ON cuentos.generated_images(story_request_id);
CREATE INDEX idx_generated_images_sequence ON cuentos.generated_images(story_request_id, sequence_order);

CREATE INDEX idx_pdf_outputs_story_id ON cuentos.pdf_outputs(story_request_id);
CREATE INDEX idx_pdf_outputs_created_at ON cuentos.pdf_outputs(created_at);

CREATE INDEX idx_cache_entries_key ON cuentos.cache_entries(cache_key);
CREATE INDEX idx_cache_entries_expires ON cuentos.cache_entries(expires_at);
CREATE INDEX idx_cache_entries_type ON cuentos.cache_entries(cache_type);

CREATE INDEX idx_analytics_event_type ON cuentos.analytics(event_type);
CREATE INDEX idx_analytics_created_at ON cuentos.analytics(created_at);
CREATE INDEX idx_analytics_story_id ON cuentos.analytics(story_request_id);

-- Triggers para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_story_requests_updated_at 
    BEFORE UPDATE ON cuentos.story_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at 
    BEFORE UPDATE ON cuentos.system_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar cache expirado
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM cuentos.cache_entries WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de uso
CREATE OR REPLACE FUNCTION get_usage_stats(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    total_requests BIGINT,
    completed_requests BIGINT,
    failed_requests BIGINT,
    avg_processing_time DECIMAL,
    total_pdfs_generated BIGINT,
    total_downloads BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE sr.status = 'completed') as completed_requests,
        COUNT(*) FILTER (WHERE sr.status = 'failed') as failed_requests,
        AVG(EXTRACT(EPOCH FROM (sr.processing_completed_at - sr.processing_started_at))) as avg_processing_time,
        COUNT(po.id) as total_pdfs_generated,
        COALESCE(SUM(po.download_count), 0) as total_downloads
    FROM cuentos.story_requests sr
    LEFT JOIN cuentos.pdf_outputs po ON sr.id = po.story_request_id
    WHERE sr.created_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql;

-- Insertar configuración inicial del sistema
INSERT INTO cuentos.system_config (config_key, config_value, description) VALUES
('pdf_templates', '{"default": "modern_kids", "fantasy": "magical_theme", "adventure": "explorer_theme", "educational": "learning_theme"}', 'Templates disponibles para PDFs'),
('image_generation_params', '{"width": 1024, "height": 1024, "quality": "high", "style": "cartoon"}', 'Parámetros por defecto para generación de imágenes'),
('story_generation_params', '{"max_words": 800, "reading_level": "elementary", "include_moral": true}', 'Parámetros por defecto para generación de historias'),
('cache_ttl_hours', '{"stories": 24, "images": 72, "pdfs": 168}', 'Tiempo de vida del cache por tipo de contenido'),
('rate_limits', '{"requests_per_minute": 10, "requests_per_hour": 100}', 'Límites de velocidad de requests');

-- Habilitar Row Level Security (RLS)
ALTER TABLE cuentos.story_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentos.story_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentos.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentos.pdf_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentos.analytics ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas (ajustar según necesidades)
CREATE POLICY "Allow public read access to completed stories" ON cuentos.story_requests
    FOR SELECT USING (status = 'completed');

CREATE POLICY "Allow public insert for new requests" ON cuentos.story_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to story content" ON cuentos.story_content
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to generated images" ON cuentos.generated_images
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to pdf outputs" ON cuentos.pdf_outputs
    FOR SELECT USING (true);

-- Grants para roles anónimos y autenticados
GRANT USAGE ON SCHEMA cuentos TO anon, authenticated;
GRANT SELECT, INSERT ON cuentos.story_requests TO anon, authenticated;
GRANT SELECT ON cuentos.story_content TO anon, authenticated;
GRANT SELECT ON cuentos.generated_images TO anon, authenticated;
GRANT SELECT ON cuentos.pdf_outputs TO anon, authenticated;
GRANT SELECT ON cuentos.system_config TO anon, authenticated;

-- Grants adicionales para usuarios autenticados
GRANT UPDATE ON cuentos.story_requests TO authenticated;
GRANT INSERT ON cuentos.story_content TO authenticated;
GRANT INSERT ON cuentos.generated_images TO authenticated;
GRANT INSERT ON cuentos.pdf_outputs TO authenticated;
GRANT INSERT ON cuentos.analytics TO authenticated;

-- Comentarios para documentación
COMMENT ON SCHEMA cuentos IS 'Esquema principal para el generador de cuentos infantiles personalizados';
COMMENT ON TABLE cuentos.story_requests IS 'Solicitudes de generación de cuentos con datos del niño';
COMMENT ON TABLE cuentos.story_content IS 'Contenido de las historias generadas por IA';
COMMENT ON TABLE cuentos.generated_images IS 'Imágenes ilustrativas generadas para cada cuento';
COMMENT ON TABLE cuentos.pdf_outputs IS 'PDFs finales generados listos para descarga';
COMMENT ON TABLE cuentos.cache_entries IS 'Cache para optimizar rendimiento y reducir costos de API';
COMMENT ON TABLE cuentos.analytics IS 'Métricas y eventos para análisis de uso del sistema';