---
name: video-motion
description: Edita vídeos de eventos (stories do celular) em um reel/stories vertical com motion design, música sincronizada e efeitos tipo After Effects, usando Remotion, FFmpeg, Whisper, librosa e Magnific. Use quando pedirem para editar, montar, resumir ou "fazer um motion" de vídeos de evento (culto, formatura, acampamento, teen, jovens, vigília, congresso, batismo, casamento etc.). SEMPRE pergunta estilo, objetivo, público e tom antes de editar.
---

# Vídeo com motion para eventos

Fluxo usado nos vídeos "Celebra Teen 2026" (energético) e "Formatura MM" (solene). O projeto Remotion fica em `video/` deste repositório; os templates prontos são `video/src/Motion.tsx` (energético) e `video/src/Solene.tsx` (solene).

## 0. Antes de tudo: PERGUNTE (obrigatório)

Nunca comece a editar sem estas respostas. Use a ferramenta de perguntas (AskUserQuestion) com opções clicáveis — o usuário costuma estar no celular. Pergunte numa única rodada:

1. **Estilo do motion** — mostre as opções de `references/estilos.md` (resumo abaixo) e recomende uma com base no evento:
   - **Energético / Teen** — cortes na batida, títulos carimbados, telas divididas, confete, faixas correndo.
   - **Jovem cristão / Worship** — dinâmico mas com respiro: cortes no compasso, luzes, textos de letra, zooms suaves.
   - **Solene / Formatura / Cerimônia** — fusões lentas, vazamentos de luz, logo dourada com brilho, tipografia serifada, profundidade (parallax).
   - **Espiritual / Vigília / Oração** — muito lento, escuro e quente, partículas de luz, versículo em tela, silêncio e respiração na edição.
   - **Institucional / Família / Aniversário de igreja** — limpo e caloroso, títulos simples, ritmo médio.
2. **Objetivo e destino** — Stories (≤60s), Reels (30–90s), feed, telão do culto, YouTube (horizontal 16:9?).
3. **Público e tom** — adolescentes, jovens, mulheres, família, liderança… e o clima (alegre, emocionante, reverente). Atenção às combinações: "jovem, mas é vigília" = público jovem com estilo **Espiritual**, não Energético.
4. **Música** — o usuário manda uma (link/arquivo), eu busco uma livre de direitos (Kevin MacLeod/incompetech, crédito CC BY), ou eu gero uma original no Magnific (sem risco de direitos; ~1.200 créditos por 60s). Avise: música com direitos autorais embutida pode ser silenciada no Instagram.
5. **Textos e marcas** — nome do evento, ministério/igreja, logo (onde está?), frase final. Não invente ano, nomes ou títulos (ex.: "campeões") que não foram confirmados.
6. **Duração máxima** e se pode usar **créditos do Magnific** (sempre informe a estimativa antes de gastar).

Se o pedido já respondeu algum item, não pergunte de novo — confirme em uma linha.

## 1. Preparar o ambiente

- Conferir: `bash .claude/skills/video-motion/scripts/check.sh`
- Instalar o que faltar: `bash .claude/skills/video-motion/scripts/setup.sh` (Linux ou macOS; no Mac usa Homebrew + venv `~/video-env`).
- Em sessão nova na nuvem, o ideal é o script de configuração do ambiente (Environment → Edit → Setup script) rodar o `setup.sh` — custa zero token.

## 2. Receber o material

- Vídeos grandes: pedir uma pasta do **Google Drive** com "Qualquer pessoa com o link" e baixar com `gdown --folder URL -O video/input_<evento>/` (o chat só aceita ~30 MB).
- YouTube: `yt-dlp` funciona (com Node/Deno como solucionador JS). Vimeo/TikTok podem exigir login.
- Coloque `input_*/`, `public/`, `out/`, `music/` no `.gitignore` — nunca commitar mídia.

## 3. Entender o conteúdo (não pule)

