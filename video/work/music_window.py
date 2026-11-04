import librosa, numpy as np, json
y, sr = librosa.load('music/Wallpaper.mp3', sr=22050, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
rms = librosa.feature.rms(y=y, hop_length=512)[0]; t = librosa.times_like(rms, sr=sr, hop_length=512)
# energy per second
sec = np.array([rms[(t>=i)&(t<i+1)].mean() for i in range(int(t[-1]))])
print('energy/s:', ' '.join(f'{int(s*100)}' for s in sec))
onset_env = librosa.onset.onset_strength(y=y, sr=sr)
# downbeats approx: every 4 beats, pick phase with max onset
bi = librosa.time_to_frames(beats, sr=sr)
phase = max(range(4), key=lambda p: onset_env[bi[p::4]].mean())
bars = beats[phase::4]
json.dump({'tempo': float(np.atleast_1d(tempo)[0]), 'beats': beats.tolist(), 'bars': bars.tolist()}, open('work/wallpaper_beats.json','w'))
print('tempo', tempo, 'bars first 30:', [round(b,2) for b in bars[:30]])
