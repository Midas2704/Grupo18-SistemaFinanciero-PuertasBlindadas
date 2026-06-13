# Puertas Blindadas - Frontend Design System

Esta es la especificación técnica completa del diseño del frontend. El proyecto utiliza **React** con **Tailwind CSS**, y una pequeña hoja de estilos personalizada (`index.css`) para variables y micro-interacciones.

## 1. Tipografía y Estilos Base

- **Fuente Principal:** Inter (`'Inter', system-ui, -apple-system, sans-serif`)
- **Pesos de Fuente:** Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800)
- **Fondo Global (Body):** `#f4f4f5` (Tailwind `zinc-100`) o `#f8fafc` (`slate-50`) dependiendo de la zona.
- **Color de Texto Global:** `#18181b` (Tailwind `zinc-900`) o `#1e293b` (`slate-800`).
- **Antialiasing:** Activado (`-webkit-font-smoothing: antialiased`).

### Scrollbar Personalizado
- **Ancho/Alto:** 5px
- **Track (Fondo):** Transparente
- **Thumb (Barra):** `#e2e8f0` (Tailwind `slate-200`), totalmente redondeada (`border-radius: 99px`).
- **Thumb Hover:** `#cbd5e1` (`slate-300`).

---

## 2. Paleta de Colores Corporativa

### Brand (Naranja - Primario)
- **Primary / Brand:** `#ea580c` (`orange-600`) - *Color principal para botones, iconos activos y focos.*
- **Brand Dark:** `#c2410c` (`orange-700`) - *Para hovers profundos.*
- **Brand Light / Background:** `#fff7ed` (`orange-50`) - *Para fondos tenues de avatares o iconos.*

### Neutrales (Grises, Pizarras, Zinc)
- **Sidebar Background:** `#111111` (Negro profundo)
- **Main Layout Background:** `bg-slate-50` (`#f8fafc`)
- **Card Background:** `bg-white` (`#ffffff`)
- **Bordes (Dividers, Cards, Tables):** `#e2e8f0` (`slate-200`) o `#f1f5f9` (`slate-100` / `gray-200`)
- **Textos Secundarios:** `text-gray-500` (`#6b7280`) o `text-slate-400`.

### Estados (Success, Danger, Warning, Info)
El diseño usa combinaciones de fondo suave + texto fuerte para los estados:
- **Éxito (Verde):** Background `#ecfdf5` (`green-50` o `green-100`), Texto `#065f46` o `text-green-700`.
- **Alerta/Error (Rojo):** Background `#fef2f2` (`red-50` o `red-100`), Texto `#991b1b` o `text-red-700`.
- **Advertencia (Amarillo):** Background `#fffbeb` (`yellow-50` o `yellow-100`), Texto `#92400e` o `text-yellow-700`.
- **Info (Morado/Azul):** `bg-blue-50` / `bg-purple-50` con textos fuertes equivalentes.

---

## 3. Layout (Estructura de la Aplicación)

La aplicación usa un contenedor principal con `flex h-screen bg-slate-50 text-slate-800`.

### Sidebar (Navegación Izquierda)
- **Ancho:** Fijo de `264px`.
- **Fondo:** `#111111` (Negro/Gris muy oscuro).
- **Posición:** `fixed h-full z-20`.
- **Bordes:** Divisor derecho sutil con `border-r border-white/5` (`rgba(255,255,255,0.05)`).
- **Header del Sidebar (Logo):** `px-5 py-5`, borde inferior `border-b border-white/8`. Logo naranja (`bg-[#ea580c]`) de `32x32px` (`w-8 h-8 rounded-lg`).
- **Secciones (Labels):**
  - Padding: `1.25rem 0.75rem 0.375rem`.
  - Tipografía: `10px` (`0.625rem`), Negrita (`font-weight: 700`), Mayúsculas (`uppercase`), Espaciado `letter-spacing: 0.1em`.
  - Color: `rgba(100, 116, 139, 0.6)`.
