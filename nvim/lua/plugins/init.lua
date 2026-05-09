-- ===================================
-- (3.1) lua/plugins/init.lua
-- Gestor de Plugins (Lazy.nvim)
-- Configuración centralizada del sistema de gestión de plugins
-- ===================================

local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not (vim.uv or vim.loop).fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable",
    lazypath,
  })
end

vim.opt.rtp:prepend(lazypath)

-- Definir la lista maestra de plugins.
-- Aquí se importan las especificaciones de configuración de cada plugin.
local plugins = {
    -- Cargar todas las especificaciones desde 'lua/plugins/spec/' en orden prioritario

    require("plugins.spec.colorscheme"),        -- primero (evita parpadeos al iniciar)
    -- require("plugins.spec.treesitter"),         -- base semántica y resaltado de sintaxis
    -- require("plugins.spec.lsp"),                -- servidor de lenguaje
    require("plugins.spec.cmp"),                -- sistema de completado
    require("plugins.spec.telescope"),          -- buscador y explorador
    require("plugins.spec.indent-blankline"),   -- guías de indentación visual
    require("plugins.spec.colorizer"),          -- resaltado de códigos de color (rgb, hex, etc.)

    -- Ejemplo: Carga de un plugin personalizado o de un archivo específico
    -- require("plugins.spec.mi_plugin_propio"),
    
    --require("plugins.spec.hydra"),
    -- require("plugins.spec.which-key"),

    -- Puedes agregar plugins simples directamente aquí si quieres:
    -- { 'nvim-tree/nvim-tree.lua' },
}

-- Inicializar Lazy.nvim con la lista maestra de plugins
require("lazy").setup(plugins, {})
