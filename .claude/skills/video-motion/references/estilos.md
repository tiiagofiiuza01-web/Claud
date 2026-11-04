# Estilos de motion

Cada estilo define ritmo, transições, tipografia, cor e música. Combine com o público: o **tom do evento** manda mais que a idade (jovens numa vigília → Espiritual).

## 1. Energético / Teen  — template `video/src/Motion.tsx`
- **Quando**: acampamento, gincana, torneio, Celebra Teen, festa de jovens.
- **Ritmo**: cortes a cada 2–4 batidas; abertura de 6–8s que termina no drop.
- **Transições**: faixas diagonais coloridas (wipe), flash branco no drop e no início de seção, círculo que abre.
- **Layouts**: tela cheia com zoom lento, 3 colunas entrando na batida, 2 linhas, grade 2×2, cartões inclinados sobre fundo desfocado.
- **Texto**: Anton (display) + Montserrat 900; etiquetas amarelas com letras entrando uma a uma; letreiros correndo ("CELEBRA TEEN ★ …").
- **Cor**: azul royal, roxo, amarelo #FFD400, branco; confete no clímax e no final.
- **Música**: 110–160 BPM, eletrônica/pop alegre (Electrodoodle, Wallpaper) ou worship animado.
- **Cuidados**: nada de pulso de zoom em toda batida (parece tremido); letreiros e listras precisam emendar sem salto; câmera lenta só com `slowmo.sh`.

## 2. Jovem cristão / Worship
- **Quando**: culto jovem, congresso, noite de louvor.
- **Ritmo**: cortes no compasso (4 batidas), segurar planos de mãos levantadas/coro.
- **Transições**: fusão curta (8 quadros) + vazamento de luz; zoom suave; flash só no refrão.
- **Texto**: trechos da letra em tela (sans bold + uma palavra em script), centralizados no terço inferior.
- **Cor**: azul profundo, roxo, luz quente; partículas suaves.
- **Música**: a própria música do louvor (avisar direitos) ou instrumental worship.

## 3. Solene / Formatura / Cerimônia — template `video/src/Solene.tsx`
- **Quando**: formatura, posse, ordenação, batismo, homenagem, aniversário de ministério.
- **Ritmo**: planos de 1,5–3s com fusão de 12 quadros; nada de cortes secos rápidos.
- **Transições**: fusão + vazamento de luz quente (blend screen) nos acentos da música; congelamento do quadro que vira cena em profundidade.
- **Efeito After Effects**: recorte da pessoa (Magnific `images_remove_background`), texto em script **atrás** dela, fundo desfocando e parallax lento (fundo 1,035×, pessoa 1,085×).
- **Logo**: selo extraído da tela do palco, máscara com gradiente dourado e brilho passando; surge com leve desfoque → nítido.
- **Texto**: Cormorant Garamond (serifa, itálico nos capítulos) + Great Vibes (script) + Montserrat 500 espaçado para assinaturas; capítulos discretos ("A entrada", "Oração e louvor", "A certificação") entre linhas douradas.
- **Cor**: ameixa/vinho #2A0F24, rosé, dourado #E9C987, creme; vinheta e véu quente leves.
- **Música**: instrumental piano + cordas, 60–80 BPM, início suave, ápice ~2/3, final longo (gerar no Magnific ou incompetech "Heartwarming", "Touching Moments").

## 4. Espiritual / Vigília / Oração
- **Quando**: vigília, semana de oração, santa ceia, momento de consagração (mesmo com jovens).
- **Ritmo**: muito lento, planos de 3–5s, câmera lenta suave; deixar respirar.
- **Transições**: fusões longas (20–30 quadros), fade para preto, luz de vela/raio suave.
- **Texto**: versículo ou frase curta em serifa itálica, aparecendo palavra por palavra; muito espaço negativo.
- **Cor**: escuro e quente (âmbar, dourado, azul noite); grão de filme sutil; partículas de luz.
- **Música**: pad ambiente, piano esparso, sem bateria (40–70 BPM).

## 5. Institucional / Família / Igreja
- **Quando**: aniversário da igreja, dia das mães/pais, prestação de contas, convite para evento.
- **Ritmo**: médio (2–3s), legível.
- **Transições**: slides e fusões limpas, máscaras retangulares.
- **Texto**: sans moderna, títulos e números claros; logo da igreja no início e fim.
- **Cor**: paleta da marca da igreja.
- **Música**: acústico/inspirador leve.

## Perguntas rápidas para decidir o estilo
- O evento é de **celebração** (energético/worship) ou de **reverência** (solene/espiritual)?
- Vai para **Stories** (≤60s, vertical) ou **telão/YouTube** (16:9)?
- Tem **logo** em arquivo? Se não, dá para extrair da tela do palco.
- Pode usar **créditos do Magnific**? (música original, recorte de pessoa, nitidez da logo)
