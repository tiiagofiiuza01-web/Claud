# Lições aprendidas (erros que já aconteceram)

1. **Cortes internos em stories editados** — um trecho escolhido pela folha de contato a cada 2s caiu num corte (folha de papel no lugar dos cantores; pastor/homem de terno na entrada). Sempre rode `scripts/shots_check.sh` (início/meio/fim).
2. **Tremor** — pulso de escala em toda batida + "soco" de zoom no corte + balanço senoidal = vídeo tremendo. Use só zoom lento com easing.
3. **Câmera lenta pulando** — `playbackRate < 1` repete quadros. Gere clipes com `scripts/slowmo.sh` (minterpolate) e toque a 1×.
4. **Listras/letreiros desencontrados** — `background-position` em gradiente repetido mostra emenda; letreiro com módulo em px arbitrário salta. Listras: camada grande girada deslocada dentro de 1 período. Letreiro: duas cópias idênticas e `translateX` de 0 a −50%.
5. **Acentos cortados** — máscara `overflow:hidden` nas letras cortou o til (Ã/Õ) e depois a cedilha (Ç). Animar letras com opacidade + deslocamento, sem máscara, e padding vertical na caixa.
6. **Fontes do Google travando o render** — o Chrome do Remotion na nuvem não confia no proxy (ERR_CERT_AUTHORITY_INVALID). Baixe as fontes com `curl` para `public/` e use `@remotion/fonts`.
7. **Áudio do Instagram** — música com direitos embutida pode ser silenciada. Ofereça versão sem música ou música livre/gerada.
8. **Coordenadas em prévias reduzidas** — ao apagar algo de um recorte, meça na imagem em tamanho real (grade com régua), não na miniatura lado a lado.
9. **Recorte com pessoas ao fundo** — o recorte automático pode trazer gente atrás; apague com polígono e remova ilhas pequenas.
10. **Pedidos de ajuste por segundo** — confirme o que aparece naquele segundo no vídeo renderizado antes de trocar (o usuário falou "mulher de preto", não a menina de chapéu que vinha antes).
11. **Não inventar** — nada de ano, "campeões", nomes ou textos não confirmados; texto pequeno ilegível da logo deve ser reescrito com fonte real.
12. **Render** — ~5 min por minuto em 4 CPUs; renderize stills primeiro. Use `--timeout=180000` quando houver muitos vídeos/filtros.
