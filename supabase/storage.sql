-- Configuración de Storage para Supabase
-- Buckets para almacenar archivos del generador de cuentos

-- Crear bucket para fotos de niños (entrada)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'photos',
    'photos',
    false,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Crear bucket para imágenes generadas (ilustraciones)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'generated-images',
    'generated-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Crear bucket para PDFs generados
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pdfs',
    'pdfs',
    true,
    52428800, -- 50MB
    ARRAY['application/pdf']
);

-- Crear bucket para templates y assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'templates',
    'templates',
    true,
    1048576, -- 1MB
    ARRAY['text/html', 'text/css', 'image/svg+xml', 'application/json']
);

-- Políticas de acceso para bucket de fotos (privado)
CREATE POLICY "Allow authenticated users to upload photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'photos' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow service role to read photos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'photos' 
        AND auth.role() = 'service_role'
    );

-- Políticas de acceso para imágenes generadas (público para lectura)
CREATE POLICY "Allow public to view generated images" ON storage.objects
    FOR SELECT USING (bucket_id = 'generated-images');

CREATE POLICY "Allow service role to upload generated images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'generated-images' 
        AND auth.role() = 'service_role'
    );

CREATE POLICY "Allow service role to update generated images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'generated-images' 
        AND auth.role() = 'service_role'
    );

-- Políticas de acceso para PDFs (público para lectura)
CREATE POLICY "Allow public to view PDFs" ON storage.objects
    FOR SELECT USING (bucket_id = 'pdfs');

CREATE POLICY "Allow service role to upload PDFs" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'pdfs' 
        AND auth.role() = 'service_role'
    );

CREATE POLICY "Allow service role to update PDFs" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'pdfs' 
        AND auth.role() = 'service_role'
    );

-- Políticas de acceso para templates (público para lectura)
CREATE POLICY "Allow public to view templates" ON storage.objects
    FOR SELECT USING (bucket_id = 'templates');

CREATE POLICY "Allow service role to manage templates" ON storage.objects
    FOR ALL USING (
        bucket_id = 'templates' 
        AND auth.role() = 'service_role'
    );

-- Función para limpiar archivos antiguos automáticamente
CREATE OR REPLACE FUNCTION clean_old_files()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Eliminar fotos de más de 7 días
    DELETE FROM storage.objects 
    WHERE bucket_id = 'photos' 
    AND created_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Eliminar PDFs de más de 30 días que no han sido descargados recientemente
    DELETE FROM storage.objects 
    WHERE bucket_id = 'pdfs' 
    AND created_at < NOW() - INTERVAL '30 days'
    AND name NOT IN (
        SELECT DISTINCT pdf_url 
        FROM cuentos.pdf_outputs 
        WHERE last_downloaded_at > NOW() - INTERVAL '7 days'
    );
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para generar URLs firmadas
CREATE OR REPLACE FUNCTION generate_signed_url(
    bucket_name TEXT,
    file_path TEXT,
    expires_in INTEGER DEFAULT 3600
)
RETURNS TEXT AS $$
BEGIN
    -- Esta función debe ser implementada usando la API de Supabase
    -- Por ahora retorna la URL pública
    RETURN format('https://your-project.supabase.co/storage/v1/object/public/%s/%s', bucket_name, file_path);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear vista para estadísticas de storage
CREATE OR REPLACE VIEW storage_stats AS
SELECT 
    bucket_id,
    COUNT(*) as file_count,
    SUM(COALESCE(metadata->>'size', '0')::bigint) as total_size_bytes,
    AVG(COALESCE(metadata->>'size', '0')::bigint) as avg_size_bytes,
    MIN(created_at) as oldest_file,
    MAX(created_at) as newest_file
FROM storage.objects
GROUP BY bucket_id;

-- Grants para la vista
GRANT SELECT ON storage_stats TO authenticated, service_role;