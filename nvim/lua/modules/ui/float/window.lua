-- modules/ui/float/window.lua

-- 🪟 Creación de ventanas flotantes
-- Módulo central de creación de ventanas - los consumidores controlan la configuración de modificabilidad

local layout   = require("modules.ui.float.layout")
local position = require("modules.ui.float.position")
local close    = require("modules.ui.float.close")

local M = {}

function M.open(lines, opts)
  opts  = opts or {}
  lines = lines or {}

  if #lines == 0 then
    lines = { " " }
  end

  -- ======================
  -- Buffer
  -- ======================
  local buf = vim.api.nvim_create_buf(false, true)

  vim.bo[buf].buftype     = "nofile"
  vim.bo[buf].bufhidden  = "wipe"
  vim.bo[buf].modifiable = true

  vim.api.nvim_buf_set_lines(buf, 0, -1, false, lines)

  -- ======================
  -- Layout
  -- ======================
  local width, height = layout.resolve(opts.layout, lines, opts)

  width  = math.max(width or 60, 10)
  height = math.max(height or #lines or 1, 1)

  -- ======================
  -- Position
  -- ======================
  local pos = opts.position or "center"
  local row, col

  if type(pos) == "function" then
    row, col = pos(width, height, opts.position_opts)
  else
    local fn = position[pos]
    if not fn then
      error("Position inválida: " .. tostring(pos))
    end
    row, col = fn(width, height, opts.position_opts)
  end

  -- ======================
  -- Window
  -- ======================
  local win = vim.api.nvim_open_win(buf, opts.focus == true, {
    relative = "editor",
    row      = row,
    col      = col,
    width    = width,
    height   = height,
    style    = "minimal",
    border   = opts.border or "rounded",
    zindex   = opts.zindex or 50,
  })

  -- ======================
  -- Aplicar estilos adicionales (opcional)
  -- ======================
  if opts.style then
    if opts.style.winhl then
      vim.api.nvim_set_option_value(
        "winhl",
        opts.style.winhl,
        { win = win }
      )
    end
  end

  -- ======================
  -- Configurar opciones de cierre
  -- ======================
  if opts.close ~= false then
    close.attach(win, buf, {
      keymap = opts.close and opts.close.keymap ~= false,
      click  = opts.close and opts.close.click == true,
      focus  = opts.focus == true,
    })
  end

  return win, buf
end

return M

