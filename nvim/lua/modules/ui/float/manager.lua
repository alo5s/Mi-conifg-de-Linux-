-- modules/ui/float/manager.lua

-- 🪟 Gestor de ventanas flotantes
-- Gestión centralizada de ventanas flotantes de la interfaz de usuario

local window   = require("modules.ui.float.window")
local layout   = require("modules.ui.float.layout")
local position = require("modules.ui.float.position")

local M = {}

M.floats = {}

-- ======================
-- Open
-- ======================
function M.open(name, lines, opts)
  opts = opts or {}

  if opts.single and M.floats[name] and vim.api.nvim_win_is_valid(M.floats[name].win) then
    vim.api.nvim_win_close(M.floats[name].win, true)
    M.floats[name] = nil
    return
  end

  local win, buf = window.open(lines, opts)

  M.floats[name] = {
    win  = win,
    buf  = buf,
    opts = opts,
  }

  return win, buf
end

-- ======================
-- Reflow
-- ======================
function M.reflow()
  for _, entry in pairs(M.floats) do
    if vim.api.nvim_win_is_valid(entry.win) then
      M._reflow_entry(entry)
    end
  end
end

function M._reflow_entry(entry)
  local lines = vim.api.nvim_buf_get_lines(entry.buf, 0, -1, false)
  local opts  = entry.opts or {}

  local width, height = layout.resolve(opts.layout, lines, opts)

  local pos = opts.position or "center"
  local row, col

  if type(pos) == "function" then
    row, col = pos(width, height, opts.position_opts)
  else
    local fn = position[pos]
    if not fn then return end
    row, col = fn(width, height, opts.position_opts)
  end

  vim.api.nvim_win_set_config(entry.win, {
    relative = "editor",
    row      = row,
    col      = col,
    width    = width,
    height   = height,
  })
end

-- ======================
-- Redimensionamiento automático al cambiar tamaño de la ventana
-- ======================
vim.api.nvim_create_autocmd("VimResized", {
  callback = function()
    require("modules.ui.float.manager").reflow()
  end,
})

return M

