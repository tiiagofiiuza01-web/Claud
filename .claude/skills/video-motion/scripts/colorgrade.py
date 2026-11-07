"""Color grade automático para vídeos de celular: iguala balanço de branco e exposição entre os clipes
e aplica um visual comum (contraste suave, vida nas cores, redução de ruído leve e nitidez).
Gera proxies 1080x1920/30fps já tratados, a partir do ORIGINAL (4K dá mais nitidez).

Uso: python3 -I colorgrade.py SAIDA_DIR PREFIXO ARQ1.MOV ARQ2.MOV ...
  -> SAIDA_DIR/PREFIXO_<nome>.mp4 (com áudio limpo: passa-alta, redução de ruído, loudnorm -16 LUFS)
Opções por ambiente: GRADE_RG (alvo R/G, padrão 1.09), GRADE_BG (alvo B/G, padrão 0.95),
GRADE_L (brilho médio alvo, 0.49), GRADE_SAT (1.10), GRADE_VIB (0.14), GRADE_SHARP (0.65).
Depois confira com o antes/depois e ajuste clipes dominados por pele/parede bege (eles enganam o 'gray world')."""
import sys, os, glob, json, math, subprocess, tempfile
import numpy as np
from PIL import Image

out_dir, prefix, files = sys.argv[1], sys.argv[2], sys.argv[3:]
E = lambda k, d: float(os.environ.get(k, d))
T_RG, T_BG, T_L = E('GRADE_RG', 1.09), E('GRADE_BG', 0.95), E('GRADE_L', 0.49)
LOOK = (f"hqdn3d=1.2:1.2:4:4,curves=master='0/0 0.25/0.225 0.5/0.5 0.75/0.785 1/1',"
        f"eq=saturation={E('GRADE_SAT',1.10)},vibrance=intensity={E('GRADE_VIB',0.14)},unsharp=5:5:{E('GRADE_SHARP',0.65)}:5:5:0")
BASE = "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30"
AUDIO = "highpass=f=90,lowpass=f=9000,afftdn=nf=-25,loudnorm=I=-16:TP=-1.5:LRA=7"

def stats(path, vf):
    d = tempfile.mkdtemp()
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-vf', f'{vf},fps=2,scale=270:480', f'{d}/f_%03d.png'], check=True)
    a = np.stack([np.asarray(Image.open(f).convert('RGB'), float) / 255 for f in sorted(glob.glob(f'{d}/*.png'))])
    L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]; mid = (L > 0.2) & (L < 0.85)
    rgb = [a[..., c][mid].mean() for c in range(3)]
    return dict(L=L.mean(), p2=np.percentile(L, 2), p98=np.percentile(L, 98), rg=rgb[0] / rgb[1], bg=rgb[2] / rgb[1])

def lut(s, gamma=1.0):
    k = (0.93 - 0.02) / (s['p98'] - s['p2']); p = s['p2'] * 255; kr, kb = T_RG / s['rg'], T_BG / s['bg']
    c = lambda m: f"clip((val-{p:.1f})*{k*m:.4f}+5.1,0,255)"
    return f"format=gbrp,lutrgb=r='{c(kr)}':g='{c(1)}':b='{c(kb)}',eq=gamma={gamma:.3f}"

os.makedirs(out_dir, exist_ok=True)
for f in files:
    name = os.path.splitext(os.path.basename(f))[0]
    s = stats(f, BASE)
    # 1ª passada para medir o brilho depois do visual e casar a exposição
    s2 = stats(f, f"{BASE},{lut(s)},{LOOK}")
    g = math.log(max(s2['L'], 1e-3)) / math.log(T_L)
    out = f'{out_dir}/{prefix}_{name}.mp4'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f, '-vf', f"{BASE},{lut(s, g)},{LOOK},format=yuv420p",
                    '-af', AUDIO, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-g', '15', out], check=True)
    s3 = stats(out, 'null')
    print(f"{name}: antes L={s['L']:.3f} R/G={s['rg']:.3f} B/G={s['bg']:.3f} -> depois L={s3['L']:.3f} R/G={s3['rg']:.3f} B/G={s3['bg']:.3f}")
