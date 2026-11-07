import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {loadFont} from '@remotion/fonts';

// Stories simples: voz do pastor só nas frases legendadas (sem música: o usuário põe no Stories), fusões suaves
const SANS = 'Montserrat';
loadFont({family: SANS, url: staticFile('montserrat.woff2'), weight: '100 900'});

export const FPS = 30;
const s = (x: number) => Math.round(x * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.sin);
const XF = 10; // fusão entre cenas (quadros)

type Word = [string, number, number];
type Shot = {src: string; from: number; to: number; voice?: boolean; words?: Word[]};

const SHOTS: Shot[] = [
  {src: 'vint_4012', from: 0.0, to: 3.0},
  {src: 'vint_4014', from: 8.45, to: 11.0, voice: true, words: [
    ['Levou', 8.6, 8.98], ['consigo', 8.98, 9.3], ['Pedro,', 9.3, 9.8], ['Tiago', 9.98, 10.34], ['e', 10.34, 10.4], ['João.', 10.4, 10.74]]},
  {src: 'vint_4015', from: 0.0, to: 5.6, voice: true, words: [
    ['E', 0.0, 0.66], ['Ele', 0.66, 0.9], ['encontra,', 0.9, 1.38], ['em', 1.38, 1.92], ['que', 1.92, 2.12], ['condições,', 2.12, 2.68], ['os', 2.68, 2.92], ['três?', 2.92, 3.56], ['Dormindo.', 4.56, 5.34]]},
  {src: 'vint_4014', from: 0.0, to: 6.7, voice: true, words: [
    ['…seguido', 0.0, 0.92], ['a', 0.92, 1.02], ['sua', 1.02, 1.14], ['orientação', 1.14, 2.14], ['e', 2.3, 2.46], ['estivesse', 2.46, 3.2], ['em', 3.2, 3.74], ['oração,', 3.74, 4.38], ['ele', 4.5, 4.66], ['não', 4.66, 4.96], ['teria', 4.96, 5.2], ['negado', 5.2, 5.6], ['Jesus.', 5.6, 6.46]]},
  {src: 'vint_4016', from: 0.5, to: 4.0},
  {src: 'vint_4017', from: 0.0, to: 3.2},
];

const TL = (() => {
  let t = 0;
  return SHOTS.map((x) => { const start = s(t); t += x.to - x.from; return {...x, start, len: s(t) - start}; });
})();
export const TOTAL = TL[TL.length - 1].start + TL[TL.length - 1].len;

const Clip: React.FC<{shot: Shot; len: number; i: number; first: boolean}> = ({shot, len, i, first}) => {
  const f = useCurrentFrame();
  const total = len + XF;
  const op = first ? 1 : interpolate(f, [0, XF], [0, 1], clamp);
  const sc = interpolate(f, [0, total], i % 2 ? [1.0, 1.04] : [1.04, 1.0], {easing: ease});
  // voz só enquanto a frase legendada é dita; silêncio total fora dela
  const t = shot.from + (f - XF / 2) / FPS;
  const w = shot.words;
  const vol = w ? interpolate(t, [w[0][1] - 0.2, w[0][1] - 0.08, w[w.length - 1][2] + 0.2, w[w.length - 1][2] + 0.35], [0, 1, 1, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{opacity: op, overflow: 'hidden'}}>
      <div style={{width: '100%', height: '100%', transform: `scale(${sc})`}}>
        <OffthreadVideo src={staticFile(`${shot.src}.mp4`)} trimBefore={Math.max(0, s(shot.from) - XF / 2)} volume={vol}
          style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    </AbsoluteFill>
  );
};

/** legenda da fala: palavras acendem conforme são ditas */
const Caption: React.FC<{shot: Shot}> = ({shot}) => {
  const f = useCurrentFrame();
  const t = f / FPS + shot.from; // tempo no clipe original
  const w = shot.words!;
  const inn = interpolate(t, [w[0][1] - 0.25, w[0][1]], [0, 1], clamp);
  const out = interpolate(t, [w[w.length - 1][2] + 0.15, w[w.length - 1][2] + 0.45], [1, 0], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 430, opacity: inn * out}}>
      <div style={{maxWidth: 900, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 60, lineHeight: 1.25, color: 'white',
        textShadow: '0 2px 4px rgba(0,0,0,.6), 0 6px 24px rgba(0,0,0,.55)'}}>
        {w.map(([txt, a], k) => (
          <span key={k} style={{opacity: interpolate(t, [a - 0.05, a + 0.12], [0.5, 1], clamp)}}>{txt}{k < w.length - 1 ? ' ' : ''}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Vintage: React.FC = () => {
  const fadeOut = (f: number) => interpolate(f, [TOTAL - 24, TOTAL], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: 'black'}}>
      {TL.map((x, i) => (
        <Sequence key={i} from={Math.max(0, x.start - XF / 2)} durationInFrames={x.len + XF} premountFor={30}>
          <Clip shot={x} len={x.len} i={i} first={i === 0} />
        </Sequence>
      ))}
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 45%)'}} />
      {TL.map((x, i) => x.words && (
        <Sequence key={`c${i}`} from={x.start} durationInFrames={x.len}><Caption shot={x} /></Sequence>
      ))}
      <FadeIn />
      <FadeOutLayer fn={fadeOut} />
    </AbsoluteFill>
  );
};

const FadeIn: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: 'black', opacity: interpolate(f, [0, 15], [1, 0], clamp)}} />;
};
const FadeOutLayer: React.FC<{fn: (f: number) => number}> = ({fn}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: 'black', opacity: fn(f)}} />;
};