1. `ffprobe` em cada arquivo (duração, resolução, rotação do iPhone).
2. Folha de contato com tempo: `scripts/sheet.sh VIDEO saida.jpg 1` (vídeos longos: rode de novo com início em 72s etc.) e **olhe as imagens**.
3. Fala/letra: `python3 -I scripts/transcribe.py ARQ` (ou `--music` para letra cantada ao vivo).
4. Proxies **com color grade** (sempre — imagem de celular fica crua): `python3 -I scripts/colorgrade.py video/public PREFIXO ARQ1 ARQ2 …` iguala balanço de branco e exposição entre os clipes e aplica contraste suave, vida nas cores, redução de ruído e nitidez, a partir do original 4K, com áudio limpo. Monte um antes/depois (um quadro de cada clipe, `hstack`/`vstack`) e olhe; clipes dominados por pele ou parede bege enganam a medição — ajuste à mão (ex.: R×0,97, B×1,055). Sem grade: `scripts/proxy.sh`.
5. Monte a lista de trechos (`fonte inicio duracao`) e rode `scripts/shots_check.sh lista.txt grade.jpg`. **Stories já editados têm cortes internos**: se início, meio e fim não forem a mesma cena, ajuste o trecho. Esse foi o erro mais comum (uma "folha de papel" no lugar dos cantores, um homem de terno no meio da entrada).

## 4. Música

- `python3 -I scripts/music.py musica.mp3 saida.json` → BPM, batidas, compassos, dB por segundo, acentos.
- Escolha o trecho pela curva de energia/letra: refrão, "drop" ou o crescendo. Para música com letra, transcreva (`--music`) e alinhe o momento forte (ex.: drop no "Galileu" do 2º refrão).
- **Energético**: cortes em múltiplos de batida; a abertura termina exatamente no drop.
- **Solene**: fusões e luzes nos acentos/crescendos; clímax visual (parallax) no ápice da música; fim junto com o fade da música.
- Gerar no Magnific: `audio_music_generate` (modelo `elevenlabs-music-generation-v2`, `durationSeconds`, `instrumental: true`). Gere 2 opções e compare por `music.py` (percussão baixa + início suave = mais solene).

## 5. Montar no Remotion

- Copie o template mais próximo do estilo (`Motion.tsx` ou `Solene.tsx`), registre em `video/src/Root.tsx` e ajuste o roteiro (array de cenas).
- Fontes: **baixe os arquivos .ttf/.woff2 para `video/public/` e carregue com `@remotion/fonts`** (o Chrome do Remotion na nuvem não confia no proxy e o `@remotion/google-fonts` trava). Confirme que a fonte tem Ã Õ Ç É com `fontTools`.
- Logo da tela do palco: quadro mais nítido → Magnific `images_upscale` (~180 créditos) → `scripts/logo_extract.py` → usar como máscara com gradiente dourado + brilho passando. Texto pequeno ilegível da logo: reescreva com fonte real, nunca deixe texto "inventado" pela IA.
- Antes de renderizar tudo: `npx tsc --noEmit -p .` e `npx remotion still ... --frame=N --scale=0.3` em vários pontos (abertura, legenda, transição, final) e **olhe**.
- Render: `npx remotion render src/index.ts ID out/arquivo.mp4 --crf=18 --timeout=180000` (~5 min por minuto de vídeo em 4 CPUs) e `scripts/export.sh` para a versão leve.
- Depois do render: folha de contato do resultado, `volumedetect` (tem áudio?) e duração.

Detalhes de cada estilo (paleta, fontes, transições, ritmo): `references/estilos.md`.
Erros já cometidos e como evitar: `references/licoes.md`.
Uso do Magnific (efeitos tipo After Effects, custos): `references/magnific.md`.

## 6. Entregar

- Envie a versão leve (SendUserFile) e diga: duração, o que tem em cada parte, música e **crédito obrigatório** (CC BY) ou aviso de direitos, créditos do Magnific gastos, e que a máquina na nuvem é temporária (baixar o vídeo).
- Commit só do código (`video/src`, scripts) — nunca dos vídeos.
- Áudio da fala: deixe a voz só nas frases que importam (volume por palavra/frase) e silêncio no resto quando o usuário vai pôr música no app. Confira com `astats` que a faixa tem som onde deve — se o usuário disser que veio mudo, meça antes de refazer (players do app abrem no mudo).
- Pedidos de ajuste: localize o segundo pedido no vídeo renderizado (`ffmpeg -ss T ... tile`) antes de mexer, para trocar exatamente o que a pessoa viu.
