-- lua/core/keymaps.lua
-- vim: ts=2 sts=2 sw=2 et

-- 🗺️ Keymaps del CORE de Neovim
-- Keymaps de módulos personalizados → modules/features/*/keymaps.lua

local keymap = vim.keymap.set
local opts = { noremap = true, silent = true }

-- =====================================================
-- 📁 Navegación y búsqueda (Telescope)
-- =====================================================
keymap("n", "<leader>ff", "<cmd>Telescope find_files<cr>", { desc = "Buscar archivos" })
keymap("n", "<leader>tt", "<cmd>Telescope live_grep<cr>", { desc = "Buscar texto" })
keymap("n", "<leader>b", "<cmd>Telescope buffers<cr>", { desc = "Buffers abiertos" })
keymap("n", "<leader>fc", "<cmd>Telescope commands<cr>", { desc = "Comandos" })

-- =====================================================
-- 📁 Navegación 
-- =====================================================
-- Siguiente buffer
vim.keymap.set("n", "<Tab>", ":bnext<CR>", { silent = true })

-- Buffer anterior
vim.keymap.set("n", "<S-Tab>", ":bprevious<CR>", { silent = true })

-- Cerrar buffer
vim.keymap.set("n", "<leader>bd", ":bdelete<CR>", { silent = true })


-- =====================================================
-- 🔄 Navegación entre ventanas
-- =====================================================
keymap("n", "<C-h>", "<C-w>h", { desc = "Mover izquierda" })
keymap("n", "<C-j>", "<C-w>j", { desc = "Mover abajo" })
keymap("n", "<C-k>", "<C-w>k", { desc = "Mover arriba" })
keymap("n", "<C-l>", "<C-w>l", { desc = "Mover derecha" })

-- =====================================================
-- 📝 Edición básica
-- =====================================================
keymap("n", "<leader>w", "<cmd>w<cr>", { desc = "Guardar archivo" })
keymap("n", "<leader>q", "<cmd>q<cr>", { desc = "Cerrar ventana" })
keymap("n", "<leader>Q", "<cmd>qa<cr>", { desc = "Salir todo" })

-- =====================================================
-- ♻️ Edición universal (estilo VSCode / editores modernos)
-- =====================================================

-- Undo / Redo
keymap("n", "u", "u", { desc = "Undo" })
keymap("n", "<C-r>", "<C-r>", { desc = "Redo" })

-- Copiar / Pegar / Cortar
keymap({"n","v"}, "<C-c>", '"+y', { desc = "Copiar" })
keymap({"n","v"}, "<C-x>", '"+d', { desc = "Cortar" })
keymap({"n","i"}, "<C-v>", '<Esc>"+p', { desc = "Pegar" })

-- Seleccionar todo
keymap("n", "<C-a>", "ggVG", { desc = "Seleccionar todo" })

-- Guardar rápido
keymap({"n","i"}, "<C-s>", "<Esc>:w<cr>", { desc = "Guardar" })

-- =====================================================
-- ⚡ Productividad
-- =====================================================

-- Línea arriba / abajo sin modo insert
keymap("n", "<A-j>", ":m .+1<CR>==", { desc = "Mover línea abajo" })
keymap("n", "<A-k>", ":m .-2<CR>==", { desc = "Mover línea arriba" })
keymap("v", "<A-j>", ":m '>+1<CR>gv=gv", { desc = "Mover bloque abajo" })
keymap("v", "<A-k>", ":m '<-2<CR>gv=gv", { desc = "Mover bloque arriba" })

-- Mantener selección al indentear
keymap("v", "<", "<gv")
keymap("v", ">", ">gv")

-- =====================================================
-- 🚫 Desactivar combinaciones innecesarias
-- =====================================================

-- Desactiva teclas molestas por defecto
keymap("n", "Q", "<nop>")
keymap("n", "q:", "<nop>")
keymap("n", "ZQ", "<nop>")
keymap("n", "ZZ", "<nop>")
keymap("n", "K", "<nop>")  -- man pages
keymap("n", "<F1>", "<nop>")


-- =====================================================
-- 🧩 Cargar keymaps de módulos
-- =====================================================
require("modules.features.help.keymaps")
require("modules.features.alert.keymaps")
-- require("modules.features.cmdline.keymaps")  -- desactivado
require("core.keymaps_disable")
