-- lua/modules/features/cmdline/init.lua

local Manager = require("modules.ui.float.manager")

local Cmdline = {}

-- ======================
-- Estado
-- ======================
local state = {
  win = nil,
  buf = nil,
  active = false,
}

-- ======================
-- Config
-- ======================
local config = require("core.config")
local defaults = {
  position = "center",
  border   = config.defaults.border,
  layout   = { 50 },
  focus    = true,
  close    = { keymap = true },
}

Cmdline.config = vim.deepcopy(defaults)

local function is_open()
  return state.win and vim.api.nvim_win_is_valid(state.win)
end

-- ======================
-- Historial
-- ======================
local history = {}
local history_index = 0

local function history_push(cmd)
  -- Validación de entrada
  if not cmd or cmd == "" then return end
  if history[#history] == cmd then return end
  table.insert(history, cmd)
  history_index = #history + 1
end

local function history_prev()
  if #history == 0 then return end
  history_index = math.max(1, history_index - 1)
  return history[history_index]
end

local function history_next()
  if #history == 0 then return "" end
  history_index = math.min(#history + 1, history_index + 1)
  return history[history_index] or ""
end

-- ======================
-- Reemplazar input actual
-- ======================
local function set_input(text)
  -- borrar todo lo escrito después del prompt
  vim.api.nvim_feedkeys(
    vim.api.nvim_replace_termcodes("<C-u>", true, false, true),
    "n",
    false
  )

  if text and text ~= "" then
    vim.api.nvim_feedkeys(text, "n", false)
  end
end

-- ======================
-- Autocompletado (:)
-- ======================
local function cmdline_complete()
  local line   = vim.fn.getline(".")
  local cursor = vim.fn.col(".") - 1

  -- Validación de entrada
  if not line or line == "" then return end
  if cursor < 0 then return end

  -- quitar ": "
  local input = line:sub(3)
  local rel   = cursor - 2
  if rel < 0 then return end

  local start = rel
  while start > 0 and not input:sub(start, start):match("%s") do
    start = start - 1
  end

  local prefix = input:sub(start + 1)
  local items  = vim.fn.getcompletion(prefix, "cmdline")

  if #items > 0 then
    vim.fn.complete(start + 3, items)
  end
end

-- ======================
-- Open
-- ======================
function Cmdline.open()
  if is_open() then return end
  
  -- Validación de configuración
  if not Cmdline.config then
    Cmdline.config = vim.deepcopy(defaults)
  end

  local win, buf = Manager.open("cmdline", { "" }, {
    single   = true,
    position = Cmdline.config.position,
    layout   = Cmdline.config.layout,
    border   = Cmdline.config.border,
    focus    = Cmdline.config.focus,
    close    = Cmdline.config.close,
  })

  state.win    = win
  state.buf    = buf
  state.active = true
  history_index = #history + 1

  vim.bo[buf].buftype     = "prompt"
  vim.bo[buf].bufhidden  = "wipe"
  vim.bo[buf].swapfile   = false
  vim.bo[buf].modifiable = true

  vim.fn.prompt_setprompt(buf, ": ")

  vim.fn.prompt_setcallback(buf, function(input)
    Cmdline.close()
    history_push(input)

    if input ~= "" then
      vim.schedule(function()
        vim.cmd(input)
      end)
    end
  end)

  -- 🔑 TAB autocomplete
  vim.keymap.set("i", "<Tab>",   cmdline_complete, { buffer = buf })
  vim.keymap.set("i", "<S-Tab>", cmdline_complete, { buffer = buf })

  -- ⬆️ Historial atrás
  vim.keymap.set("i", "<Up>", function()
    local cmd = history_prev()
    if cmd then set_input(cmd) end
  end, { buffer = buf })

  -- ⬇️ Historial adelante
  vim.keymap.set("i", "<Down>", function()
    set_input(history_next())
  end, { buffer = buf })

  -- salir limpio
  vim.keymap.set("i", "<Esc>", function()
    Cmdline.close()
  end, { buffer = buf })

  vim.cmd.startinsert()
end

-- ======================
-- Close
-- ======================
function Cmdline.close()
  if not is_open() then return end
  vim.api.nvim_win_close(state.win, true)
  state = { win = nil, buf = nil, active = false }
end

-- ======================
-- Cleanup
-- ======================
function Cmdline.cleanup()
  if is_open() then
    Cmdline.close()
  end
  
  -- Limpiar historial
  history = {}
  history_index = 0
end

function Cmdline.toggle()
  if is_open() then Cmdline.close() else Cmdline.open() end
end

return Cmdline

