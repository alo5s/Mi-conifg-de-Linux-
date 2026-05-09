-- lua/core/ui.lua

local opt = vim.opt

-------------------------------------------------------
-- 🧼 UI limpia / minimal
-------------------------------------------------------
opt.termguicolors = true
opt.showcmd = false
opt.showmode = false
opt.cmdheight = 1
opt.laststatus = 2
opt.fillchars = { eob = " " }

-------------------------------------------------------
-- 🎨 Adaptación automática al colorscheme
-------------------------------------------------------
vim.api.nvim_create_autocmd("ColorScheme", {
  callback = function()
    local set = vim.api.nvim_set_hl

    -- Transparencia base (hereda del tema)
    set(0, "Normal", { bg = "none" })
    set(0, "NormalNC", { bg = "none" })
    set(0, "NormalFloat", { bg = "none" })

    -- Bordes y separadores (siempre coherentes con el theme)
    set(0, "FloatBorder", { link = "Comment" })
    set(0, "WinSeparator", { link = "Comment" })

    -- Statusline base (theme-agnostic)
    set(0, "StatusLine", { link = "Normal" })
    set(0, "StatusLineNC", { link = "Comment" })
  end,
})

-------------------------------------------------------
-- 📊 Statusline minimal (adaptativa al tema)
-------------------------------------------------------
local api = vim.api

local function simple_statusline()
  local buf = api.nvim_get_current_buf()
  local name = api.nvim_buf_get_name(buf)
  if name == "" then
    return ""
  end

  local filename = vim.fn.fnamemodify(name, ":t")
  local row, col = unpack(api.nvim_win_get_cursor(0))

  return table.concat({
    " ",
    "%#Identifier#", filename,
    "%#Normal#",
    " %= ",
    "%#LineNr#", row .. ":" .. (col + 1),
  })
end

_G.simple_statusline = simple_statusline
vim.opt.statusline = "%!v:lua.simple_statusline()"
