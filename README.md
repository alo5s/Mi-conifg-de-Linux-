# Dotfiles

Mis configuraciones personales para Arch Linux.

## Contenido

| Carpeta | Descripción |
|---------|-------------|
| `ags/`   | Aylur's GTK Shell — Lanzador de apps + OSD |
| `hypr/`  | Hyprland — Wayland compositor |
| `kitty/` | Kitty — Terminal emulator |
| `nvim/`  | Neovim — Editor de texto |
| `.zshrc` | ZSH shell config |
| `starship.toml` | Starship prompt config |

## Dependencias

### Oficiales (pacman)

| Grupo | Paquetes |
|-------|----------|
| **Core** | `hyprland` `kitty` `neovim` `zsh` |
| **Hyprland** | `brightnessctl` `wireplumber` `pipewire` `pipewire-pulse` `unclutter` `flameshot` `swww` `playerctl` `dolphin` |
| **AGS** | `gtk4` `gtk4-layer-shell` `gjs` `gobject-introspection` `curl` `imagemagick` `fd` |
| **ZSH** | `starship` `zoxide` `eza` |
| **Fuentes** | `ttf-jetbrains-mono-nerd` `noto-color-emoji` `ttf-nerd-fonts-symbols` |
| **Extras** | `lazygit` `btop` `fastfetch` |

### AUR

| Paquete | Propósito |
|---------|-----------|
| `aylur-gts` | AGS — Lanzador de aplicaciones y OSD |
| `lazydocker` | Docker TUI |
| `zen-browser` | Navegador web |
| `obsidian` | Notas |
| `bluetui` | Bluetooth TUI |
| `impala` | — |

### Instalación automática

```bash
# Paquetes oficiales + AUR + zinit + nvm
./install.sh

# Copiar configs
cp -r ags/*       ~/.config/ags/
cp -r hypr/*      ~/.config/hypr/
cp -r kitty/*     ~/.config/kitty/
cp -r nvim/*      ~/.config/nvim/
cp .zshrc         ~/
cp starship.toml  ~/.config/starship.toml
```

### Plugins ZSH (vía zinit)

- `zsh-users/zsh-autosuggestions`

### Plugins Neovim (vía lazy.nvim)

- `tokyonight.nvim` · `nvim-cmp` · `LuaSnip` · `cmp-nvim-lsp` · `cmp-buffer` · `cmp-path`
- `cmp_luasnip` · `telescope.nvim` · `plenary.nvim` · `nvim-colorizer.lua`
- `indent-blankline.nvim` · `nvim-surround`

> Los plugins de Neovim se instalan automáticamente al abrir `nvim` por primera vez.
2 bluetui ❯ lazydocker lazygit, btop

