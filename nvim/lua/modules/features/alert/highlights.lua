-- lua/modules/features/alert/highlights.lua

-- 🎨 Módulo de resaltados de alertas
-- Definiciones de resaltados centralizadas para el sistema de alertas

local M = {}

-------------------------------------------------------
-- 🚨 Definiciones de resaltados de alertas
-------------------------------------------------------

local function setup_alert_hl()
  vim.api.nvim_set_hl(0, "AlertWarning", {
    fg = "#e0af68",
    bg = "none",
  })

  vim.api.nvim_set_hl(0, "AlertSuccess", {
    fg = "#9ece6a",
    bg = "none",
  })

  vim.api.nvim_set_hl(0, "AlertError", {
    fg = "#f7768e",
    bg = "none",
  })

  vim.api.nvim_set_hl(0, "AlertBorderWarning", {
    fg = "#e0af68",
    bg = "none",
  })

  vim.api.nvim_set_hl(0, "AlertBorderSuccess", {
    fg = "#9ece6a",
    bg = "none",
  })

  vim.api.nvim_set_hl(0, "AlertBorderError", {
    fg = "#f7768e",
    bg = "none",
  })
end

-------------------------------------------------------
-- 🚀 Función de configuración
-------------------------------------------------------

function M.setup()
  -- Aplicar resaltados inmediatamente
  setup_alert_hl()
  
  -- Volver a aplicar cuando cambie el esquema de colores
  vim.api.nvim_create_autocmd("ColorScheme", {
    callback = setup_alert_hl,
  })
end

return M

