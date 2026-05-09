-- modules/ui/float/layout.lua
local M = {}

-- Valores predeterminados globales
M.defaults = {
  width  = 60,
  height = nil, -- nil = auto (#lines)
}

-- Configuraciones predefinidas para diferentes tipos de ventanas
M.presets = {
  default = function(lines, opts)
    return opts.width, opts.height or #lines
  end,

  alert = function(lines, opts)
    return opts.width or 40, opts.height or #lines
  end,

  help = function(_, opts)
    return opts.width  or math.floor(vim.o.columns * 0.6),
           opts.height or math.floor(vim.o.lines * 0.6)
  end,
}

-- ======================
-- Funciones auxiliares
-- ======================
local function resolve_width(width)
  if type(width) == "number" and width > 0 and width <= 1 then
    return math.floor(vim.o.columns * width)
  end
  return width
end

-- ======================
-- Resolución de diseño
-- ======================
function M.resolve(layout, lines, opts)
  opts = opts or {}
  local cfg = vim.tbl_deep_extend("force", M.defaults, opts)

  local width, height

  if type(layout) == "function" then
    width, height = layout(lines, cfg)

  elseif type(layout) == "table" then
    width  = layout[1] or layout.width or cfg.width
    height = layout[2] or layout.height or cfg.height or #lines

  else
    local preset = M.presets[layout or "default"]
    width, height = preset(lines, cfg)
  end

  width  = resolve_width(width)
  height = height or #lines

  return width, height
end

return M

