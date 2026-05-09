-- modules/ui/float/position.lua

-- 📐 Posicionamiento de ventanas flotantes
-- Utilidades de cálculo de posición para ventanas flotantes

local M = {}

local function clamp(v, min, max)
  return math.max(min, math.min(v, max))
end

local function usable_lines()
  return vim.api.nvim_get_option_value("lines", {}) -
         vim.api.nvim_get_option_value("cmdheight", {})
end

local function max_col(width)
  return math.max(0, vim.o.columns - width)
end

-- ======================
-- Center
-- ======================
function M.center(width, height)
  local row = math.floor((usable_lines() - height) / 2)
  local col = math.floor((vim.o.columns - width) / 2)

  return
    clamp(row, 0, usable_lines() - height),
    clamp(col, 0, max_col(width))
end

-- ======================
-- Bottom (centered)
-- ======================
function M.bottom(width, height, opts)
  opts = opts or {}
  local offset = opts.offset or 2

  local row = usable_lines() - height - offset
  local col = math.floor((vim.o.columns - width) / 2)

  return
    clamp(row, 0, usable_lines() - height),
    clamp(col, 0, max_col(width))
end

-- ======================
-- Right Top
-- ======================
function M.right_top(width, height, opts)
  opts = opts or {}
  local offset = opts.offset or 2

  local row = offset
  local col = vim.o.columns - width - offset

  return
    clamp(row, 0, usable_lines() - height),
    clamp(col, 0, max_col(width))
end

-- ======================
-- Right Bottom
-- ======================
function M.right_bottom(width, height, opts)
  opts = opts or {}
  local offset = opts.offset or 2

  local row = usable_lines() - height - offset
  local col = vim.o.columns - width - offset

  return
    clamp(row, 0, usable_lines() - height),
    clamp(col, 0, max_col(width))
end

-- ======================
-- Left Top
-- ======================
function M.left_top(width, height, opts)
  opts = opts or {}
  local offset = opts.offset or 2

  return
    clamp(offset, 0, usable_lines() - height),
    clamp(offset, 0, max_col(width))
end

-- ======================
-- Custom
-- ======================
function M.custom(_, _, opts)
  opts = opts or {}
  return
    clamp(opts.row or 0, 0, usable_lines()),
    clamp(opts.col or 0, 0, vim.o.columns)
end

-- ======================
-- Stack (alerts)
-- ======================
function M.stack_right_top(width, height, opts)
  opts = opts or {}
  local index  = opts.index or 1
  local gap    = opts.gap or 2
  local offset = opts.offset or 2

  local row = offset + (index - 1) * (height + gap)
  local col = vim.o.columns - width - offset

  return
    clamp(row, 0, usable_lines() - height),
    clamp(col, 0, max_col(width))
end

return M

