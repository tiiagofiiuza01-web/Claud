#!/bin/bash
# Instala tudo o que a skill usa. Linux (nuvem) ou macOS.
set -e
if [[ "$OSTYPE" == darwin* ]]; then
  command -v brew >/dev/null || { echo "Instale o Homebrew: https://brew.sh"; exit 1; }
  brew install node ffmpeg python yt-dlp deno
  python3 -m venv ~/video-env && source ~/video-env/bin/activate
fi
pip3 install -q yt-dlp yt-dlp-ejs curl_cffi faster-whisper "av<16" gdown librosa fonttools brotli pillow scipy
mkdir -p ~/.config/yt-dlp
command -v deno >/dev/null || printf -- "--js-runtimes node\n--remote-components ejs:github\n" > ~/.config/yt-dlp/config
python3 -c "from faster_whisper import WhisperModel; WhisperModel('small', device='cpu', compute_type='int8')"
cd "$(git rev-parse --show-toplevel)/video" && npm install
echo "OK: ferramentas de vídeo prontas"
