"""Transcreve fala/letra com marcação de tempo. Uso: python3 -I transcribe.py ARQ [--music]
--music: sem filtro de voz (para letras cantadas ao vivo, que o VAD descarta)."""
import sys, json, subprocess, os, tempfile
from faster_whisper import WhisperModel
music = '--music' in sys.argv
files = [a for a in sys.argv[1:] if not a.startswith('--')]
m = WhisperModel('small', device='cpu', compute_type='int8')
for f in files:
    wav = tempfile.mktemp(suffix='.wav')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f, '-ar', '16000', '-ac', '1', wav], check=True)
    segs, info = m.transcribe(wav, language='pt', word_timestamps=True, vad_filter=not music, condition_on_previous_text=not music)
    out = []
    print(f'\n== {os.path.basename(f)} ({info.duration:.0f}s)')
    for s in segs:
        print(f'{s.start:6.1f}-{s.end:6.1f} {s.text}')
        out.append({'start': s.start, 'end': s.end, 'text': s.text, 'words': [{'w': w.word, 's': w.start, 'e': w.end} for w in (s.words or [])]})
    json.dump(out, open(os.path.splitext(f)[0] + '.transcript.json', 'w'), ensure_ascii=False)
