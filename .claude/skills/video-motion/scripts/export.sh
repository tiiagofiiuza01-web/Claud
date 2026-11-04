#!/bin/bash
# Versão leve para Instagram/Stories (~35-45MB por minuto). Uso: export.sh ENTRADA.mp4 SAIDA.mp4
ffmpeg -loglevel error -y -i "$1" -c:v libx264 -preset slow -crf 22 -maxrate 7M -bufsize 14M -c:a aac -b:a 192k -movflags +faststart "$2"
