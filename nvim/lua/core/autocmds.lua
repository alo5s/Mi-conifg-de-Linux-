-- lua/core/autocmds.lua

-- 🔄 Core autocmds configuration
-- Manejo centralizado de eventos para funcionalidad principal

local alert = require("modules.features.alert")
local config = require("core.config")

-- =========================
-- Estado interno
-- =========================
local was_modified = {}

-- =========================
-- Archivo modificado (persistente)
-- =========================
vim.api.nvim_create_autocmd("BufModifiedSet", {
  callback = function(ev)
    if vim.bo[ev.buf].modified then
      alert.show("file_not_saved", {
        timeout = false,
        bufnr = ev.buf,
      })
    end
  end,
})

-- =========================
-- Antes de guardar
-- =========================
vim.api.nvim_create_autocmd("BufWritePre", {
  callback = function(ev)
    was_modified[ev.buf] = vim.bo[ev.buf].modified
  end,
})

-- =========================
-- Archivo guardado
-- =========================
vim.api.nvim_create_autocmd("BufWritePost", {
  callback = function(ev)
    -- cerrar alerta persistente
    alert.close_persistent(ev.buf)

    -- SOLO mostrar si hubo cambios reales
    if was_modified[ev.buf] then
      alert.show("file_saved", {
        bufnr   = ev.buf,
        timeout = config.ui.timeout,
      })
    end

    -- limpiar estado
    was_modified[ev.buf] = nil
  end,
})



