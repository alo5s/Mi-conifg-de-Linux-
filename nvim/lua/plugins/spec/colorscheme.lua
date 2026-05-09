-- lua/plugins/spec/colorscheme.lua

-- 🎨 Configuración del esquema de colores
-- Tema TokyoNight con fondo transparente para una UI limpia y moderna

return {
  {
    "folke/tokyonight.nvim",
    priority = 1000,
    lazy = false, -- Cargar inmediatamente para evitar parpadeos
    config = function()
      require("tokyonight").setup({
        -- style = "moon", -- night | storm | moon | day
        transparent = true, -- Fondo transparente (ideal con blur / Hyprland)
        terminal_colors = true,

        styles = {
          comments = { italic = true },
          keywords = { italic = true },
          functions = {},
          variables = {},
          sidebars = "transparent",
          floats = "transparent",
        },

        dim_inactive = false,
        lualine_bold = true,
      })

      vim.cmd.colorscheme("tokyonight")
    end,
  },
}

-- Aqui se dfine que thema se usar como tokyonight o colorscheme etc style
-- vim.g.colors_name = "colorscheme lunaperche"
