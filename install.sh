#!/bin/bash
set -e

echo "========================================"
echo "  Instalación de dotfiles - Arch Linux"
echo "========================================"

# ─── Paquetes oficiales ─────────────────────────────────
OFFICIAL=(
  # Core
  hyprland kitty neovim zsh

  # Hyprland
  brightnessctl wireplumber pipewire pipewire-pulse
  unclutter flameshot swww playerctl dolphin

  # AGS (runtime)
  gtk4 gtk4-layer-shell gjs gobject-introspection
  curl imagemagick fd

  # ZSH
  starship zoxide eza

  # Fuentes
  ttf-jetbrains-mono-nerd noto-color-emoji ttf-nerd-fonts-symbols

  # YA LISTADOS
  lazygit btop fastfetch
)

echo ""
echo ":: Instalando paquetes oficiales..."
sudo pacman -S --needed --noconfirm "${OFFICIAL[@]}"

# ─── AUR ────────────────────────────────────────────────

# Detectar AUR helper
AUR_HELPER=""
for h in yay paru; do
  if command -v $h &>/dev/null; then
    AUR_HELPER=$h
    break
  fi
done

if [ -z "$AUR_HELPER" ]; then
  echo ":: Instalando yay (AUR helper)..."
  sudo pacman -S --needed --noconfirm base-devel git
  git clone https://aur.archlinux.org/yay.git /tmp/yay
  (cd /tmp/yay && makepkg -si --noconfirm)
  AUR_HELPER=yay
fi

AUR_PKGS=(
  aylur-gts           # AGS
  lazydocker
  zen-browser
  obsidian
  bluetui
  impala
)

echo ""
echo ":: Instalando paquetes AUR..."
$AUR_HELPER -S --needed --noconfirm "${AUR_PKGS[@]}"

# ─── Zinit (plugin manager para zsh) ────────────────────
ZINIT_HOME="${XDG_DATA_HOME:-$HOME/.local/share}/zinit/zinit.git"
if [ ! -d "$ZINIT_HOME" ]; then
  echo ""
  echo ":: Instalando zinit..."
  mkdir -p "$(dirname "$ZINIT_HOME")"
  git clone https://github.com/zdharma-continuum/zinit.git "$ZINIT_HOME"
fi

# ─── NVM (opcional) ────────────────────────────────────
if [ ! -d "$HOME/.nvm" ]; then
  echo ""
  echo ":: Instalando nvm..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
fi

# ─── Cambiar shell a zsh ───────────────────────────────
if [ "$SHELL" != "/bin/zsh" ] && [ "$SHELL" != "/usr/bin/zsh" ]; then
  echo ""
  echo ":: Cambiando shell por defecto a zsh..."
  chsh -s "$(which zsh)"
fi

echo ""
echo "========================================"
echo "  Instalación completada."
echo "  Revisa y copia los dotfiles:"
echo "    ./install.sh               # ya lo ejecutaste"
echo "    cp -r ags/*       ~/.config/ags/"
echo "    cp -r hypr/*      ~/.config/hypr/"
echo "    cp -r kitty/*     ~/.config/kitty/"
echo "    cp -r nvim/*      ~/.config/nvim/"
echo "    cp .zshrc         ~/.zshrc"
echo "    cp starship.toml  ~/.config/starship.toml"
echo "========================================"
