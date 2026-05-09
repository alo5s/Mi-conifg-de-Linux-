local config = require("core.config")

return {
  "nvim-telescope/telescope.nvim",
  tag = "0.1.x",
  dependencies = {
    "nvim-lua/plenary.nvim",
  },

  -------------------------------------------------
  -- ⌨️ Carga diferida por atajos de teclado
  -------------------------------------------------
  keys = {
    { "<leader>ff", function() require("telescope.builtin").find_files() end, desc = "[F]ind [F]iles" },
    { "<leader>fg", function() require("telescope.builtin").live_grep()  end, desc = "[F]ind by [G]rep" },
    { "<leader>fb", function() require("telescope.builtin").buffers()    end, desc = "[F]ind [B]uffers" },
    { "<leader>fh", function() require("telescope.builtin").help_tags()  end, desc = "[F]ind [H]elp" },

    -- 👇 Explorador de archivos del proyecto filtrado
    {
      "<leader>e",
      function()
        require("telescope.builtin").find_files({
          hidden = true,
          path_display = { "tail" }, -- Mostrar SOLO el nombre del archivo
          file_ignore_patterns = config.file_ignore_patterns,
        })
      end,
      desc = "[E]xplore project files",
    },
  },

  -------------------------------------------------
  -- ⚙️ Configuración principal de Telescope
  -------------------------------------------------
  config = function()
    local telescope = require("telescope")
    local actions = require("telescope.actions")

    telescope.setup({
      -------------------------------------------------
      -- 🎨 Configuración predeterminada
      -------------------------------------------------
      defaults = {
        prompt_prefix = "   ",
        selection_caret = " ❯ ",
        entry_prefix = "   ",
        initial_mode = "insert",
        sorting_strategy = "ascending",
        layout_strategy = "horizontal",

        layout_config = {
          horizontal = {
            prompt_position = "top",
            preview_width = 0.55,
          },
          width = 0.90,
          height = 0.85,
        },

        border = true,
        borderchars = { "─", "│", "─", "│", "╭", "╮", "╯", "╰" },
        winblend = 0,

        path_display = { "truncate" },

        -- ❌ Excluir estos archivos/directorios de los resultados
        file_ignore_patterns = config.file_ignore_patterns,

        -- ❌ Excluir búsqueda recursiva dentro de estos archivos/directorios
        vimgrep_arguments = vim.list_extend({
          "rg",
          "--color=never",
          "--no-heading",
          "--with-filename",
          "--line-number",
          "--column",
          "--smart-case",
        }, config.ripgrep_globs),

        mappings = {
          i = {
            ["<Esc>"] = actions.close,
          },
        },
      },

      -------------------------------------------------
      -- 📁 Configuración de selectores específicos
      -------------------------------------------------
      pickers = {
        find_files = {
          hidden = true,
        },
        buffers = {
          sort_lastused = true,
          previewer = false,
        },
      },

      -------------------------------------------------
      -- 🔌 Extensiones configuradas (vacío por ahora)
      -------------------------------------------------
      extensions = {},
    })
  end,
}

