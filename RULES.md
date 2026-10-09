# Reglas de Desarrollo y Arquitectura (Development Guidelines)

Estas reglas deben seguirse estrictamente en todo momento para mantener la calidad, rendimiento y coherencia del proyecto.

---

## 1. Diseño y Estética (Editorial / Warm Minimalist)
- **Minimalismo cálido:** Fondo principal `#faf9f6` con acentos en blanco puro (`#ffffff`), bordes sutiles (`border-gray-200`) y sombras difuminadas.
- **Tipografía:** 
  - *Playfair Display* (`font-serif`): Exclusivamente para encabezados, títulos destacados, frases en cursiva y números decorativos.
  - *Inter* (`font-sans`): Para textos de lectura, metadatos, botones, etiquetas y formularios.
- **Mobile First estricto:** 
  - Todo componente debe verse y funcionar perfectamente en pantallas pequeñas primero (`360px` a `430px`).
  - **Seguridad táctil en móviles:** Prohibido colocar acciones destructivas o botones invisibles que dependan de `hover` en elementos táctiles. En móvil, las acciones complejas (como borrar) deben ubicarse dentro de visores o modales dedicados.
- **Espaciado generoso:** Diseñar con aire (`p-4` a `p-8`, `gap-6` a `gap-10`). No sobrecargar ninguna pantalla.

---

## 2. Pila Tecnológica y Convenciones de Next.js (Versión 16.4+)
- **App Router:** Toda la navegación se encuentra dentro de `src/app`.
- **Ruta autenticada:** Las páginas protegidas residen dentro del grupo de rutas `src/app/(main)/` para compartir el layout con navegación y botón de salida.
- **Convención Proxy (Reemplazo de Middleware):** En Next.js 16.4, la convención `middleware.ts` está deprecada. Usar siempre `src/proxy.ts` para la intercepción y refresco de sesiones de Supabase.
- **Manejo de Prerendering Estricto:** Cuando un Server Component consulte la base de datos o dependa de datos de sesión, se debe incluir `await connection()` (de `next/server`) dentro de la función de consulta o envolver el componente en `<Suspense>` para evitar errores de pre-renderizado de valores inestables (`Date.now()`).
- **TypeScript:** Tipado estricto en componentes, parámetros y respuestas de API.

---

## 3. Notificaciones y Retroalimentación Visual (Feedback)
- **PROHIBIDO el uso de `alert()` o `confirm()` nativos:**
  - Todas las notificaciones de éxito, error, carga o confirmación deben implementarse utilizando la librería global `sonner` (`toast.success`, `toast.error`, `toast.loading`, `toast.info`).
  - Para confirmaciones de acciones críticas (como borrar recuerdos), utilizar el patrón de acción de Sonner:
    ```ts
    toast("¿Seguro que deseas eliminar este recuerdo?", {
      action: { label: "Eliminar", onClick: () => ejecutarAccion() },
      cancel: { label: "Cancelar", onClick: () => {} },
    });
    ```
- **Diseño del Toaster:** Fondo blanco, esquinas cuadradas o con radio mínimo, tipografía fina y bordes sutiles acordes a la identidad editorial.

---

## 4. Gestión de Archivos y Almacenamiento (Cloudinary & Supabase)
- **Compresión previa obligatoria:** Ninguna imagen se sube sin pasar antes por `browser-image-compression` (< 1MB).
- **Subidas directas firmadas:** El cliente solicita la firma al servidor en `/api/cloudinary/sign` y envía el archivo directamente a Cloudinary mediante `POST`, aliviando la carga del servidor de Next.js.
- **Doble Eliminación (Double-Delete):** Para economizar almacenamiento en la cuenta gratuita de Cloudinary, **SIEMPRE que se elimine un recuerdo, se debe borrar primero de Cloudinary** (`cloudinary.uploader.destroy(publicId)`) y luego de la base de datos en Supabase. Prohibido dejar archivos huérfanos.
- **Descargas en alta calidad:** Utilizar la directiva `fl_attachment` de Cloudinary para forzar descargas nativas en navegadores móviles y de escritorio.

---

## 5. Control de Cambios y Trabajo Colaborativo
- **`PROGRESS.md` actualizado:** Cada nueva vista o cambio relevante debe registrarse con detalle en `PROGRESS.md`.
- **Commits claros y en español:** Mensajes descriptivos siguiendo la convención convencional (`feat: ...`, `fix: ...`, `refactor: ...`).
- **Seguridad de credenciales:** Ningún secreto, token o clave privada de API debe escribirse en el código fuente. Todo debe gestionarse a través de variables de entorno en `.env.local`.
