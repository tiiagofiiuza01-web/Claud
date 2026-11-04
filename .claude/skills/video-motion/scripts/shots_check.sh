#!/bin/bash
# Confere início/meio/fim de cada trecho (pega cortes internos em stories já editados).
# Arquivo de entrada: linhas "fonte inicio_s duracao_s" (fonte = nome em video/public sem .mp4)
# Uso: shots_check.sh shots.txt saida.jpg   (rodar dentro de video/)
tmp=$(mktemp -d); i=0
while read src at dur; do for k in 0 0.5 1; do t=$(python3 -c "print(round($at+$dur*$k-0.04*($k==1),2))")
  ffmpeg -loglevel error -y -ss $t -i public/$src.mp4 -frames:v 1 -vf "scale=-2:200,drawtext=text='$i $src $t':x=3:y=3:fontsize=13:fontcolor=yellow:box=1:boxcolor=black" $tmp/s_$(printf %02d $i)_$k.jpg </dev/null; done; i=$((i+1)); done < "$1"
ffmpeg -loglevel error -y -pattern_type glob -i "$tmp/s_*.jpg" -vf "tile=15x$(( (i*3+14)/15 ))" -frames:v 1 "$2"; rm -rf $tmp
echo "Atenção: na grade a ordem é meio, início, fim (ordem alfabética)."
