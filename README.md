# Nuestro Espacio 🤍

Aplicación web privada, colaborativa y con diseño editorial creada para conmemorar el aniversario de relación de **Migue y Dani** (inicio: 12 de octubre de 2025 a las 02:00 AM).

---

## 🛠️ Tecnologías y Arquitectura

* **Framework:** Next.js 16.4.0 (App Router, Turbopack, React 19).
* **Diseño:** Tailwind CSS v4, Google Fonts (*Playfair Display* e *Inter*).
* **Base de Datos & Auth:** Supabase (PostgreSQL con Row Level Security y sesiones SSR seguras).
* **Media Storage:** Cloudinary (subidas firmadas y descargas nativas con `fl_attachment`).
* **Notificaciones:** Sonner (estética minimalista editorial).
* **Compresión en Cliente:** `browser-image-compression` (< 1MB antes de subir).

---

## 📂 Documentos de Referencia

* [PROGRESS.md](./PROGRESS.md): Estado detallado de las fases, lo completado y la hoja de ruta pendiente.
* [RULES.md](./RULES.md): Reglas de arquitectura, diseño editorial, mobile-first y manejo de archivos.
* [PRD.md](./PRD.md): Documento de requerimientos del producto y especificaciones funcionales.
* [supabase_schema.sql](./supabase_schema.sql): Esquema SQL completo y políticas RLS de la base de datos.

---

## 🚀 Inicio Rápido (Desarrollo Local)

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/miguee20/aniversariooos.git
   cd aniversariooos
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno en `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ek5d9qzb
   NEXT_PUBLIC_CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```

4. Ejecutar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.