- **Items de Navegación (Enlaces):**
  - **Inactivo:** `text-zinc-400 hover:bg-white/5 hover:text-zinc-100`.
  - **Activo:** `bg-[#ea580c] text-white shadow-sm shadow-orange-900/30`.
  - Padding `px-3 py-2`, redondeado `rounded-lg`, texto `text-sm font-medium`, transición de `150ms`.
- **Footer de Usuario:** Padding `p-3`, borde superior `border-t border-white/8`. Avatar con iniciales: `bg-orange-500/15 text-orange-400 w-8 h-8 rounded-full`.

### Topbar (Cabecera Superior)
- **Altura:** `h-14` (56px).
- **Fondo:** Blanco (`bg-white`).
- **Borde Inferior:** `border-b border-slate-200`.
- **Padding:** `px-8`.
- **Buscador (Input):** Alto de `32px` (`h-8`), ancho `w-52`, redondeado `rounded-lg`, bordes grises (`border border-gray-200`), fondo `bg-gray-50`. Al hacer focus: `focus:ring-2 focus:ring-orange-400 focus:border-orange-400`.
- **Avatar de Perfil:** `w-8 h-8 rounded-full bg-orange-50 text-[#ea580c] font-bold text-xs border border-orange-100`.

### Área Principal (Main Content)
- **Contenedor:** Se le aplica un margen izquierdo equivalente al ancho del sidebar (`ml-[264px]`).
- **Fondo:** `bg-slate-50`.
- **Padding:** `p-8` (32px de espaciado alrededor del contenido).
- **Animación:** Todo el `main` tiene un fade-in suave al cargar de 150ms (entra de abajo hacia arriba `transform: translateY(4px)` a `transform: none`).

---

## 4. Componentes Globales

### Tarjetas (Cards) - Uso General
Se implementa vía la clase `.card` en CSS puro o utilidades de Tailwind:
- **Background:** Blanco (`bg-white`).
- **Border:** `1px solid #e2e8f0` (`border-gray-200`).
- **Radio de Borde:** `0.75rem` (`rounded-lg` / `12px`).
- **Sombra:** `0 1px 3px 0 rgb(0 0 0/.08), 0 1px 2px -1px rgb(0 0 0/.06)` (Equivalente a `shadow-sm` en Tailwind).
- **Header de Card (opcional):** Flexbox con items centrados y justificados entre sí, padding de `1rem 1.5rem`, borde inferior `border-b border-gray-200`, fondo tenue `bg-[#f8fafc]` (`bg-slate-50`).

### Tarjetas de KPI (Dashboard Metrics)
- **Contenedor:** Flex, columna (`flex-col`), padding interior amplio (`p-5`).
- **Borde de Énfasis (Izquierdo):** Algunas métricas destacadas usan bordes gruesos a la izquierda (Ej: `border-l-4 border-l-red-500` o `border-l-green-500`).
- **Icono:** Cuadrado redondeado de `40x40px` (`w-10 h-10 rounded-lg`), fondo coloreado muy claro (`bg-blue-50`, `bg-red-50`) con iconos SVG coloridos.
- **Tipografía de Datos:**
  - Título/Etiqueta: `text-xs font-bold text-gray-500` (En mayúsculas en algunos lugares).
  - Número grande principal: `text-xl font-bold text-gray-900` (o verde/rojo según la métrica).
  - Subtexto descriptivo: `text-xs text-gray-500 mt-1`.

### Tablas de Datos
- **Reset:** `table { border-collapse: separate; border-spacing: 0; }`
- **Contenedor:** Dentro de un bloque blanco redondeado con bordes grises (`border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm`).
- **Cabecera (`thead`):** Fila gris clara (`bg-gray-50`), borde inferior (`border-b border-gray-200`).
  - **Texto (th):** Tamaño de `12px` (`text-xs`), medio grueso (`font-medium`), gris (`text-gray-500`). Padding amplio (`p-4`).
