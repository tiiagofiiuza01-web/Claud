"""Extrai o traço escuro de uma logo fotografada (ex.: tela do palco) para PNG branco com transparência,
pronto para virar máscara dourada/branca no Remotion. Melhore a nitidez antes (Magnific images_upscale ~180 créditos).
Uso: python3 -I logo_extract.py ENTRADA.jpg SAIDA.png [limiar_luminancia=120]"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
src, out = sys.argv[1], sys.argv[2]; th = float(sys.argv[3]) if len(sys.argv) > 3 else 120
im = np.asarray(Image.open(src).convert('RGB')).astype(float)
L = 0.299 * im[..., 0] + 0.587 * im[..., 1] + 0.114 * im[..., 2]
m = L < th
lab, n = ndi.label(m); sizes = ndi.sum(m, lab, range(1, n + 1))
m = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= 60])
a = (ndi.gaussian_filter(m.astype(float), 0.8) * 255).clip(0, 255).astype(np.uint8)
ys, xs = np.where(a > 40); pad = 20
rgba = np.zeros(a.shape + (4,), np.uint8); rgba[..., :3] = 255; rgba[..., 3] = a
Image.fromarray(rgba[max(0, ys.min()-pad):ys.max()+pad, max(0, xs.min()-pad):xs.max()+pad]).save(out)
print('ok — confira o resultado e apague manualmente pedaços que não são da logo; textos pequenos ilegíveis: reescreva com fonte real')
