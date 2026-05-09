local M = {}

function M.attach(win, buf, opts)
  opts = opts or {}

  -- Cierre por teclado (si keymap=true)
  if opts.keymap then
    vim.keymap.set("n", "q", function()
      if vim.api.nvim_win_is_valid(win) then
        vim.api.nvim_win_close(win, true)
      end
    end, { buffer = buf, silent = true })

    vim.keymap.set("n", "<Esc>", function()
      if vim.api.nvim_win_is_valid(win) then
        vim.api.nvim_win_close(win, true)
      end
    end, { buffer = buf, silent = true })
  end

  -- Cierre por click (solo si focus=false)
  if opts.click and not opts.focus then
    vim.keymap.set("n", "<LeftMouse>", function()
      if vim.api.nvim_get_current_win() == win and vim.api.nvim_win_is_valid(win) then
        vim.api.nvim_win_close(win, true)
      end
    end, { buffer = buf, silent = true })
  end
end

return M

