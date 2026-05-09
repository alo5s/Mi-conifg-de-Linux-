# 🧠 Neovim Config – Documentación del Proyecto

Configuración de **Neovim modular, performante y orientada a UX**, con un sistema propio de **ventanas flotantes reutilizables** y **features desacopladas**, evitando dependencias innecesarias.

---

## 🎯 Objetivos del proyecto

- Tener **control total del UI**
- Evitar plugins redundantes
- Código propio, mantenible y extensible
- UX clara, no invasiva
- Buen rendimiento incluso con muchos buffers
- Base tipo *framework*, no solo "config"

---

> Las reglas obligatorias del proyecto se encuentran en `REGLAS.md`

---

## 📁 Estructura del proyecto

~/.config/nvim/
├── init.lua
├── lazy-lock.json
├── PROJECT.md
└── lua/
    ├── core/
    │   ├── autocmds.lua        # Autocomandos globales (alerts, eventos)
    │   ├── commands.lua        # Comandos personalizados
    │   ├── config.lua          # Configuración compartida
    │   ├── diagnostics.lua     # Configuración de diagnostics LSP
    │   ├── keymaps.lua         # Keymaps del CORE + carga de módulos
    │   ├── options.lua         # Opciones base de Neovim
    │   └── ui.lua              # UI general (colores, status, estética)
    │
    ├── modules/
    │   ├── features/
    │   │   ├── alert/
    │   │   │   ├── init.lua        # Motor de alertas (persistentes / temporales)
    │   │   │   ├── content.lua     # Renderizado, iconos y estilos de alertas
    │   │   │   ├── path.lua        # Utilidades de paths para alertas
    │   │   │   ├── highlights.lua  # Resaltados específicos de alertas
    │   │   │   └── keymaps.lua     # 📋 Keymaps específicos de alertas
    │   │   │
    │   │   ├── help/
    │   │   │   ├── init.lua        # Feature Help (toggle, layout)
    │   │   │   ├── content.lua     # Contenido de ayuda
    │   │   │   └── keymaps.lua     # 📋 Keymaps específicos de ayuda
    │   │   │
    │   │   ├── cmdline/
    │   │   │   ├── init.lua        # Línea de comandos flotante
    │   │   │   └── keymaps.lua     # 📋 Keymaps específicos de cmdline
    │   │   │
    │   │   └── controller.lua      # 📋 Importador centralizado de features (sin lógica)
    │   │
    │   └── ui/
    │       └── float/
    │           ├── window.lua  # Apertura de ventanas flotantes
    │           ├── layout.lua  # Cálculo de tamaño dinámico
    │           ├── position.lua# Posicionamiento (center, stack, bottom, etc)
    │           ├── close.lua   # Cierre por tecla / click
    │           ├── focus.lua   # Manejo de foco
    │           └── manager.lua # Gestión de múltiples floats
    │
    └── plugins/
        ├── init.lua            # Inicializa Lazy.nvim
        └── spec/
            ├── cmp.lua
            ├── colorizer.lua
            ├── colorscheme.lua
            ├── indent-blankline.lua
            ├── lsp.lua
            ├── telescope.lua
            └── treesitter.lua


---

## 🔑 Sistema de Keymaps Modulares

El proyecto utiliza un sistema de keymaps modular con separación clara entre core y features:

### 📋 Keymaps del Core (`lua/core/keymaps.lua`)
- **Navegación básica**: `C-h/j/k/l` para moverse entre ventanas
- **Operaciones de archivo**: `<leader>w` (guardar), `<leader>q` (salir), `<leader>Q` (salir todo)
- **Búsqueda con Telescope**: `<leader>ff` (archivos), `<leader>fg` (texto), `<leader>fb` (buffers)
- **Carga de módulos**: Al final del archivo, se cargan los keymaps de features

### 🧩 Keymaps de Features

#### **Help Feature** (`modules/features/help/keymaps.lua`)
- `<leader>h` → Alternar ayuda
- `<leader>fh` → Ayuda (con icono)

#### **Cmdline Feature** (`modules/features/cmdline/keymaps.lua`)
- `<leader>:` → Abrir cmdline flotante
- `<leader>c` → Cmdline (con icono)
- `:` → Sobreescribe el comando nativo para usar versión flotante

#### **Alert Feature** (`modules/features/alert/keymaps.lua`)
- `<leader>at` → Test alerta temporal
- `<leader>ap` → Test alerta persistente  
- `<leader>ac` → Cerrar alertas del buffer actual

### 🔄 Sistema de Activación/Desactivación
Los keymaps de features se cargan desde `core/keymaps.lua` y pueden activarse/desactivar fácilmente comentando las líneas correspondientes:

```lua
-- Activar features
require("modules.features.help.keymaps")
require("modules.features.alert.keymaps") 
require("modules.features.cmdline.keymaps") -- Comentar para desactivar
```

---

## 🪟 Sistema de ventanas flotantes (CORE)

Ubicación:

### 🔹 window.lua
Función principal `window.open(lines, opts)`:

- Crea buffers `nofile`
- Aplica layout dinámico
- Usa posiciones reutilizables
- Maneja foco, bordes y cierre
- Retorna `{ win, buf }`

---

### 🔹 layout.lua
Responsable del tamaño:

- Tamaño fijo
- Tamaño automático según contenido
- Fallbacks de seguridad

---

### 🔹 position.lua
Sistema extensible de posiciones:

Soportadas:
- `center`
- `left_top`
- `left_bottom`
- `right_top`
- `right_bottom`
- `custom`

---

### 🔹 close.lua
Control de cierre:
- Teclas (`q`, `Esc`)
- Click del mouse
- Configurable por ventana

