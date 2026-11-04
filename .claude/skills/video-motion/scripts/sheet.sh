#!/bin/bash
# Folha de contato com tempo: sheet.sh VIDEO SAIDA.jpg [intervalo_s=1] [inicio_s=0]
ffmpeg -loglevel error -y -ss ${4:-0} -i "$1" -vf "fps=1/${3:-1},scale=-2:300,drawtext=text='%{pts\:hms}':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=12x6" -frames:v 1 "$2"
