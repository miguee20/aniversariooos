# Reglas de Desarrollo (Development Guidelines)

Estas reglas deben seguirse estrictamente durante todo el ciclo de vida del proyecto para mantener el código limpio, optimizado y alineado con la visión original.

## 1. Diseño y UI (Estilo Editorial)
- **Minimalismo:** Evitar el desorden. Utilizar abundante espacio en blanco (`gap`, `padding` y `margin` generosos en Tailwind).
- **Tipografía:** Usar *Playfair Display* exclusivamente para títulos y elementos decorativos (números grandes). Usar *Inter* para el cuerpo de texto, botones y detalles.
- **Mobile First:** Todo componente debe ser diseñado primero para pantallas de celular (`w-full`, `flex-col`) y luego escalado para PC usando los breakpoints de Tailwind (`md:`, `lg:`).
- **Colores:** Mantener la paleta cálida y minimalista (`bg-[#faf9f6]`, negros suaves, grises para texto secundario). Evitar colores primarios saturados a menos que sea una alerta de error.

## 2. Pila y Arquitectura (Stack)
- **Framework:** Utilizar Next.js con el **App Router** (`/app`).
- **Lenguaje:** TypeScript obligatorio. Ayudará a mantener seguros los tipos de datos (como el tipo de un 'Recuerdo' o un 'Mensaje de voz').
- **Estilos:** Tailwind CSS. Prohibido usar CSS en línea o archivos `.css` separados (excepto el archivo global de Tailwind).

## 3. Manejo de Archivos y Rendimiento
- **Regla de Oro de Compresión:** Absolutamente NINGUNA imagen o video debe enviarse al backend/Cloudinary sin haber sido comprimido antes en el cliente (usando librerías como `browser-image-compression`).
- **Límites estandarizados:** Validar que los videos no pasen de 20MB y las fotos de 10MB *antes* de intentar subirlas. 
- **Lazy Loading:** Las imágenes en la grilla de "Nuestros Años" deben cargar bajo demanda para no agotar los datos móviles al entrar a la app.

## 4. Estado y Flujo de Trabajo
- **PROGRESS.md es la ley:** Cada vez que se termine una funcionalidad mayor (Fase), se debe marcar la casilla correspondiente en `PROGRESS.md`.
- **Commits limpios:** Hacer commits frecuentes y con mensajes claros en español (ej. `feat: agregar compresion de imagenes en frontend`).
- **Privacidad estricta:** No dejar tokens, claves de API (Supabase, Cloudinary) o correos electrónicos quemados (hardcoded) en el código. Siempre usar variables de entorno (`.env.local`).
