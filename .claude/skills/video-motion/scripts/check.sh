#!/bin/bash
# Confere se tudo está instalado e funcionando.
ok(){ printf "✅ %s\n" "$1"; }; no(){ printf "❌ %s\n" "$1"; }
for c in node ffmpeg python3 yt-dlp; do command -v $c >/dev/null && ok "$c" || no "$c"; done
python3 -c "import faster_whisper, gdown, librosa" 2>/dev/null && ok "faster-whisper, gdown, librosa" || no "pacotes Python (rode scripts/setup.sh)"
cd "$(git rev-parse --show-toplevel)/video" 2>/dev/null && [ -d node_modules/remotion ] && ok "Remotion $(node -p "require('remotion/package.json').version")" || no "Remotion (rode: cd video && npm install)"
