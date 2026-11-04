import librosa, numpy as np, json, sys
f = sys.argv[1]; out = sys.argv[2]
y, sr = librosa.load(f, sr=22050, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time', start_bpm=160)
rms = librosa.feature.rms(y=y)[0]; t = librosa.times_like(rms, sr=sr)
sec = np.array([rms[(t>=i)&(t<i+1)].mean() for i in range(int(t[-1]))])
print('tempo', tempo, 'beat dt', np.diff(beats).mean())
print('energy/s:', ' '.join(f'{int(s*100)}' for s in sec))
onset = librosa.onset.onset_strength(y=y, sr=sr)
bi = librosa.time_to_frames(beats, sr=sr)
phase = max(range(4), key=lambda p: onset[bi[p::4]].mean())
json.dump({'beats': beats.tolist(), 'bars': beats[phase::4].tolist()}, open(out,'w'))
