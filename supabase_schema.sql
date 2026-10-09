-- 1. Tabla de Recuerdos (Memories)
CREATE TABLE public.memories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  memory_date date, -- Opcional, por si quieren poner una fecha específica del pasado
  description text, -- Opcional
  media_url text, -- Opcional (URL de Cloudinary)
  type text NOT NULL CHECK (type IN ('photo', 'video', 'voice', 'text')),
  author_id uuid REFERENCES auth.users NOT NULL
);

-- 2. Tabla de la Cápsula del Tiempo
CREATE TABLE public.time_capsules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  year_number integer NOT NULL UNIQUE, -- ej: 1 (para el primer año)
  answers_migue jsonb,
  answers_dani jsonb,
  unlock_date timestamp with time zone NOT NULL
);

-- 3. Tabla de Nuestra Lista (Watchlist/To-Do)
CREATE TABLE public.bucket_list (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  is_completed boolean DEFAULT false,
  author_id uuid REFERENCES auth.users NOT NULL
);

-- 4. Tabla del Mapa de Sueños
CREATE TABLE public.dream_map (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  location_name text NOT NULL,
  lat double precision,
  lng double precision,
  description text,
  author_id uuid REFERENCES auth.users NOT NULL
);

-- Configuración de Seguridad (Row Level Security - RLS)
-- Activar RLS en todas las tablas para que solo usuarios autenticados puedan leer y escribir.

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bucket_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_map ENABLE ROW LEVEL SECURITY;

-- Políticas para que CUALQUIER usuario autenticado pueda leer y escribir todo 
-- (Como es un sistema cerrado de 2 personas, si están logueados pueden ver y editar todo)

CREATE POLICY "Enable read access for authenticated users" ON public.memories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.memories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON public.time_capsules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.time_capsules FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.time_capsules FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON public.bucket_list FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.bucket_list FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.bucket_list FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON public.dream_map FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.dream_map FOR INSERT WITH CHECK (auth.role() = 'authenticated');
