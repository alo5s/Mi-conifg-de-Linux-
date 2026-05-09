local M = {}

function M.attach(win, buf, opts)
  opts = opts or {}

  -- Cierre por teclado
  if opts.keymap ~= false then
    for _, key in ipairs({"<Esc>"}) do
      vim.keymap.set("n", key, function()
        if vim.api.nvim_win_is_valid(win) then
          vim.api.nvim_win_close(win, true)
        end
      end, { buffer = buf, silent = true })
    end
  end

  -- Cierre por click
  if opts.click then
    -- Keymaps en normal y visual para cubrir selección
    for _, mode in ipairs({"n", "v"}) do
      vim.keymap.set(mode, "<LeftMouse>", function()
        if vim.api.nvim_get_current_win() == win and vim.api.nvim_win_is_valid(win) then
          vim.api.nvim_win_close(win, true)
        end
      end, { buffer = buf, silent = true })
    end
  end
end

return M

