# Magnific (efeitos tipo After Effects e IA)

Regra: **sempre** `account_balance` + `simulate_cost` e informe o total estimado ao usuário antes de gerar. Use em modelos de pessoas reais só recorte, nitidez e luz — nunca gere/modifique rostos ou cenas que pareçam reais e não aconteceram.

## Upload de arquivo local
1. `creations_request_upload` (mimeType) → `proxyUploadUrl` + `path`
2. `curl -X PUT -H "Content-Type: image/png" --data-binary @arquivo URL`
3. `creations_finalize_upload` (path, fileName, visible:false)
4. Resultado: `creations_wait` → baixar `results.url` com curl.

## Ferramentas úteis e custos observados (nov/2026)
| Uso | Ferramenta | Créditos |
|---|---|---|
| Música original instrumental 60s | `audio_music_generate` (elevenlabs-music-generation-v2, durationSeconds, instrumental) | 1.200 |
| Nitidez de logo/print (4× pequeno) | `images_upscale` (creative, creativity −6, resemblance 8, ArtAndIllustration) | 90–180 |
| Recortar pessoa de um quadro | `images_remove_background` | 3 |
| Recorte de vídeo inteiro (pessoa andando) | `video_remove_background` | simular antes |
| Mudar ângulo/câmera com IA | `video_camera_angle`, `images_change_camera` | caro; evitar com pessoas reais |

## Receita "texto atrás da pessoa" (parallax)
1. Escolha um quadro forte (pessoa grande, rosto nítido) e congele exatamente no quadro em que o clipe anterior termina.
2. Recorte a pessoa (3 créditos), limpe pessoas ao fundo.
3. Camadas: fundo (mesmo quadro, desfoca 0→7px e escurece) → texto em script dourado → recorte → partículas/vinheta.
4. Movimento: fundo 1,0→1,035, recorte 1,0→1,085 com origem embaixo, ao longo de ~4,5s.
5. O fundo ainda contém a pessoa; o desfoque esconde o "fantasma" do deslocamento.
