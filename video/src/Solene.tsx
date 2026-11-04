import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, random,
  staticFile, useCurrentFrame, Easing,
} from 'remotion';
import {loadFont} from '@remotion/fonts';

// Formatura MM — estilo SOLENE: cortes lentos com fusão, luz, logo com brilho, profundidade (parallax)
const SERIF = 'Cormorant Garamond';
const SCRIPT = 'Great Vibes';
const SANS = 'Montserrat';
loadFont({family: SERIF, url: staticFile('cormorant-500.ttf'), weight: '500'});
loadFont({family: SERIF, url: staticFile('cormorant-600.ttf'), weight: '600'});
loadFont({family: SERIF, url: staticFile('cormorant-italic.ttf'), weight: '500', style: 'italic'});
loadFont({family: SCRIPT, url: staticFile('greatvibes.ttf')});
loadFont({family: SANS, url: staticFile('montserrat.woff2'), weight: '100 900'});

export const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.sin);

const C = {
  plum: '#2A0F24', wine: '#5C1236', rose: '#E8A3B8', gold: '#E9C987', goldDeep: '#B88A3E', cream: '#FFF6EA',
};
const GOLD_GRAD = `linear-gradient(100deg, ${C.goldDeep} 0%, ${C.gold} 35%, #FFF3D6 50%, ${C.gold} 65%, ${C.goldDeep} 100%)`;

const XF = 12; // frames de fusão entre cenas

// ---------- roteiro (segundos) ----------
type Shot = {src: string; at: number; dur: number; chapter?: string; leak?: boolean};
const INTRO = 5.5;
const SHOTS: Shot[] = [
  {src: 'form_a', at: 0.0, dur: 1.8, chapter: 'A entrada', leak: true},
  {src: 'form_a', at: 1.9, dur: 1.6},
  {src: 'form_a', at: 6.0, dur: 2.0},
  {src: 'form_a', at: 10.4, dur: 1.6},
  {src: 'form_a', at: 13.4, dur: 2.4, leak: true},
  {src: 'form_a', at: 17.3, dur: 1.6},
  {src: 'form_a', at: 21.0, dur: 2.6, chapter: 'Oração e louvor', leak: true},
  {src: 'form_a', at: 24.6, dur: 2.8},
  {src: 'form_a', at: 30.4, dur: 1.5},
  {src: 'form_b', at: 5.2, dur: 2.4, chapter: 'A certificação', leak: true},
  {src: 'form_b', at: 12.0, dur: 2.4},
  {src: 'form_b', at: 30.5, dur: 2.0},
  {src: 'form_b', at: 57.0, dur: 2.4},
  {src: 'form_b', at: 89.0, dur: 2.0},
  {src: 'form_b', at: 104.2, dur: 3.2, leak: true},
  {src: 'form_b', at: 39.9, dur: 1.3}, // entra direto no congelamento (41,2s)
];
const PARALLAX = 4.5;
const AFTER: Shot[] = [
  {src: 'form_b', at: 109.0, dur: 3.2, leak: true},
  {src: 'form_b', at: 118.5, dur: 3.0},
];
const OUTRO = 7.9;

const build = () => {
  let t = INTRO;
  const a = SHOTS.map((x) => { const from = s(t); t += x.dur; return {...x, from, len: s(t) - from}; });
  const pFrom = s(t); t += PARALLAX; const pLen = s(t) - pFrom;
  const b = AFTER.map((x) => { const from = s(t); t += x.dur; return {...x, from, len: s(t) - from}; });
  const oFrom = s(t); t += OUTRO;
  return {a, pFrom, pLen, b, oFrom, total: s(t)};
};
const TL = build();
export const TOTAL = TL.total;

// ---------- elementos ----------
const Vignette: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(20,5,15,0.55) 100%)'}} />
);

/** véu quente (grade de cor suave) */
const Warmth: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(255,214,170,0.10), rgba(232,163,184,0.06))', mixBlendMode: 'soft-light'}} />
);

