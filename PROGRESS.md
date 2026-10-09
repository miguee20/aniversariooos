# Progreso y Estado del Proyecto (Roadmap & Context)

Este documento contiene el estado detallado de desarrollo, decisiones de arquitectura y la guía exacta de lo completado y lo pendiente para continuar en cualquier sesión futura.

---

## 📌 Contexto General del Proyecto
* **Propósito:** Aplicación web colaborativa y privada para celebrar el aniversario de relación de Migue y Dani.
* **Fecha de inicio de relación (Contador):** **12 de octubre de 2025 a las 02:00 AM** (Hora Central).
* **Usuarios Autorizados:**
  * **Dani:** `danwty7@gmail.com` (UUID: `f5f15b40-22ab-4f54-a3ee-2f899e4e2cd4`)
  * **Migue:** `migueelsaalguero@gmail.com` (UUID: `d17f157d-0299-48f4-a759-a4bed361b613`)
* **Repositorio GitHub:** `https://github.com/miguee20/aniversariooos` (Rama: `main`)
* **Pila Tecnológica:**
  * Framework: Next.js 16.4.0 (App Router, Turbopack, Convención `proxy.ts`, `cacheComponents`).
  * Backend & DB: Supabase (PostgreSQL, Row Level Security, Auth Cookies con `@supabase/ssr`).
  * Media Storage: Cloudinary (Cloud Name: `ek5d9qzb`, subidas directas firmadas vía API).
  * Estilos: Tailwind CSS v4 (Paleta editorial, tipografías *Playfair Display* e *Inter*).
  * Notificaciones: `sonner` (Toasts elegantes, sin `alert()` ni `confirm()` nativos).

---

## 🚀 Estado de las Fases

### Fase 1: Planeación y Configuración Inicial
- [x] Arquitectura de carpetas y base de datos definida (`supabase_schema.sql`).
- [x] Línea gráfica editorial definida (minimalista, fondos claros `#faf9f6`, tipografía romana).
- [x] Configuración de GitHub y entorno de desarrollo.
- [x] Definición de documentos rectores (`PRD.md`, `RULES.md`, `PROGRESS.md`).

### Fase 2: Backend, Autenticación y Seguridad
- [x] Esquema SQL en Supabase ejecutado (tablas `memories`, `time_capsules`, `bucket_list`, `dream_map`).
- [x] RLS activado en todas las tablas para usuarios autenticados.
- [x] Cuentas de Dani y Migue creadas y verificadas en Supabase Auth.
- [x] Autenticación basada en cookies con `@supabase/ssr`.
- [x] Protección de rutas mediante `src/proxy.ts` (Next.js 16.4 convention). Redirige automáticamente a `/login` si no hay sesión.
- [x] Pantalla de Login editorial en `/login` (`src/app/login/page.tsx`).
- [x] Botón global de cierre de sesión (`LogoutButton.tsx`) en el Navbar.
- [x] Conexión de Cloudinary: firma segura en el servidor (`/api/cloudinary/sign`) y subida directa desde el navegador.

### Fase 3: Dashboard Principal (`/`)
- [x] Layout principal responsivo (`src/app/(main)/layout.tsx`) con barra de navegación superior.
- [x] Componente `Counter.tsx`: Contador en vivo de Días, Horas, Minutos y Segundos desde el 12 de octubre de 2025 a las 02:00 AM.
- [x] Modal de subida de recuerdos (`UploadModal.tsx`):
  - Compresión previa en el cliente con `browser-image-compression` (< 1MB).
  - Admite fotos y videos.
  - Campos de fecha y descripción **opcionales**.
  - Subida directa a Cloudinary con firma + inserción automática en la tabla `memories` de Supabase.
  - Toasts de carga, éxito y error con Sonner.
- [ ] **Pendiente:** Componente de Notas de Voz / Buzón en el Dashboard (Grabación con API `MediaRecorder` de HTML5 y reproductor de audio minimalista).

### Fase 4: La Galería ("Nuestra Historia" - `/galeria`)
- [x] Ruta y componentes creados (`src/app/(main)/galeria/page.tsx` y `GalleryClient.tsx`).
- [x] Server-Side Streaming con `<Suspense>` y `await connection()` para compatibilidad con Next.js 16.4.
- [x] Pestañas de filtrado dinámico por Años (2025, 2026, ...) detectadas automáticamente de las fechas de las fotos.
- [x] Centrado inteligente de la cuadrícula:
  - Si hay 1 o 2 fotos, se centran elegantemente en la pantalla sin huecos vacíos a la derecha.
  - Si hay 3 o más fotos, se despliegan en cuadrícula dinámica estilo Pinterest.
- [x] Detección de autor en cada foto: etiquetas *"Por Dani"* o *"Por Migue"*.
- [x] Contador sutil de momentos guardados por año.
- [x] Botón flotante "+ Agregar recuerdo" (FAB) fijo en la esquina inferior derecha, ideal para móvil y PC.
- [x] Visor en Pantalla Completa (Lightbox):
  - Fondo oscuro difuminado, soporte para fotos y videos.
  - Navegación entre fotos del año mediante flechas en pantalla o flechas del teclado (`←` y `→`).
  - Cierre con botón `X` o tecla `Escape`.
  - Muestra descripción en cursiva, fecha en español y autor.
- [x] **Descarga en Alta Resolución:** Botón dentro del Lightbox que utiliza la directiva `fl_attachment` de Cloudinary para descargar la foto original a la galería del teléfono o PC.
- [x] **Edición en Caliente:** Botón en el Lightbox para editar la descripción o fecha mediante `/api/memories/update` sin necesidad de volver a subir el archivo.
- [x] **Borrado Completo y Seguro (Double-Delete):**
  - Botón de eliminar con confirmación Sonner.
  - Endpoint `/api/memories/delete` elimina el archivo físicamente de Cloudinary (`cloudinary.uploader.destroy`) y el registro de Supabase.
  - En dispositivos móviles, la papelera de las tarjetas está oculta para evitar toques accidentales; el borrado en móvil se realiza de forma segura dentro del Lightbox.

---

## 🔮 Funcionalidades Pendientes (Próximos Pasos)

1. **🔒 La Cápsula del Tiempo (`/capsula`):**
   * Vista de formulario con las 5 preguntas fijas.
   * Almacenamiento en tabla `time_capsules` en columnas `answers_migue` y `answers_dani`.
   * Lógica de bloqueo: Cuando ambos responden, las respuestas se sellan hasta el 12 de octubre de 2027.
   * Cuenta regresiva y candado visual hasta la fecha de desbloqueo.

2. **🗺️ El Mapa de Sueños (`/mapa`):**
   * Integración de mapa interactivo con estética minimalista (estilo CartoDB Positron / Leaflet o similar).
   * Agregar pines con ubicación, nombre, descripción y creador (guardado en tabla `dream_map`).
   * Distinción entre lugares visitados vs lugares soñados por visitar.

3. **📝 Nuestra Lista (`/lista`):**
   * To-Do interactivo compartido para metas, películas, restaurantes o citas pendientes.
   * Conectado a la tabla `bucket_list` con casillas de verificación en tiempo real.

4. **🎙️ El Buzón de Audio (Dashboard):**
   * Grabadora de voz en el navegador con botón de micrófono.
   * Subida de audios a Cloudinary e inserción en `memories` (`type: 'voice'`).
   * Reproductor de audio con onda o barra de progreso minimalista.

5. **✨ Pulido Final de Copys e Interfaz:**
   * Ajustes de textos, detalles cosméticos y revisión mobile final antes de despliegue en Vercel.
