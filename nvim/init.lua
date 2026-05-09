-- ===================================
-- (1) ~/.config/nvim/init.lua
-- Punto de entrada de Neovim
-- ===================================

require("core.options")
require("core.ui")
require("core.diagnostics")
require("core.keymaps")
require("core.commands")
require("plugins")

require("core.autocmds")

