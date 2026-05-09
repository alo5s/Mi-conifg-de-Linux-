-- lua/modules/features/help/init.lua

local manager = require("modules.ui.float.manager")
local content = require("modules.features.help.content")

local M = {}

function M.toggle()
  -- Validar que las dependencias estén cargadas
  if not manager or not content then
    vim.notify("Help system dependencies not loaded", vim.log.levels.ERROR)
    return
  end
  
  local config = require("core.config")
  manager.open("help", content, {
    position = "right_bottom",
    layout   = { 35 },
    focus    = config.defaults.focus,
    single   = true, -- 🔑 esta opción ya maneja el toggle internamente
    border   = config.defaults.border,
    close    = { keymap = true, click = true },
  })
end

function M.cleanup()
  -- La limpieza se delega al manager para mantener consistencia
  if manager and manager.cleanup then
    manager.cleanup("help")
  end
end

return M