- **Cuerpo (`tbody`):**
  - **Filas (`tr`):** Fondo blanco (`bg-white`), hover gris claro (`hover:bg-gray-50 transition-colors`), borde separador muy sutil (`border-b border-gray-100 last:border-0`).
  - **Celdas (`td`):** Padding de `16px` (`p-4`), texto gris oscuro (`text-sm text-gray-600` o `text-gray-900`). Las referencias usan tipografía monoespaciada (`font-mono text-xs font-medium`).
- **Paginación / Footer Tabla:** Borde superior (`border-t border-gray-200`), items de bloque `flex`, con texto pequeño `text-sm text-gray-500`. Botones de páginas redondeados de `28x28px` (`w-7 h-7`). El activo lleva fondo de la marca (`bg-[#ea580c] text-white`).

### Badges (Etiquetas de Estado)
Existen varias clases personalizadas para los estados:
- **Base:** Inline flex, alineación central, padding vertical diminuto y horizontal mediano (`padding: 0.125rem 0.625rem` o `px-2.5 py-1`), redondeado de 6px (`rounded-md`), tamaño 12px (`text-xs`), fuente semi-bold (`font-medium` a `font-semibold`).
- **Variantes:**
  - **Pendiente / Advertencia:** `bg-yellow-100 text-yellow-700` (`#fffbeb` / `#92400e`).
  - **Completada / Éxito:** `bg-green-100 text-green-700` (`#ecfdf5` / `#065f46`).
  - **Error / Negativo:** `bg-red-100 text-red-700` (`#fef2f2` / `#991b1b`).
  - **Informativa / Neutra:** `bg-blue-100 text-blue-600` o `bg-gray-100 text-gray-700`.

### Botones
- **Botón de Acción Secundaria / Exportar:** Blanco con borde sutil. `px-3 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors`. Suele acompañarse de un SVG.
- **Botón de Paginación / Avatar Button:** Pequeños hover sobre fondo transparente. `p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5`.
- **Botones Primarios (deducidos):** `bg-[#ea580c] hover:bg-[#c2410c] text-white font-medium rounded-lg`.

### Formularios y Modales
- **Focus Global de Inputs:**
  Todos los `<input>`, `<select>` y `<textarea>` al recibir foco pierden su outline por defecto y reciben un anillo doble:
  `box-shadow: 0 0 0 2px white, 0 0 0 4px #ea580c;`
- **Overlay del Modal (`.modal-overlay`):**
  Fondo fijo (`fixed inset-0`), flex centrado, oscurecimiento oscuro y transparente (`rgba(15, 23, 42, 0.5)`), junto con un desenfoque (blur) de `4px` (`backdrop-filter: blur(4px)`).
- **Caja del Modal (`.modal-box`):**
  Fondo blanco, borde muy redondeado (`1rem` / `16px`), ancho total (`w-full`), altura máxima de `92vh` (para no salir de la pantalla), sombra profunda masiva: `0 20px 60px -10px rgb(0 0 0/.28)`.

---

## Resumen para Replicar Rápidamente

Si deseas usar este diseño en un proyecto nuevo configurado con Tailwind CSS, **estas son las claves**:

1. **Configurar Colores en `tailwind.config.js`:**
   Puedes mapear el color principal como el primary del sistema:
   ```javascript
   theme: {
     extend: {
       colors: {
         brand: {
           50: '#fff7ed',
           500: '#ea580c',
           600: '#ea580c',
           700: '#c2410c',
         }
       }
     }
   }
   ```
2. **Fuente:** Importar Google Fonts `Inter` y definirla global.
3. **Fondo Global:** `bg-slate-50` para el contenido, `#111111` para menús laterales oscuros.
4. **Bordes redondeados:** Abusar de `rounded-lg` (12px) y `rounded-xl` (16px, para modales).
5. **Sombras y Bordes:** Las tarjetas casi siempre usan fondos blancos (`bg-white`), bordes super tenues (`border border-gray-200`) y sombras pequeñas (`shadow-sm`).
6. **Estados:** Usar fondos muy claritos con texto muy fuerte del mismo tono para denotar estados (`bg-green-50 text-green-700`).
