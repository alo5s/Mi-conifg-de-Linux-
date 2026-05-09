-- lua/core/config.lua

-- 🛠️ Módulo de configuración compartida
-- Patrones y constantes centralizadas utilizadas en toda la configuración

local M = {}

-------------------------------------------------------
-- 📁 File ignore patterns
-------------------------------------------------------

local ignore_dirs = {
  ".git",
  "node_modules",
  "env",
  "venv",
  ".venv",
  "build",
  "dist",
  "target",
  "__pycache__",
}

M.file_ignore_patterns = vim.tbl_map(function(d)
  return d .. "/"
end, ignore_dirs)

M.ripgrep_globs = vim.tbl_flatten(vim.tbl_map(function(d)
  return { "--glob", "!" .. d .. "/**" }
end, ignore_dirs))

-- M.file_ignore_patterns = {
--   "%.git/",
--   "node_modules/",
--   "env/",
--   "venv/",
--   ".venv/",
--   "%.env",
--   "%.env%..+",
--   "build/",
--   "dist/",
--   "target/",
--   "__pycache__/",
--   "%.lock",
-- }
--
-- -------------------------------------------------------
-- -- 🔍 Patrones glob de Ripgrep (ignorado recursivo)
-- -------------------------------------------------------
--
-- M.ripgrep_globs = {
--   "--glob", "!.git/**",
--   "--glob", "!node_modules/**",
--   "--glob", "!env/**",
--   "--glob", "!venv/**",
--   "--glob", "!.venv/**",
--   "--glob", "!.env*",
--   "--glob", "!build/**",
--   "--glob", "!dist/**",
--   "--glob", "!target/**",
--   "--glob", "!__pycache__/**",
--   "--glob", "!*.lock",
-- }

-------------------------------------------------------
-- ⏰ Constantes de la Interfaz de Usuario
-------------------------------------------------------

M.ui = {
  timeout = 2000,     -- Tiempo de espera predeterminado para ventanas temporales
  gap = 2,           -- Espacio predeterminado entre ventanas apiladas
  offset = 0,        -- Desplazamiento predeterminado para posicionamiento
}

-------------------------------------------------------
-- 🎨 Valores predeterminados de la Interfaz de Usuario
-------------------------------------------------------

M.defaults = {
  border = "rounded",
  layout = { 30 },
  position = "center",
  focus = false,
}

return M
