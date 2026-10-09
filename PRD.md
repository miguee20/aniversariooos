# PRD (Product Requirements Document) - Nuestro Espacio

## 1. Visión del Producto
Una aplicación web privada, colaborativa y responsiva diseñada para celebrar y documentar el aniversario de una relación a distancia. Actúa como un espacio íntimo donde ambos usuarios pueden compartir recuerdos, notas de voz, planes a futuro y promesas.

## 2. Pila Tecnológica (Tech Stack)
*   **Frontend:** Next.js (React) + Tailwind CSS
*   **Base de Datos & Auth:** Supabase (PostgreSQL, Row Level Security para privacidad)
*   **Almacenamiento de Media:** Cloudinary
*   **Procesamiento de Archivos:** Compresión en el cliente (Browser) + Validación en el servidor para evitar cargas pesadas antes de enviar a Cloudinary.
*   **Hosting:** Vercel

## 3. Arquitectura y Seguridad
*   **Autenticación:** Sistema cerrado. Solo existirán dos usuarios (Migue y Dani). 
*   **Privacidad:** Las políticas de base de datos (RLS de Supabase) garantizarán que nadie más pueda leer ni escribir en la aplicación.

## 4. Requerimientos de Funcionalidad

### 4.1 Pantalla de Inicio (Dashboard)
*   **Contador Principal:** Cálculo de tiempo transcurrido desde el 12 de Octubre de 2025 (Días, Horas, Minutos).
*   **El Buzón:** Reproductor de notas de voz. Botón para grabar un mensaje nuevo usando la API del navegador (MediaRecorder).
*   **Acción Rápida:** Botón para "Subir recuerdo". Abre un modal para subir fotos/videos. La fecha y descripción son campos **opcionales**.

### 4.2 Nuestros Años (Álbumes)
*   Visualización tipo grilla libre (estilo Pinterest).
*   Recopilación automática de los buzones de voz, fotos y textos en el año correspondiente.
*   Paginación o carga infinita (Lazy loading) para optimizar rendimiento.

### 4.3 Mapa de Sueños
*   Mapa interactivo.
*   Posibilidad de agregar "Pines" con título y descripción sobre lugares a visitar en un futuro.

### 4.4 La Cápsula del Tiempo
*   Formulario con 5 preguntas estáticas.
*   Validación: Al guardar las respuestas de ambos, la visibilidad de esa entrada se bloquea automáticamente mediante lógica en el backend/frontend hasta el 12 de Octubre del siguiente año.

### 4.5 Nuestra Lista (Watchlist/To-Do)
*   Lista compartida en tiempo real (si es posible) o de carga rápida.
*   Funcionalidad de agregar, editar y tachar (completar) elementos (películas, juegos, temas de plática).

## 5. Reglas de Negocio para Media (Fotos/Videos)
*   **Validación de Tamaño:** Límite inicial de 20MB por archivo de video y 10MB por foto en el cliente.
*   **Compresión Frontend:** Antes de subir cualquier imagen, se aplicará compresión en el navegador (ej. con `browser-image-compression`) para reducir su peso a <1MB sin perder calidad notable.
*   **Optimización Cloudinary:** Cloudinary entregará los formatos optimizados (`f_auto, q_auto`) para web.
