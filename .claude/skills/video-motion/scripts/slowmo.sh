#!/bin/bash
# Câmera lenta SUAVE (gera quadros intermediários). Nunca use playbackRate<1 no Remotion: repete quadros e "pula".
# Uso: slowmo.sh ENTRADA.mp4 INICIO_s DURACAO_s FATOR(ex 0.5) SAIDA.mp4
ffmpeg -loglevel error -y -ss $2 -t $3 -i "$1" -vf "setpts=PTS/$4,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1" -an -c:v libx264 -preset veryfast -crf 18 -g 15 "$5"
