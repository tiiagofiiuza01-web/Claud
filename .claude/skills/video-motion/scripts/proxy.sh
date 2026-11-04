#!/bin/bash
# Converte um vídeo do celular em proxy 1080x1920/30fps sem áudio (gira o iPhone e reduz 4K).
# Uso: proxy.sh ENTRADA video/public/NOME.mp4
ffmpeg -loglevel error -y -i "$1" -an -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p" -c:v libx264 -preset veryfast -crf 17 -g 15 "$2"
