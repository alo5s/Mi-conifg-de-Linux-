-- lua/core/diagnostics.lua

-------------------------------------------------------
-- 🚨 Diagnósticos LSP
-------------------------------------------------------
local DIAG_PREFIX = "●"

vim.diagnostic.config({
  virtual_text = {
    prefix = DIAG_PREFIX,
    spacing = 2,
  },
  signs = true,
  underline = true,
  update_in_insert = false,
  severity_sort = true,
  float = {
    border = "rounded",
    source = "if_many",
  },
})

