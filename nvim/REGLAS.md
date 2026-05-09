# 📐 Reglas del Proyecto — Arquitectura y UX

Este proyecto define un **sistema modular de UI y features sobre Neovim**.  
Para mantener coherencia, escalabilidad y calidad, **toda nueva funcionalidad debe respetar estas reglas**.

---

## 1️⃣ Reglas generales de módulos

- Cada módulo **DEBE** tener sus propios `defaults`.
- Los `defaults` **definen únicamente comportamiento**, nunca lógica:
  - `layout`
  - `position`
  - `focus`
  - `border`
  - `close`
  - `timeout` (si aplica)

- **Ningún módulo puede reutilizar o heredar defaults de otro módulo**.
  - `alert`, `help`, `cmdline`, etc. **son independientes**
  - Compartir defaults genera acoplamiento y rompe escalabilidad

- Los `defaults` **siempre deben poder sobrescribirse** desde configuración externa.

---

## 2️⃣ Separación estricta de responsabilidades

- Un módulo **NO debe**:
  - decidir estilos globales
  - modificar opciones globales de Neovim
  - crear comportamientos que afecten a otros módulos

- Un módulo **SÍ debe**:
  - usar utilidades compartidas (`modules/ui/float/*`)
  - definir solo su flujo interno
  - cerrar y limpiar su propio estado

> **Regla clave:**  
> Un módulo no sabe que existen otros módulos.

---

## 3️⃣ Reglas de UI (críticas)

- **NO crear nuevos componentes visuales** si ya existe uno reutilizable.
- Todo componente visual debe usar:
  - `modules/ui/float/window`
  - `layout`
  - `position`
  - `close`
  - `focus`
  - `manager`

- Está prohibido:
  - duplicar lógica de ventanas flotantes
  - crear variantes visuales innecesarias
  - hardcodear estilos

El objetivo es **una sola UX coherente**, no múltiples UIs.

---

## 4️⃣ UX unificada (regla de oro)

Todos los módulos visuales deben compartir:

- Mismo estilo de borde
- Mismos márgenes y alineación
- Comportamiento de cierre consistente:
  - `<Esc>` siempre cierra
  - `q` cierra (si aplica)
  - click fuera cierra (si está habilitado)
- Manejo de foco predecible
- Transiciones suaves y no intrusivas

> Si el usuario aprende a usar un módulo, **sabe usar todos**.

---

## 5️⃣ Estado y ciclo de vida

- Todo módulo con UI debe manejar explícitamente:
  - `state.win`
  - `state.buf`
  - `state.active`

- El estado:
  - se inicializa en `open()`
  - se limpia completamente en `close()`

- No deben quedar:
  - buffers huérfanos
  - keymaps activos
  - autocomandos residuales

---

## 6️⃣ Reglas de entrada / salida del módulo

- Un módulo **solo expone funciones públicas necesarias**:
  - `open()`
  - `close()`
  - `toggle()` (si aplica)

- Toda función auxiliar debe ser `local`.

- No se permite:
  - modificar el flujo global de Neovim
  - interceptar eventos globales sin justificación clara

---

## 7️⃣ Integración con Neovim nativo

- Cuando Neovim ya provee una funcionalidad nativa:
  - se **envuelve**
  - se **adapta a la UI existente**
  - **no se reimplementa desde cero** sin necesidad real

Ejemplos:
- Cmdline → `prompt`
- Autocompletado → `getcompletion`
- Historial → historial nativo cuando sea posible

---

## 8️⃣ Plugins externos

- Los plugins existen **solo para cubrir funcionalidades que Neovim no ofrece**.
- Un plugin:
  - no debe romper la UX definida
  - no debe imponer UI propia
  - debe integrarse al sistema existente

> Regla práctica:  
> **Si un plugin pelea con la arquitectura, el plugin pierde.**

---

## 9️⃣ Código y mantenimiento

- Código simple > código “ingenioso”
- Claridad antes que optimización prematura
- Cada archivo tiene **una sola responsabilidad**
- Ningún archivo debe crecer sin justificación

---

## 🔟 Filosofía del proyecto

Este proyecto busca que Neovim:

- se sienta **consistente**
- se sienta **predecible**
- se sienta **profesional**
- no se sienta como un conjunto de hacks

> Menos magia, más diseño.

