-- lua/plugins/spec/treesitter.lua

-- 🌳 Resaltado de sintaxis y análisis de código
-- Configuración de Treesitter para resaltado sintáctico y comprensión del código

return {
    'nvim-treesitter/nvim-treesitter',
    build = ':TSUpdate',
    name = "treesitter",
    event = { 'BufReadPost', 'BufNewFile' },
    config = function()
        require('nvim-treesitter.configs').setup({
            ensure_installed = { "lua", "vim", "c", "cpp" },
            sync_install = false,
            highlight = {
                enable = true,
            },
            indent = {
                enable = true,
            },
        })
    end,
}
