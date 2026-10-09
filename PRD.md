# PRD (Product Requirements Document) - Nuestro Espacio

## 1. Visión del Producto
Una aplicación web privada, colaborativa, responsiva y altamente estética diseñada para celebrar y documentar la relación y el aniversario de **Migue y Dani**. Funciona como una bóveda digital íntima y editorial donde ambos comparten recuerdos fotográficos, videos, notas de voz, respuestas a preguntas secretas y planes a futuro.

---

## 2. Usuarios y Autenticación
* **Acceso Privado y Cerrado:** Exclusivo para dos usuarios registrados en Supabase Auth:
  * **Dani:** `danwty7@gmail.com` (UUID: `f5f15b40-22ab-4f54-a3ee-2f899e4e2cd4`)
  * **Migue:** `migueelsaalguero@gmail.com` (UUID: `d17f157d-0299-48f4-a759-a4bed361b613`)
* **Manejo de Sesión:** Cookies seguras administradas por `@supabase/ssr` y filtradas por `src/proxy.ts`. Si un visitante no autenticado intenta ingresar a cualquier ruta de la app, es redirigido a `/login`.
* **Login Editorial:** Pantalla en `/login` con diseño sobrio y elegante.

---

## 3. Pila Tecnológica (Tech Stack)
* **Frontend:** Next.js 16.4.0 (App Router, Turbopack, React 19).
* **Estilos:** Tailwind CSS v4, tipografías Google Fonts (*Playfair Display* e *Inter*).
* **Iconografía:** `lucide-react`.
* **Notificaciones:** `sonner` (Toaster global sin alertas del navegador).
* **Compresión:** `browser-image-compression` en el navegador del usuario antes de la subida.
* **Base de Datos & Auth:** Supabase PostgreSQL con Row Level Security (RLS) habilitado.
* **Almacenamiento de Media:** Cloudinary (Cloud Name: `ek5d9qzb`), subidas directas firmadas y descargas vía `fl_attachment`.
* **Fechas:** `date-fns` en español.

---

## 4. Módulos y Funcionalidades

### 4.1 Inicio / Dashboard (`/`)
* **Contador de Aniversario:** Tiempo transcurrido con precisión de segundos desde el **12 de octubre de 2025 a las 02:00 AM** (Hora Central).
* **Acceso Rápido a Secciones:** Tarjetas visuales hacia *La Galería*, *Mapa de Sueños*, *Cápsula del Tiempo* y *Nuestra Lista*.
* **Modal de Subida (`UploadModal`):** Permite subir fotos y videos con compresión automática a <1MB, con fecha y descripción opcionales.
* **El Buzón (Pendiente):** Grabadora de audio HTML5 y reproductor de notas de voz.

### 4.2 La Galería ("Nuestra Historia" - `/galeria`)
* **Pestañas por Año:** Detección y filtrado dinámico (2025, 2026, ...).
* **Diseño Adaptativo:**
  * Si hay 1 o 2 recuerdos, se centran de forma destacada en la pantalla.
  * Si hay 3 o más recuerdos, se despliegan en un mosaico dinámico estilo Pinterest (masonry).
* **Identificación de Autor:** Cada recuerdo etiqueta si fue subido por *Migue* o por *Dani*.
* **Botón Flotante (FAB):** Acceso permanente en la esquina inferior derecha para agregar recuerdos desde cualquier punto de la galería.
* **Visor Cinemático (Lightbox):**
  * Pantalla completa con fondo difuminado, navegación por teclado (`←`, `→`, `Esc`) o botones táctiles.
  * Muestra fecha formateada, autor y descripción en cursiva.
  * **Descarga:** Permite descargar el archivo original en alta resolución al teléfono o computadora.
  * **Edición en Caliente:** Permite modificar la frase y la fecha sin tener que borrar el archivo.
  * **Eliminación Total:** Borra simultáneamente el registro en Supabase y el archivo físico en Cloudinary.

### 4.3 La Cápsula del Tiempo (`/capsula` - Pendiente)
* Formulario con 5 preguntas reflexivas de pareja.
* Almacenamiento seguro e independiente para cada usuario (`answers_migue`, `answers_dani`).
* Candado con cuenta regresiva que bloquea las respuestas hasta el **12 de octubre de 2027**.

### 4.4 El Mapa de Sueños (`/mapa` - Pendiente)
* Mapa interactivo para colocar pines en ciudades o lugares especiales.
* Soporte para marcar lugares visitados y destinos futuros por conocer juntos.

### 4.5 Nuestra Lista (`/lista` - Pendiente)
* Bucket list colaborativa de citas, películas y metas con casillas de verificación.

---

## 5. Reglas de Negocio para Medios y Archivos
* **Compresión estricta:** Ninguna foto debe enviarse a la nube con un tamaño mayor a 1MB.
* **Eliminación dual:** Todo recurso borrado de la aplicación debe destruirse también en Cloudinary para mantener el uso dentro de la cuota gratuita.
