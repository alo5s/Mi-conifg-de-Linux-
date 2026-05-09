#!/bin/bash

# 1. Si la ventana activa está en fullscreen, salir de fullscreen y poner dwindle
if hyprctl activewindow | grep -q "fullscreen: yes"; then
    hyprctl dispatch fullscreen 0
    hyprctl dispatch layoutmsg "dwindle"
    sleep 0.1
fi

# 2. Contar cuántas ventanas 'kitty' hay
terminales_abiertas=$(hyprctl clients | grep -c "class: kitty")

if [ "$terminales_abiertas" -eq 1 ]; then
    # Solo una terminal, ponerla fullscreen
    hyprctl dispatch focuswindow "class:^(kitty)$"
    hyprctl dispatch fullscreen 1
elif [ "$terminales_abiertas" -ge 2 ]; then
    # Dos o más, asegurar layout dwindle
    hyprctl dispatch layoutmsg "dwindle"
    sleep 0.1
fi

# 3. Abrir nueva terminal
kitty