/** vazamento de luz: brilho quente que atravessa a tela devagar */
const LightLeak: React.FC<{len?: number; dir?: 1 | -1}> = ({len = 40, dir = 1}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, len], [0, 1], {...clamp, easing: ease});
  const op = interpolate(f, [0, len * 0.35, len * 0.65, len], [0, 0.85, 0.85, 0], clamp);
  const x = dir === 1 ? -30 + p * 160 : 130 - p * 160;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: op}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${x}% 40%, rgba(255,220,170,0.95) 0%, rgba(255,170,120,0.55) 18%, rgba(232,120,160,0.25) 38%, rgba(0,0,0,0) 60%)`}} />
      <AbsoluteFill style={{background: `linear-gradient(${105 * dir}deg, rgba(0,0,0,0) ${x - 25}%, rgba(255,235,200,0.35) ${x}%, rgba(0,0,0,0) ${x + 25}%)`}} />
    </AbsoluteFill>
  );
};

/** partículas de luz (bokeh) subindo devagar */
const Bokeh: React.FC<{n?: number; seed?: string; opacity?: number}> = ({n = 26, seed = 'b', opacity = 0.6}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity}}>
      {Array.from({length: n}).map((_, i) => {
        const size = 14 + random(`${seed}s${i}`) * 70;
        const x = random(`${seed}x${i}`) * 1080 + Math.sin((f + i * 40) / 90) * 30;
        const y = ((random(`${seed}y${i}`) * 2200 - f * (0.4 + random(`${seed}v${i}`) * 0.9)) % 2200 + 2200) % 2200 - 140;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((f + i * 23) / 25));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', opacity: tw,
          background: 'radial-gradient(circle, rgba(255,236,200,0.9) 0%, rgba(233,201,135,0.35) 45%, rgba(233,201,135,0) 70%)'}} />;
      })}
    </AbsoluteFill>
  );
};

/** selo dourado com brilho passando */
const Seal: React.FC<{width: number; shineAt?: number}> = ({width, shineAt = 10}) => {
  const f = useCurrentFrame();
  const h = width * (1138 / 951);
  const shine = interpolate(f, [shineAt, shineAt + 45], [120, -20], clamp);
  return (
    <div style={{width, height: h, position: 'relative'}}>
      <div style={{position: 'absolute', inset: 0, background: GOLD_GRAD, backgroundSize: '100% 100%',
        WebkitMaskImage: `url(${staticFile('selo_acolhedora.png')})`, WebkitMaskSize: '100% 100%', maskImage: `url(${staticFile('selo_acolhedora.png')})`, maskSize: '100% 100%',
        filter: 'drop-shadow(0 6px 18px rgba(0,0,0,.35))'}} />
      <div style={{position: 'absolute', inset: 0,
        background: `linear-gradient(115deg, rgba(255,255,255,0) ${shine - 12}%, rgba(255,255,255,0.95) ${shine}%, rgba(255,255,255,0) ${shine + 12}%)`,
        WebkitMaskImage: `url(${staticFile('selo_acolhedora.png')})`, WebkitMaskSize: '100% 100%', maskImage: `url(${staticFile('selo_acolhedora.png')})`, maskSize: '100% 100%'}} />
    </div>
  );
};

const GoldLine: React.FC<{p: number; width?: number}> = ({p, width = 420}) => (
  <div style={{height: 2, width: width * p, margin: '0 auto', background: `linear-gradient(90deg, rgba(233,201,135,0), ${C.gold}, rgba(233,201,135,0))`}} />
);

/** clipe com movimento lento (Ken Burns) e fusão de entrada/saída */
const Clip: React.FC<{shot: Shot; len: number; i: number; fadeIn?: boolean}> = ({shot, len, i, fadeIn = true}) => {
  const f = useCurrentFrame();
  const total = len + XF;
  const op = interpolate(f, [0, XF], [fadeIn ? 0 : 1, 1], clamp);
  const sc = interpolate(f, [0, total], i % 2 ? [1.02, 1.08] : [1.08, 1.02], {easing: ease});
  const dx = interpolate(f, [0, total], i % 3 === 0 ? [-12, 12] : [10, -10], {easing: ease});
  return (
    <AbsoluteFill style={{opacity: op, overflow: 'hidden'}}>
      <div style={{width: '100%', height: '100%', transform: `scale(${sc}) translateX(${dx}px)`}}>
        <OffthreadVideo src={staticFile(`${shot.src}.mp4`)} trimBefore={Math.max(0, s(shot.at) - XF / 2)} muted
          style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.03) saturate(0.95) brightness(1.02)'}} />
      </div>
    </AbsoluteFill>
  );
};

const Chapter: React.FC<{text: string; len: number}> = ({text, len}) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [8, 30], [0, 1], {...clamp, easing: ease});
  const out = interpolate(f, [len - 25, len], [1, 0], clamp);
  const ls = interpolate(f, [8, len], [14, 6]);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 330, opacity: a * out}}>
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 700, background: 'linear-gradient(0deg, rgba(25,6,18,0.65), rgba(25,6,18,0))'}} />
      <div style={{position: 'relative', textAlign: 'center'}}>
        <GoldLine p={a} width={300} />
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 92, color: C.cream, letterSpacing: ls, margin: '18px 0 14px', textShadow: '0 4px 20px rgba(0,0,0,.5)'}}>{text}</div>
        <GoldLine p={a} width={300} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- abertura ----------
const Intro: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const bgIn = interpolate(f, [0, 30], [0, 1], clamp);
  const seal = interpolate(f, [10, 55], [0, 1], {...clamp, easing: ease});
  const t1 = interpolate(f, [45, 75], [0, 1], {...clamp, easing: ease});
  const t2 = interpolate(f, [60, 100], [0, 1], {...clamp, easing: ease});
  const t3 = interpolate(f, [85, 115], [0, 1], {...clamp, easing: ease});
  const out = interpolate(f, [len - 14, len + XF / 2], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: C.plum, opacity: out}}>
      <AbsoluteFill style={{opacity: bgIn * 0.55}}>
        <OffthreadVideo src={staticFile('form_a.mp4')} trimBefore={s(0.2)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(18px) brightness(0.55) saturate(0.8)', transform: 'scale(1.15)'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, rgba(92,18,54,0.35), ${C.plum} 85%)`}} />
      <Bokeh seed="intro" opacity={0.55 * bgIn} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <div style={{opacity: seal, transform: `scale(${0.94 + seal * 0.06})`, filter: `blur(${(1 - seal) * 8}px)`, marginTop: -120}}>
          <Seal width={430} shineAt={40} />
        </div>
        <div style={{marginTop: 50, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 66, color: C.rose, opacity: t1, transform: `translateY(${(1 - t1) * 20}px)`}}>Cerimônia de</div>
        <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 138, lineHeight: 1, color: 'transparent', backgroundImage: GOLD_GRAD, backgroundClip: 'text', WebkitBackgroundClip: 'text',
          letterSpacing: interpolate(t2, [0, 1], [40, 10]), opacity: t2, filter: `blur(${(1 - t2) * 6}px)`, padding: '0 20px'}}>FORMATURA</div>
        <div style={{marginTop: 22}}><GoldLine p={t3} width={520} /></div>
        <div style={{marginTop: 22, fontFamily: SANS, fontWeight: 500, fontSize: 30, letterSpacing: 9, color: C.cream, opacity: t3}}>CURSO DE LIDERANÇA PARA MULHERES</div>
      </AbsoluteFill>
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------- momento em profundidade (recorte + texto atrás) ----------
const Parallax: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const blur = interpolate(f, [0, 24], [0, 7], {...clamp, easing: ease});
  const dim = interpolate(f, [0, 24], [1, 0.72], clamp);
  const bgScale = interpolate(f, [0, len], [1.0, 1.035], {easing: ease});
  const fgScale = interpolate(f, [0, len], [1.0, 1.085], {easing: ease});
  const fgY = interpolate(f, [0, len], [0, -10], {easing: ease});
  const word = interpolate(f, [12, 50], [0, 1], {...clamp, easing: ease});
  const sub = interpolate(f, [40, 70], [0, 1], {...clamp, easing: ease});
  const out = interpolate(f, [len, len + XF], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: out, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${bgScale})`}}>
        <Img src={staticFile('hero_certificado_bg.png')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${blur}px) brightness(${dim})`}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(42,15,36,${0.25 * (1 - dim) / 0.28})`}} />
      {/* texto ATRÁS das formandas */}
      <AbsoluteFill style={{alignItems: 'center', top: 170}}>
        <div style={{fontFamily: SCRIPT, fontSize: 250, lineHeight: 1, color: 'transparent', backgroundImage: GOLD_GRAD, backgroundClip: 'text', WebkitBackgroundClip: 'text',
          opacity: word, transform: `translateY(${(1 - word) * 40}px) scale(${0.96 + word * 0.04})`, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,.45))', padding: '0 30px'}}>Formandas</div>
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translateY(${fgY}px) scale(${fgScale})`, transformOrigin: '50% 100%'}}>
        <Img src={staticFile('hero_certificado_cut.png')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'drop-shadow(0 0 30px rgba(0,0,0,.35))'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 150, opacity: sub}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 56, color: C.cream, textShadow: '0 3px 16px rgba(0,0,0,.6)'}}>Curso de Liderança para Mulheres</div>
      </AbsoluteFill>
      <Bokeh seed="par" n={16} opacity={0.4} />
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------- encerramento ----------
const Outro: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const inn = interpolate(f, [0, 24], [0, 1], {...clamp, easing: ease});
  const seal = interpolate(f, [15, 55], [0, 1], {...clamp, easing: ease});
  const t1 = interpolate(f, [45, 80], [0, 1], {...clamp, easing: ease});
  const t2 = interpolate(f, [70, 105], [0, 1], {...clamp, easing: ease});
  const fade = interpolate(f, [len - 40, len], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: inn * fade}}>
      <AbsoluteFill style={{background: C.plum}} />
      <AbsoluteFill style={{opacity: 0.5}}>
        <OffthreadVideo src={staticFile('form_b.mp4')} trimBefore={s(104.4)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(16px) brightness(0.5)', transform: 'scale(1.15)'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 42%, rgba(92,18,54,0.3), ${C.plum} 88%)`}} />
      <Bokeh seed="outro" n={30} opacity={0.6} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <div style={{opacity: seal, transform: `scale(${0.95 + seal * 0.05})`, filter: `blur(${(1 - seal) * 6}px)`, marginTop: -60}}>
          <Seal width={470} shineAt={50} />
        </div>
        <div style={{marginTop: 40, fontFamily: SCRIPT, fontSize: 130, lineHeight: 1.1, color: 'transparent', backgroundImage: GOLD_GRAD, backgroundClip: 'text', WebkitBackgroundClip: 'text', opacity: t1, transform: `translateY(${(1 - t1) * 24}px)`, padding: '0 30px'}}>Parabéns, formandas!</div>
        <div style={{marginTop: 30}}><GoldLine p={t2} width={560} /></div>
        <div style={{marginTop: 26, fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: 7, color: C.cream, opacity: t2, lineHeight: 1.7}}>
          MINISTÉRIO DA MULHER<br />MINISTÉRIO DA RECEPÇÃO
        </div>
      </AbsoluteFill>
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------- composição ----------
export const Solene: React.FC = () => {
  const all = [...TL.a, ...TL.b];
  return (
    <AbsoluteFill style={{background: C.plum}}>
      {TL.a.map((x, i) => (
        <Sequence key={`a${i}`} from={x.from - XF / 2} durationInFrames={x.len + XF} premountFor={40}>
          <Clip shot={x} len={x.len} i={i} />
        </Sequence>
      ))}
      {/* congelamento + parallax: começa exatamente no quadro onde o clipe anterior termina */}
      <Sequence from={TL.pFrom} durationInFrames={TL.pLen + XF}><Parallax len={TL.pLen} /></Sequence>
      {TL.b.map((x, i) => (
        <Sequence key={`b${i}`} from={x.from - XF / 2} durationInFrames={x.len + XF} premountFor={40}>
          <Clip shot={x} len={x.len} i={i + 1} />
        </Sequence>
      ))}
      <Warmth />
      <Vignette />
      {all.map((x, i) => x.leak && (
        <Sequence key={`k${i}`} from={x.from - 20} durationInFrames={44}><LightLeak len={44} dir={i % 2 ? -1 : 1} /></Sequence>
      ))}
      <Sequence from={TL.pFrom - 18} durationInFrames={40}><LightLeak len={40} /></Sequence>
      {all.map((x, i) => x.chapter && (
        <Sequence key={`c${i}`} from={x.from} durationInFrames={s(2.6)}><Chapter text={x.chapter} len={s(2.6)} /></Sequence>
      ))}
      <Sequence from={0} durationInFrames={s(INTRO) + XF}><Intro len={s(INTRO)} /></Sequence>
      <Sequence from={TL.oFrom - XF} durationInFrames={TL.total - TL.oFrom + XF}><Outro len={TL.total - TL.oFrom + XF} /></Sequence>
      <Sequence from={TL.oFrom - 22} durationInFrames={44}><LightLeak len={44} dir={-1} /></Sequence>
      <Audio src={staticFile('mm_musica.mp3')} volume={(f) => interpolate(f, [0, 10, TL.total - 50, TL.total], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
