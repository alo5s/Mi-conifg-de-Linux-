-- lua/modules/features/alert/init.lua
local Manager = require("modules.ui.float.manager")
local content = require("modules.features.alert.content")
local path_utils = require("modules.features.alert.path")
local highlights = require("modules.features.alert.highlights")

local M = {}

-- =========================
-- Estado interno
-- =========================
M.open_alerts = {}       -- alertas temporales (ordenadas)
M.persistent   = {}      -- alertas persistentes por buffer

-- Función de limpieza de estado
function M.cleanup()
  -- Cerrar todas las alertas persistentes
  for bufnr, entry in pairs(M.persistent) do
    if entry.win and vim.api.nvim_win_is_valid(entry.win) then
      vim.api.nvim_win_close(entry.win, true)
    end
  end
  
  -- Cerrar todas las alertas temporales abiertas
  for _, alert in ipairs(M.open_alerts) do
    if alert.win and vim.api.nvim_win_is_valid(alert.win) then
      vim.api.nvim_win_close(alert.win, true)
    end
  end
  
  -- Limpiar estado
  M.open_alerts = {}
  M.persistent = {}
end

M.enabled_types = {
  file_saved     = true,
  file_not_saved = true,
  warning        = false,
}

-- =========================
-- Defaults
-- =========================
local config = require("core.config")
M.defaults = {
  layout   = { 30 },
  position = "stack_right_top",
  focus    = false,
  border   = config.defaults.border,
  close    = { keymap = true, click = true },
  timeout  = config.ui.timeout,
  gap      = config.ui.gap,
  offset   = config.ui.offset,
}

-- =========================
-- Utils
-- =========================
local function is_real_file(bufnr)
  if vim.bo[bufnr].buftype ~= "" then return false end
  if not vim.bo[bufnr].modifiable then return false end
  if vim.api.nvim_buf_get_name(bufnr) == "" then return false end
  return true
end

local function persistent_count()
  local n = 0
  for _ in pairs(M.persistent) do
    n = n + 1
  end
  return n
end

-- =========================
-- Mostrar alerta
-- =========================
function M.show(alert_type, opts)
  opts = opts or {}

  if not M.enabled_types[alert_type] then return end

  local cfg = vim.tbl_deep_extend("force", M.defaults, opts)

  local bufnr    = cfg.bufnr or vim.api.nvim_get_current_buf()
  local filepath = path_utils.compact(vim.api.nvim_buf_get_name(bufnr))
  local filename = vim.fn.fnamemodify(filepath, ":t")

  -- =========================
  -- ALERTA PERSISTENTE
  -- =========================
  if alert_type == "file_not_saved" then
    if not is_real_file(bufnr) then return end
    if not vim.bo[bufnr].modified then return end
    if M.persistent[bufnr] then return end

    local lines, hl = content.render(alert_type, filename, filepath)
    local index = persistent_count() + 1

    local win, buf = Manager.open("alerts", lines, {
      layout        = cfg.layout,
      position      = cfg.position,
      position_opts = { index = index, gap = cfg.gap, offset = cfg.offset },
      focus         = false,
      border        = cfg.border,
      close         = false,
      style         = hl and { winhl = "Normal:" .. hl } or nil,
    })

    M.persistent[bufnr] = { win = win, buf = buf }
    return win, buf
  end

  -- =========================
  -- ALERTA TEMPORAL
  -- =========================
  local lines, hl = content.render(alert_type, filename, filepath)
  local index = #M.open_alerts + 1

  local win, buf = Manager.open("alerts", lines, {
    layout        = cfg.layout,
    position      = cfg.position,
    position_opts = { index = index, gap = cfg.gap, offset = cfg.offset },
    focus         = cfg.focus,
    border        = cfg.border,
    close         = cfg.close,
    style         = hl and { winhl = "Normal:" .. hl } or nil,
  })

  table.insert(M.open_alerts, { win = win, buf = buf })

  vim.defer_fn(function()
    if vim.api.nvim_win_is_valid(win) then
      vim.api.nvim_win_close(win, true)
    end

    for i, alert in ipairs(M.open_alerts) do
      if alert.win == win then
        table.remove(M.open_alerts, i)
        break
      end
    end

    require("modules.ui.float.manager").reflow()
  end, cfg.timeout)

  return win, buf
end

-- =========================
-- Cerrar alerta persistente
-- =========================
function M.close_persistent(bufnr)
  bufnr = bufnr or vim.api.nvim_get_current_buf()
  local entry = M.persistent[bufnr]
  if not entry then return end

  if vim.api.nvim_win_is_valid(entry.win) then
    vim.api.nvim_win_close(entry.win, true)
  end

  M.persistent[bufnr] = nil
  require("modules.ui.float.manager").reflow()
end

-- =========================
-- Habilitar / deshabilitar tipos
-- =========================
function M.set_enabled(alert_type, enabled)
  M.enabled_types[alert_type] = enabled
end

-- =========================
-- Setup highlights
-- =================--------
highlights.setup()

return M

