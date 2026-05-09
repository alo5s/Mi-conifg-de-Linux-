-- lua/modules/features/cmdline/keymaps.lua

-- vim: ts=2 sts=2 sw=2 et

vim.keymap.set("n", "<leader>:", function()
  require("modules.features.cmdline").toggle()
end, { desc = "Abrir cmdline flotante" })

vim.keymap.set("n", ":", function()
  require("modules.features.cmdline").open()
end, { noremap = true })

vim.keymap.set("n", "<leader>c", function()
  require("modules.features.cmdline").toggle()
end, { desc = "💻 Cmdline (Feature)" })
