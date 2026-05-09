-- lua/core/options.lua

-------------------------------------------------------
-- 🔑 Leader keys (SIEMPRE primero)
-------------------------------------------------------
vim.g.mapleader = " "
vim.g.maplocalleader = " "

-- Acceso rápido a las opciones
local opt = vim.opt

-------------------------------------------------------
-- 🎛️ Valores base (fácil de modificar)
-------------------------------------------------------
local INDENT = 4
local SCROLL = 8
local HISTORY = 1000

-------------------------------------------------------
-- 🔧 Opciones Generales
-------------------------------------------------------
opt.encoding = "utf-8"
opt.mouse = "a"
opt.clipboard = "unnamedplus"

-------------------------------------------------------
-- 👀 Interfaz básica
-------------------------------------------------------
opt.number = true
opt.relativenumber = false
opt.scrolloff = SCROLL
opt.signcolumn = "yes"

-------------------------------------------------------
-- 🧱 Ventanas
-------------------------------------------------------
opt.splitbelow = true
opt.splitright = true

-------------------------------------------------------
-- ✍️ Sangría
-------------------------------------------------------
opt.tabstop = INDENT
opt.shiftwidth = INDENT
opt.expandtab = true

-------------------------------------------------------
-- 🔎 Búsqueda
-------------------------------------------------------
opt.ignorecase = true
opt.smartcase = true
opt.hlsearch = true
opt.incsearch = true
opt.wrap = false

-------------------------------------------------------
-- 🚀 Rendimiento
-------------------------------------------------------
opt.hidden = true
opt.history = HISTORY
opt.updatetime = 300
opt.autoread = true
opt.swapfile = false
opt.pumheight = 10

