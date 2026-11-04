import librosa, numpy as np, glob, os
for f in sorted(glob.glob('music/*.mp3')):
    y, sr = librosa.load(f, sr=22050, mono=True)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    rms = librosa.feature.rms(y=y)[0]
    cent = librosa.feature.spectral_centroid(y=y, sr=sr)[0].mean()
    onset = librosa.onset.onset_strength(y=y, sr=sr).mean()
    print(f"{os.path.basename(f):26s} {len(y)/sr:5.0f}s bpm={float(np.atleast_1d(tempo)[0]):6.1f} energy={rms.mean():.3f} bright={cent:6.0f} punch={onset:.2f}")
