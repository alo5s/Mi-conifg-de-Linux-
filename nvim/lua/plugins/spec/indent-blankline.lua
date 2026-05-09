-- lua/plugins/spec/indent-blankline.lua

return {
  "lukas-reineke/indent-blankline.nvim",
  main = "ibl",

  -- Configuración del plugin de guías de indentación
  opts = {
    indent = {
      char = "│",            -- Carácter visual para guías de indentación
    },

    scope = {
      enabled = true,        -- Habilitar resaltado del ámbito actual
      show_start = true,     -- Marcar el inicio del ámbito con una línea
      show_end = false,      -- No marcar el fin del ámbito (menos desorden visual)
    },

    whitespace = {
      remove_blankline_trail = true,
    },
  },
}

