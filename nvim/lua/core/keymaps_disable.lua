-- lua/core/keymaps/disable.lua
-- ☠️ Hardcore keymap disable — modo minimalista extremo

local keymap = vim.keymap.set
local opts = { noremap = true, silent = true }

-- =====================================================
-- ❌ NORMAL MODE
-- =====================================================
local disabled_normal = {
  -- letras legacy
  "Q", "q", "K",

  -- símbolos
  "-", "_", "=", "+", "*", "\\", "|",
  "~", "`",
  "{", "}", "[", "]", "(", ")",
  "'", '"',
  "<", ">", ",", ".", "?", ";",

  -- especiales
  "@", "#", "$", "%", "^", "&",

  -- comandos legacy
  "!", "ZQ", "ZZ", "gQ",

  -- help / man
  "<F1>",

  -- movimientos legacy
  "H", "M", "L",
}

for _, key in ipairs(disabled_normal) do
  keymap("n", key, "<nop>", opts)
end

-- =====================================================
-- ❌ VISUAL MODE
-- =====================================================
local disabled_visual = {
  "-", "_", "=", "+", "*", "\\", "|",
  "~", "`",
  "{", "}", "[", "]", "(", ")",
  "'", '"',
  "<", ">", ",", ".", "?", ";",
  "@", "#", "$", "%", "^", "&",
}

for _, key in ipairs(disabled_visual) do
  keymap("v", key, "<nop>", opts)
end

-- =====================================================
-- ❌ INSERT MODE
-- =====================================================
local disabled_insert = {
  "<C-o>", "<C-r>", "<C-w>", "<C-k>",
  "<C-]>",
}

for _, key in ipairs(disabled_insert) do
  keymap("i", key, "<nop>", opts)
end