---

### 🔹 focus.lua
Manejo de foco:
- No rompe el flujo de edición
- Restaura foco previo

---

### 🔹 manager.lua
Gestión avanzada:
- Toggle
- Evita duplicados
- Manejo de múltiples floats


---

## 🎛️ Sistema de Features

El proyecto incluye un sistema de features accesible vía `controller.lua` (importador centralizado):

### Features Actuales
- **Help**: Sistema de ayuda con toggle y gestión de contenido
- **Alert**: Motor de alertas persistentes y temporales con múltiples tipos
- **Cmdline**: Línea de comandos flotante con historial y autocompletado

### Integración
- Todas las features usan el sistema de ventanas flotantes unificado
- Comportamiento consistente de cierre (Esc, q, click fuera)
- Manejo de foco predecible
- Defaults independientes por feature
- Keymaps modulares independientes por feature

---

## 🔌 Plugins instalados

| Plugin                      | Estado | Uso |
|-----------------------------|--------|-----|
| telescope.nvim              | Activo | Búsqueda de archivos, texto, buffers y comandos |
| indent-blankline.nvim (ibl) | Activo | Guías visuales de indentación |
| nvim-treesitter             | Activo | Resaltado de sintaxis y análisis de código |
| nvim-cmp                    | Activo | Autocompletado inteligente |
| colorscheme                 | Activo | Tema visual del editor |
| nvim-lspconfig              | Activo | Soporte LSP |
| nvim-colorizer.lua          | Activo | Visualización de colores |


## 🚫 Plugins NO usados

- nvim-tree
- neo-tree
- fzf-lua
- mini.nvim

---

### 🧠 Tipos de alertas

| Tipo | Comportamiento |
|----|----|
| `file_not_saved` | Persistente por buffer |
| `file_saved` | Temporal |
| `warning` | Temporal |
| `info` | Temporal |
| `error` | Temporal |

---

### 🔹 Alertas persistentes (archivo modificado)

- Una alerta por buffer
- No se duplican
- Se muestran solo si:
  - Es un archivo real
  - Es modificable
  - Tiene nombre
  - Está modificado
- Se apilan automáticamente
- Se cierran **solo al guardar**

Ejemplo:

### 🔹 Alertas temporales (archivo guardado)

- Timeout configurable
- No bloquean
- No generan falsas alertas
- No se muestran si no hubo cambios reales

Ejemplo:

---

### 🔹 content.lua
Renderizado desacoplado:
- Iconos dinámicos
- Mensajes por tipo
- Integración con highlights.lua
- Preparado para:
  - Temas
  - Animaciones futuras

### 🔹 path.lua
Utilidades de paths:
- Detección de archivos reales vs buffers internos
- Validación de modificabilidad
- Lógica de nombres de archivo

### 🔹 highlights.lua
Resaltados específicos:
- Configuración de highlights para diferentes tipos de alertas
- Soporte para temas personalizados
- Aplicación dinámica de estilos


### Archivo modificado
Evento:
- Muestra alerta persistente
- No se cierra automáticamente
- No se muestra en buffers internos

---

### Archivo guardado
Evento:
- Cierra alerta persistente del buffer
- Muestra alerta temporal
- Evita spam de alertas falsas

---

## ⌨️ Atajos Principales

### 🎯 Keymaps del Core
| Tecla | Acción |
|-----|------|
| `<leader>ff` | Buscar archivos (Telescope) |
| `<leader>fg` | Buscar texto (Telescope) |
| `<leader>fb` | Buffers abiertos (Telescope) |
| `<leader>fc` | Comandos (Telescope) |
| `<C-h/j/k/l>` | Navegación entre ventanas |
| `<leader>w` | Guardar archivo |
| `<leader>q` | Cerrar ventana |
| `<leader>Q` | Salir todo |

### 🧩 Keymaps de Features

#### Help System
| Tecla | Acción |
|-----|------|
| `<leader>h` | Alternar ventana de ayuda |
| `<leader>fh` | Ayuda (Feature con icono) |

#### Cmdline System  
| Tecla | Acción |
|-----|------|
| `<leader>:` | Abrir cmdline flotante |
| `<leader>c` | Cmdline (Feature con icono) |
| `:` | Comando nativo (versión flotante) |

#### Alert System
| Tecla | Acción |
|-----|------|
| `<leader>at` | Test alerta temporal |
| `<leader>ap` | Test alerta persistente |
| `<leader>ac` | Cerrar alertas del buffer actual |

---

## 📝 Notas

- Lazy.nvim usado para lazy-loading
- Telescope se carga por keymaps
- Config modular y documentada
- Sistema de keymaps modular con activación controlada

## ⚡ Rendimiento

- Sin timers innecesarios
- Sin polling
- Basado en eventos reales
- Buffers livianos (`nofile`)
- Escala bien con muchos buffers abiertos

---

## 🧩 Filosofía de diseño

- **Modularidad absoluta**: Cada feature tiene sus keymaps independientes
- **Reutilizable**: Sistema de ventanas flotantes compartido
- **Predecible**: UX consistente en todas las features
- **UX limpia**: Comportamiento unificado de cierre y foco
- **Código antes que plugins**: Funcionalidad propia en lugar de dependencias externas
- **Activación controlada**: Features pueden activarse/desactivarse fácilmente

---

## 🚀 Estado del proyecto

🟢 Estable  
🟢 Escalable  
🟢 Nivel plugin / framework  
🟢 Keymaps modulares implementados  
🟢 Sistema de features funcionales  

Esta configuración no es solo una "config", es una **base sólida para construir features avanzadas en Neovim** con arquitectura modular y mantenible.

---
