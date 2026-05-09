-- Keymaps del feature Alert
-- vim: ts=2 sts=2 sw=2 et

-- Test alertas temporales
vim.keymap.set("n", "<leader>at", function()
  require("modules.features.alert").show("file_saved", { text = "Test alerta temporal" })
end, { desc = "🔔 Test alerta temporal" })

-- Test alertas persistentes
vim.keymap.set("n", "<leader>ap", function()
  require("modules.features.alert").show("file_not_saved", { text = "Test alerta persistente" })
end, { desc = "⚠️ Test alerta persistente" })

-- Cerrar alertas persistentes del buffer actual
vim.keymap.set("n", "<leader>ac", function()
  local buf = vim.api.nvim_get_current_buf()
  require("modules.features.alert").close_persistent(buf)
end, { desc = "🗑️ Cerrar alertas del buffer" })