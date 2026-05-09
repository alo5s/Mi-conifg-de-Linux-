-- lua/plugins/spec/colorizer.lua

return {
  "NvChad/nvim-colorizer.lua",
  event = "BufReadPre", -- Cargar al abrir archivos para procesar colores existentes
  opts = {
    user_default_options = {
      RGB      = true,     -- Colores RGB como #RGB
      RRGGBB  = true,     -- Colores RRGGBB como #RRGGBB
      names   = true,     -- Nombres de colores: red, blue, etc.
      rgb_fn  = true,     -- Funciones rgb(): rgb(255, 255, 255)
      hsl_fn  = true,     -- Funciones hsl(): hsl(0, 100%, 50%)
      css     = true,     -- Variables CSS y sintaxis relacionada
      css_fn  = true,     -- Funciones CSS adicionales
      mode    = "background", -- Modo de visualización: "background" o "foreground"
    },
  },
}

