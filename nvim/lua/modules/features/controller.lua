-- ===================================
-- Importador Centralizado de Features  
-- ===================================
-- Punto de entrada para módulos - SIN lógica extra

local M = {}

-- ======================
-- Importar módulos directamente
-- ======================
M.help = require("modules.features.help")
M.alert = require("modules.features.alert") 
M.cmdline = require("modules.features.cmdline")
return M
