-- Keymaps del feature Help
-- vim: ts=2 sts=2 sw=2 et

vim.keymap.set("n", "<leader>h", function()
  require("modules.features.help").toggle()
end, { desc = "Alternar ayuda" })

vim.keymap.set("n", "<leader>fh", function()
  require("modules.features.help").toggle()
end, { desc = "📚 Ayuda (Feature)" })