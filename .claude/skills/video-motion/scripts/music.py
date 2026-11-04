"""Analisa música: BPM, batidas, compassos, energia por segundo e acentos fortes.
Uso: python3 -I music.py MUSICA.mp3 SAIDA_beats.json
Use a curva de energia para achar o drop/refrão; use 'beats' para cortar no ritmo (estilos energéticos)
e 'accents' para posicionar fusões e luzes (estilos solenes)."""
import sys, json, librosa, numpy as np
f, out = sys.argv[1], sys.argv[2]
y, sr = librosa.load(f, sr=22050, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
onset = librosa.onset.onset_strength(y=y, sr=sr)
bi = librosa.time_to_frames(beats, sr=sr)
phase = max(range(4), key=lambda p: onset[bi[p::4]].mean()) if len(bi) > 8 else 0
rms = librosa.feature.rms(y=y)[0]; t = librosa.times_like(rms, sr=sr)
db = [int(20 * np.log10(rms[(t >= i) & (t < i + 1)].mean() + 1e-6)) for i in range(int(t[-1]))]
ot = librosa.times_like(onset, sr=sr)
pk = librosa.util.peak_pick(onset, pre_max=20, post_max=20, pre_avg=40, post_avg=40, delta=0.5, wait=40)
acc = sorted(round(float(ot[i]), 2) for i in sorted(pk, key=lambda i: -onset[i])[:30])
h, p = librosa.effects.hpss(y)
info = {'duration': len(y) / sr, 'bpm': float(np.atleast_1d(tempo)[0]), 'beats': beats.tolist(), 'bars': beats[phase::4].tolist(),
        'db_per_second': db, 'accents': acc, 'percussive_ratio': float(np.sum(p**2) / np.sum(y**2))}
json.dump(info, open(out, 'w'))
print(f"duração {info['duration']:.1f}s | bpm {info['bpm']:.1f} | percussão {info['percussive_ratio']:.3f}")
print('dB/s:', db); print('acentos:', acc)
