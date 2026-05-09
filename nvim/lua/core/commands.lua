-- =========================================
--  Comandos personalizados globales
-- =========================================

--------------------------------------------------
-- 📋 :Cp → Copiar al portapapeles del sistema
--------------------------------------------------
-- Uso:
-- :Cp all   → copia todo el archivo
-- :Cp line  → copia la línea actual
-- :Cp word  → copia la palabra bajo el cursor
-- :Cp sel   → copia la selección visual
--------------------------------------------------
vim.api.nvim_create_user_command("Cp", function(opts)
  local arg = opts.args

  if arg == "all" then
    vim.cmd([[normal! ggVG"+y]])

  elseif arg == "line" then
    vim.cmd([[normal! "+yy]])

  elseif arg == "word" then
    vim.cmd([[normal! viw"+y]])

  elseif arg == "sel" then
    if vim.fn.mode():match("[vV\22]") then
      vim.cmd([[normal! "+y]])
    else
      vim.notify(
        "Cp sel: no hay selección visual activa",
        vim.log.levels.WARN,
        { title = "Comando Cp" }
      )
    end
  end
end, {
  nargs = 1,
  complete = function()
    return { "all", "line", "word", "sel" }
  end,
  desc = "Copiar contenido al portapapeles",
})

--------------------------------------------------
-- 📄 :New → Crear y abrir un archivo nuevo
--------------------------------------------------
-- Uso:
-- :New ruta/archivo.ext
--------------------------------------------------
vim.api.nvim_create_user_command("New", function(opts)
  vim.cmd("edit " .. opts.args)
end, {
  nargs = 1,
  desc = "Crear y abrir un archivo nuevo",
})

--------------------------------------------------
-- 💾 :W → Guardar y formatear (LSP)
--------------------------------------------------
-- Guarda el archivo y aplica formato si hay LSP
--------------------------------------------------
-- vim.api.nvim_create_user_command("W", function()
--   vim.cmd("write")
--   pcall(function()
--     vim.lsp.buf.format({ async = true })
--   end)
-- end, {
--   desc = "Guardar y formatear",
-- })

--------------------------------------------------
-- 🧨 :ClearAll → Eliminar todo el contenido del buffer
--------------------------------------------------
vim.api.nvim_create_user_command("ClearAll", function()
  vim.cmd([[normal! ggVGd]])
end, {
  desc = "Eliminar todo el contenido del archivo",
})

-------------------------------------------------
-- :Reload recarga configuracion de Neovim
-------------------------------------------------
vim.api.nvim_create_user_command("Reload", function()
  for name,_ in pairs(package.loaded) do
    if name:match("^user") then
      package.loaded[name] = nil
    end
  end
  dofile(vim.env.MYVIMRC)
  vim.notify("Configuración recargada", vim.log.levels.INFO)
end, {
  desc = "Recargar configuración de Neovim",
})


-----------------------------------------------
---
-----------------------------------------------
vim.api.nvim_create_user_command("Focus", function()
  vim.wo.number = false
  vim.wo.relativenumber = false
  vim.wo.signcolumn = "no"
  vim.cmd("setlocal colorcolumn=")
end, {
  desc = "Modo concentración",
})

---------------------------------------------
-- :Header
--------------------------------------------

vim.api.nvim_create_user_command("Header", function()
  local buf = vim.api.nvim_get_current_buf()
  local file = vim.fn.expand("%:~:.")
  if file == "" then return end

  -- Prefijo de comentario por filetype
  local ft = vim.bo.filetype
  local comment = {
    lua = "--",
    python = "#",
    sh = "#",
    bash = "#",
    javascript = "//",
    typescript = "//",
    c = "//",
    cpp = "//",
    go = "//",
    rust = "//",
  }

  local prefix = comment[ft] or "#"
  local header = prefix .. " " .. file

  local lines = vim.api.nvim_buf_get_lines(buf, 0, 2, false)
  local first = lines[1]
  local second = lines[2]

  if first and first:match("^%s*" .. vim.pesc(prefix)) then
    -- Reemplaza header existente
    vim.api.nvim_buf_set_lines(buf, 0, 1, false, { header })

    -- Asegura línea en blanco debajo
    if second ~= "" then
      vim.api.nvim_buf_set_lines(buf, 1, 1, false, { "" })
    end
  else
    -- Inserta header + línea en blanco
    vim.api.nvim_buf_set_lines(buf, 0, 0, false, { header, "" })
  end
end, {
  desc = "Insertar/actualizar header con nombre del archivo y salto de línea",
})

--------------------------------------------------
-- 🔧 :Refact → Acomodar saltos de línea e indentación
-- ⚠️ No elimina espacios basura
--------------------------------------------------
vim.api.nvim_create_user_command("Refact", function()
  vim.cmd("normal! gg=G")
end, {
  desc = "Reindentar todo el archivo",
})
