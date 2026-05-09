#!/bin/bash
# Ruta a tu carpeta de fondos de pantalla
# Asegúrate de crear esta carpeta y colocar tus imágenes dentro.
WP_DIR="$HOME/.config/wallpeper"  

# Obtener un archivo de imagen al azar
# Busca archivos .jpg o .png y elige uno al azar
RANDOM_WP=$(find "$WP_DIR" -type f \( -name "*.jpg" -o -name "*.png" \) | shuf -n 1)

# Establecer el wallpaper con swww y una transición elegante
if [ -n "$RANDOM_WP" ]; then
    swww img "$RANDOM_WP" \
        --transition-type grow \
        --transition-pos "0.5,0.5" \
        --transition-fps 60
fi
