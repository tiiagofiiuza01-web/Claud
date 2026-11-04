import sys, json, subprocess, os
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8')
for f in sys.argv[1:]:
    name = os.path.splitext(os.path.basename(f))[0]
    wav = f'work/{name}.wav'
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f,'-ar','16000','-ac','1',wav], check=True)
    segs, info = m.transcribe(wav, language='pt', word_timestamps=True, vad_filter=True)
    out = []
    print(f'\n== {name} ({info.duration:.0f}s)')
    for s in segs:
        print(f'{s.start:5.1f}-{s.end:5.1f} {s.text}')
        out.append({'start': s.start, 'end': s.end, 'text': s.text,
                    'words': [{'w': w.word, 's': w.start, 'e': w.end} for w in s.words]})
    json.dump(out, open(f'work/{name}.json', 'w'), ensure_ascii=False)
