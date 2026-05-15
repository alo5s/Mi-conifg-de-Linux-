# =====================================================
# 🚀 ZSH CLEAN CONFIG 2026
# =====================================================

# =====================================================
# 📦 ZINIT (SAFE LOAD FIXED)
# =====================================================

export ZINIT_HOME="${XDG_DATA_HOME:-$HOME/.local/share}/zinit"

if [[ -f "$ZINIT_HOME/zinit.git/zinit.zsh" ]]; then
    source "$ZINIT_HOME/zinit.git/zinit.zsh"
else
    echo "⚠️ Zinit no encontrado"
    return
fi

# =====================================================
# ⭐ STARSHIP PROMPT
# =====================================================

eval "$(starship init zsh)"

# =====================================================
# ⚡ COMPLETIONS
# =====================================================

autoload -Uz compinit
compinit -d "${XDG_CACHE_HOME:-$HOME/.cache}/zcompdump"

# =====================================================
# 🧠 OPTIONS (MINIMAL)
# =====================================================

setopt AUTO_CD
setopt EXTENDED_GLOB
setopt INTERACTIVE_COMMENTS

setopt SHARE_HISTORY
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_REDUCE_BLANKS
setopt APPEND_HISTORY

setopt NO_BEEP
setopt NO_CASE_GLOB

# =====================================================
# 📜 HISTORY
# =====================================================

HISTFILE="$HOME/.zsh_history"
HISTSIZE=10000
SAVEHIST=10000

# =====================================================
# 🎨 COMPLETION UI
# =====================================================

zstyle ':completion:*' menu select
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'
zstyle ':completion:*' list-dirs-first true

# =====================================================
# 🔌 PLUGINS (MINIMAL & CLEAN)
# =====================================================

# Autosuggestions (soft)
zinit light zsh-users/zsh-autosuggestions
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=#7f849c'

# =====================================================
# 📂 ZOXIDE (SMART CD)
# =====================================================

eval "$(zoxide init zsh)"

# =====================================================
# 📦 EZA (MODERN LS)
# =====================================================

alias ls='eza --icons=auto --group-directories-first'
alias ll='eza -lah --icons=auto --git'
alias tree='eza --tree --icons=auto'

export EZA_COLORS="di=38;5;250:ln=38;5;110:ex=38;5;108:fi=38;5;252"

# =====================================================
# 🧰 ALIASES
# =====================================================

alias c='clear'
alias ..='cd ..'
alias ...='cd ../..'

alias v='nvim'
alias code='nvim'

alias gs='git status'
alias ga='git add .'
alias gc='git commit'
alias gp='git push'

alias open='xdg-open'
alias reload='source ~/.zshrc'

# =====================================================
# 📦 PACMAN
# =====================================================

alias update='sudo pacman -Syu'
alias install='sudo pacman -S'
alias remove='sudo pacman -Rns'
alias search='pacman -Ss'

# =====================================================
# 🌍 ENVIRONMENT
# =====================================================

export LANG=es_AR.UTF-8
export LC_ALL=es_AR.UTF-8

export EDITOR=nvim
export VISUAL=nvim

export PATH="$HOME/.local/bin:$PATH"

# =====================================================
# 🟢 NVM (optional)
# =====================================================

export NVM_DIR="$HOME/.nvm"
[[ -s "$NVM_DIR/nvm.sh" ]] && source "$NVM_DIR/nvm.sh"

# =====================================================
# 🔎 FUNCTIONS
# =====================================================

mkcd() {
    mkdir -p "$1" && cd "$1"
}

histg() {
    history | grep "$@"
}

# =====================================================
# 🚀 END
# =====================================================
