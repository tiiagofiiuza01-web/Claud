import React from 'react';
import {
  AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, random,
  staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import {loadFont} from '@remotion/fonts';
import beatsData from './electro_beats.json';

const DISPLAY = 'Anton';
const BODY = 'Montserrat';
loadFont({family: DISPLAY, url: staticFile('anton.woff2')});
loadFont({family: BODY, url: staticFile('montserrat.woff2'), weight: '100 900'});

export const FPS = 30;
const MUSIC_START = 124.04; // início do "suspense" antes do drop
const MUSIC_END = 166.0;
const BEATS = (beatsData.beats as number[])
  .filter((b) => b >= MUSIC_START - 0.05)
  .map((b) => (b - MUSIC_START) * FPS);
const B = (i: number) => Math.round(BEATS[Math.min(i, BEATS.length - 1)]);
export const TOTAL = Math.round((MUSIC_END - MUSIC_START) * FPS);

const C = {
  navy: '#120E4A', blue: '#2C2CC8', purple: '#6A2BE0', gold: '#FFD400', red: '#FF2D55', white: '#FFFFFF', cyan: '#19D3FF',
};
const PALETTE = [C.gold, C.cyan, C.red, C.white, C.purple];
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- utilidades ----------
type Src = {src: string; at: number; rate?: number};

const Vid: React.FC<Src & {style?: React.CSSProperties}> = ({src, at, rate = 1, style}) => (
  <OffthreadVideo
    src={staticFile(`${src}.mp4`)}
    trimBefore={Math.round(at * FPS)}
    playbackRate={rate}
    muted
    style={{width: '100%', height: '100%', objectFit: 'cover', ...style}}
  />
);

/** pulso de escala a cada batida (frame absoluto) */
const usePulse = (absFrame: number, amount = 0.03) => {
  let last = 0;
  for (const b of BEATS) { if (b <= absFrame) last = b; else break; }
  const d = absFrame - last;
  return 1 + amount * Math.exp(-d / 3);
};

const Stripes: React.FC<{speed?: number; opacity?: number}> = ({speed = 4, opacity = 0.12}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      opacity,
      backgroundImage: `repeating-linear-gradient(-35deg, ${C.white} 0 40px, transparent 40px 120px)`,
      backgroundPosition: `${f * speed}px 0`,
    }} />
  );
};

const Ticker: React.FC<{y: number; color?: string; bg?: string; dir?: 1 | -1; rotate?: number}> = ({y, color = C.navy, bg = C.gold, dir = 1, rotate = -4}) => {
  const f = useCurrentFrame();
  const text = 'CELEBRA TEEN 2026 ★ COPA DAS NAÇÕES ★ G148 TEEN ★ '.repeat(6);
  return (
    <div style={{position: 'absolute', left: -200, right: -200, top: y, background: bg, transform: `rotate(${rotate}deg)`, padding: '10px 0', overflow: 'hidden', boxShadow: '0 10px 0 rgba(0,0,0,.25)'}}>
      <div style={{whiteSpace: 'nowrap', fontFamily: DISPLAY, fontSize: 54, color, letterSpacing: 3, transform: `translateX(${-((f * 9 * dir) % 1600) - 800}px)`}}>{text}</div>
    </div>
  );
};

const Confetti: React.FC<{n?: number; seed?: string; delay?: number}> = ({n = 90, seed = 'c', delay = 0}) => {
  const f = useCurrentFrame() - delay;
  if (f < 0) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, i) => {
        const x0 = random(`${seed}x${i}`) * 1080;
        const vx = (random(`${seed}vx${i}`) - 0.5) * 30;
        const vy = -20 - random(`${seed}vy${i}`) * 35;
        const t = f;
        const x = x0 + vx * t * 0.6 + Math.sin((t + i * 7) / 6) * 20;
        const y = 1500 + vy * t + 0.9 * t * t;
        const rot = t * (8 + random(`${seed}r${i}`) * 20);
        const w = 14 + random(`${seed}w${i}`) * 18;
        const color = PALETTE[Math.floor(random(`${seed}c${i}`) * PALETTE.length)];
        if (y > 2100) return null;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: w, height: w * 0.45, background: color, transform: `rotate(${rot}deg) scaleY(${Math.cos(t / 3 + i)})`, borderRadius: 3}} />;
      })}
    </AbsoluteFill>
  );
};

/** palavra que entra letra por letra com caixa colorida */
const Kinetic: React.FC<{text: string; dur: number; y?: number; size?: number; bg?: string; color?: string; rotate?: number}> = ({text, dur, y = 1180, size = 150, bg = C.gold, color = C.navy, rotate = -4}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const box = spring({frame: f, fps, config: {damping: 14, stiffness: 220}});
  const out = interpolate(f, [dur - 8, dur], [0, 1], clamp);
  const letters = text.split('');
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', transform: `rotate(${rotate}deg) translateX(${out * 1400}px)`}}>
      <div style={{position: 'relative', padding: '16px 44px 6px'}}>
        <div style={{position: 'absolute', inset: 0, background: bg, transform: `scaleX(${box})`, transformOrigin: 'left', boxShadow: '14px 14px 0 rgba(0,0,0,.35)'}} />
        <div style={{position: 'relative', display: 'flex', fontFamily: DISPLAY, fontSize: size, lineHeight: 1, color, letterSpacing: 2, overflow: 'hidden'}}>
          {letters.map((l, i) => {
            const s = spring({frame: f - 2 - i * 0.8, fps, config: {damping: 14, stiffness: 260}});
            return <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - s) * 140}%)`, whiteSpace: 'pre'}}>{l}</span>;
          })}
        </div>
      </div>
    </div>
  );
};

/** varredura diagonal de faixas coloridas (transição) */
const Wipe: React.FC = () => {
  const f = useCurrentFrame();
  const bars = [C.gold, C.purple, C.white];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {bars.map((c, i) => {
        const p = interpolate(f, [i * 1.5, 12 + i * 1.5], [-1, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
        return <div key={i} style={{position: 'absolute', left: -600, top: -400, width: 2400, height: 900, background: c, transform: `rotate(-35deg) translateY(${p * 2600}px)`}} />;
      })}
    </AbsoluteFill>
  );
};

const Flash: React.FC<{len?: number}> = ({len = 7}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: 'white', opacity: interpolate(f, [0, len], [0.9, 0], clamp)}} />;
};

// ---------- layouts ----------
type Layout =
  | {kind: 'full'; clip: Src; zoom?: 'in' | 'out'}
  | {kind: 'cols'; clips: Src[]}
  | {kind: 'rows'; clips: Src[]}
  | {kind: 'grid'; clips: Src[]}
  | {kind: 'card'; clip: Src; tilt: number}
  | {kind: 'circle'; clip: Src};

const Scene: React.FC<{layout: Layout; dur: number; startAbs: number}> = ({layout, dur, startAbs}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pulse = usePulse(startAbs + f);
  const beatInScene = (k: number) => B(BEATS.findIndex((b) => b >= startAbs - 0.5) + k) - startAbs;

  if (layout.kind === 'full') {
    const punch = interpolate(f, [0, 6], [1.15, 1], {...clamp, easing: Easing.out(Easing.cubic)});
    const drift = interpolate(f, [0, dur], layout.zoom === 'out' ? [1.08, 1] : [1, 1.08]);
    return <AbsoluteFill style={{overflow: 'hidden'}}><div style={{width: '100%', height: '100%', transform: `scale(${punch * drift * pulse})`}}><Vid {...layout.clip} /></div></AbsoluteFill>;
  }

  if (layout.kind === 'cols' || layout.kind === 'rows') {
    const n = layout.clips.length;
    const isCols = layout.kind === 'cols';
    return (
      <AbsoluteFill style={{background: C.navy, display: 'flex', flexDirection: isCols ? 'row' : 'column', gap: 12, padding: 12, transform: `scale(${pulse})`}}>
        {layout.clips.map((c, i) => {
          const s = spring({frame: f - beatInScene(i) * 0.5, fps, config: {damping: 16, stiffness: 240}});
          const dir = i % 2 ? 1 : -1;
          const off = (1 - s) * 1100 * dir;
          return (
            <div key={i} style={{flex: 1, overflow: 'hidden', borderRadius: 24, transform: isCols ? `translateY(${off}px)` : `translateX(${off}px)`}}>
              <Vid {...c} style={{transform: `scale(${1.05 + 0.05 * Math.sin((f + i * 10) / 20)})`}} />
            </div>
          );
        })}
        <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>{n === 0 && null}</div>
      </AbsoluteFill>
    );
  }

  if (layout.kind === 'grid') {
    return (
      <AbsoluteFill style={{background: C.purple}}>
        <Stripes speed={3} opacity={0.15} />
        <div style={{position: 'absolute', inset: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 14, transform: `scale(${pulse})`}}>
          {layout.clips.map((c, i) => {
            const s = spring({frame: f - beatInScene(i), fps, config: {damping: 11, stiffness: 170}});
            return (
              <div key={i} style={{overflow: 'hidden', borderRadius: 28, border: `8px solid ${i % 2 ? C.gold : C.white}`, transform: `scale(${s}) rotate(${(1 - s) * (i % 2 ? 20 : -20)}deg)`}}>
                {s > 0.01 && <Vid {...c} />}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  if (layout.kind === 'card') {
    const s = spring({frame: f, fps, config: {damping: 13, stiffness: 140}});
    const sway = Math.sin(f / 18) * 1.2;
    return (
      <AbsoluteFill style={{background: C.navy, overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: -60, filter: 'blur(28px) brightness(0.55) saturate(1.3)'}}><Vid {...layout.clip} /></div>
        <Stripes speed={2} opacity={0.07} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{
            width: 880, height: 1560, borderRadius: 40, overflow: 'hidden', border: `12px solid ${C.white}`, boxShadow: '0 40px 80px rgba(0,0,0,.5)',
            transform: `translateY(${(1 - s) * 1600}px) rotate(${layout.tilt * s + sway}deg) scale(${pulse})`,
          }}>
            <Vid {...layout.clip} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  // circle reveal
  const r = interpolate(f, [0, 10], [0, 140], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: C.gold}}>
      <AbsoluteFill style={{clipPath: `circle(${r}% at 50% 45%)`, transform: `scale(${pulse})`}}><Vid {...layout.clip} /></AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'}}>
        <div style={{width: r * 22, height: r * 22, borderRadius: '50%', border: `16px solid ${C.white}`, opacity: interpolate(f, [6, 14], [1, 0], clamp), marginTop: -190}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- roteiro (em batidas; 4 batidas = 1 compasso ≈ 1,5s) ----------
type Shot = {beats: number; layout: Layout; label?: string; wipe?: boolean; flash?: boolean; confetti?: boolean};
const INTRO_BEATS = 16;

const SHOTS: Shot[] = [
  // DROP — Diversão
  {beats: 4, layout: {kind: 'full', clip: {src: 'geral', at: 22.0}}, label: 'DIVERSÃO', flash: true},
  {beats: 8, layout: {kind: 'cols', clips: [{src: 'geral', at: 18.5}, {src: 'geral', at: 24.5}, {src: 'geral', at: 29.0, rate: 0.5}]}},
  {beats: 2, layout: {kind: 'full', clip: {src: 'geral', at: 0.3}}},
  {beats: 2, layout: {kind: 'full', clip: {src: 'geral', at: 4.5}, zoom: 'out'}},
  // Vôlei
  {beats: 4, layout: {kind: 'full', clip: {src: 'geral', at: 12.0}}, label: 'COPA DAS NAÇÕES', wipe: true},
  {beats: 4, layout: {kind: 'full', clip: {src: 'volei', at: 0.5}, zoom: 'out'}},
  {beats: 4, layout: {kind: 'full', clip: {src: 'geral', at: 31.2}}},
  {beats: 4, layout: {kind: 'circle', clip: {src: 'volei', at: 13.0}}},
  {beats: 4, layout: {kind: 'full', clip: {src: 'volei', at: 24.0, rate: 0.6}}, flash: true},
  {beats: 4, layout: {kind: 'rows', clips: [{src: 'volei', at: 34.0}, {src: 'geral', at: 42.0}]}},
  // Louvor
  {beats: 4, layout: {kind: 'card', clip: {src: 'louvor', at: 8.5}, tilt: -4}, label: 'LOUVOR', wipe: true},
  {beats: 4, layout: {kind: 'card', clip: {src: 'louvor', at: 11.8}, tilt: 4}},
  {beats: 8, layout: {kind: 'cols', clips: [{src: 'louvor', at: 26.0}, {src: 'louvor', at: 30.0}, {src: 'louvor', at: 33.0}]}},
  {beats: 4, layout: {kind: 'full', clip: {src: 'premiacao', at: 9.2}}},
  // Premiação
  {beats: 4, layout: {kind: 'full', clip: {src: 'geral', at: 44.0}, zoom: 'out'}, label: 'PREMIAÇÃO', wipe: true},
  {beats: 8, layout: {kind: 'grid', clips: [{src: 'geral', at: 48.5, rate: 0.6}, {src: 'premiacao', at: 21.0, rate: 0.7}, {src: 'premiacao', at: 26.0}, {src: 'premiacao', at: 34.0}]}},
  {beats: 8, layout: {kind: 'full', clip: {src: 'geral', at: 70.0}}, flash: true, confetti: true},
];

const timeline = (() => {
  let b = INTRO_BEATS;
  return SHOTS.map((s) => {
    const from = B(b);
    b += s.beats;
    return {...s, from, dur: B(b) - from};
  });
})();
const OUTRO_FROM = timeline[timeline.length - 1].from + timeline[timeline.length - 1].dur;

// ---------- abertura ----------
const Polaroid: React.FC<{clip: Src; x: number; y: number; rot: number; delay: number}> = ({clip, x, y, rot, delay}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - delay, fps, config: {damping: 12, stiffness: 150}});
  if (f < delay) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 300, height: 450, background: 'white', padding: 12, borderRadius: 14, boxShadow: '0 20px 40px rgba(0,0,0,.45)', transform: `scale(${s}) rotate(${rot + (1 - s) * 40}deg)`}}>
      <div style={{width: '100%', height: '100%', overflow: 'hidden', borderRadius: 8}}><Vid {...clip} /></div>
    </div>
  );
};

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dropAt = B(INTRO_BEATS);
  const word = 'CELEBRA'.split('');
  const teen = spring({frame: f - B(4), fps, config: {damping: 9, stiffness: 180}});
  const year = spring({frame: f - B(8), fps, config: {damping: 12, stiffness: 160}});
  const copa = interpolate(f, [B(9), B(10)], [0, 1], clamp);
  const zoomOut = interpolate(f, [dropAt - 10, dropAt], [1, 4], {...clamp, easing: Easing.in(Easing.cubic)});
  const fadeOut = interpolate(f, [dropAt - 4, dropAt], [1, 0], clamp);
  const pulse = usePulse(f, 0.02);
  const ring = interpolate(f, [B(8), B(10)], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, ${C.purple} 0%, ${C.blue} 35%, ${C.navy} 75%)`, overflow: 'hidden'}}>
      <Stripes speed={5} opacity={0.1} />
      <Ticker y={150} />
      <Ticker y={1640} dir={-1} bg={C.white} rotate={-4} />
      <AbsoluteFill style={{transform: `scale(${zoomOut * pulse})`, opacity: fadeOut}}>
        {/* anel girando */}
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{width: 900, height: 900, borderRadius: '50%', border: `10px dashed ${C.gold}`, opacity: ring * 0.8, transform: `rotate(${f * 1.5}deg) scale(${0.6 + ring * 0.4})`, marginTop: -120}} />
        </AbsoluteFill>
        <Polaroid clip={{src: 'volei', at: 50.0}} x={-30} y={330} rot={-14} delay={B(10)} />
        <Polaroid clip={{src: 'louvor', at: 12.0}} x={800} y={300} rot={12} delay={B(11)} />
        <Polaroid clip={{src: 'geral', at: 42.0}} x={-20} y={1180} rot={10} delay={B(12)} />
        <Polaroid clip={{src: 'geral', at: 70.5}} x={790} y={1160} rot={-10} delay={B(13)} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center', marginTop: -120}}>
          <div style={{transform: 'rotate(-5deg)'}}>
            <div style={{display: 'flex', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 250, lineHeight: 0.9, color: C.white, textShadow: '0 12px 0 rgba(0,0,0,.35)'}}>
              {word.map((l, i) => {
                const s = spring({frame: f - i * 2, fps, config: {damping: 10, stiffness: 200}});
                return <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - s) * -600}px) rotate(${(1 - s) * (i % 2 ? 30 : -30)}deg)`}}>{l}</span>;
              })}
            </div>
            <div style={{display: 'inline-block', marginTop: 10, background: C.gold, color: C.navy, fontFamily: DISPLAY, fontSize: 210, lineHeight: 1, padding: '10px 40px 0', transform: `scale(${teen > 0 ? 3 - 2 * teen : 0}) rotate(${(1 - teen) * -20}deg)`, opacity: teen > 0.02 ? 1 : 0, boxShadow: '16px 16px 0 rgba(0,0,0,.35)'}}>TEEN</div>
            <div style={{fontFamily: DISPLAY, fontSize: 170, lineHeight: 1.05, color: 'transparent', WebkitTextStroke: `5px ${C.white}`, transform: `scale(${year})`, marginTop: 10}}>2026</div>
            <div style={{fontFamily: BODY, fontWeight: 900, fontSize: 54, letterSpacing: 12, color: C.gold, clipPath: `inset(0 ${(1 - copa) * 100}% 0 0)`, marginTop: 6}}>COPA DAS NAÇÕES</div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- encerramento ----------
const Outro: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: f, fps, config: {damping: 11, stiffness: 170}});
  const b = spring({frame: f - B(2) + B(0), fps, config: {damping: 12}});
  const c = spring({frame: f - 22, fps, config: {damping: 14}});
  const fade = interpolate(f, [dur - 12, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <AbsoluteFill style={{filter: 'blur(24px) brightness(.45) saturate(1.3)', transform: 'scale(1.15)'}}><Vid src="premiacao" at={48.5} /></AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.navy}cc, ${C.purple}99 50%, ${C.navy}cc)`}} />
      <Stripes speed={4} opacity={0.08} />
      <Ticker y={140} rotate={4} />
      <Ticker y={1660} rotate={4} dir={-1} bg={C.white} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div style={{transform: `rotate(-5deg) scale(${a})`}}>
          <div style={{fontFamily: DISPLAY, fontSize: 210, color: C.white, lineHeight: 0.9, textShadow: '0 12px 0 rgba(0,0,0,.35)'}}>CELEBRA</div>
          <div style={{display: 'inline-block', background: C.gold, color: C.navy, fontFamily: DISPLAY, fontSize: 180, lineHeight: 1, padding: '8px 36px 0', boxShadow: '14px 14px 0 rgba(0,0,0,.35)'}}>TEEN 2026</div>
        </div>
        <div style={{marginTop: 90, fontFamily: BODY, fontWeight: 900, color: C.white, fontSize: 60, letterSpacing: 6, opacity: b, transform: `translateY(${(1 - b) * 60}px)`}}>OBRIGADO POR</div>
        <div style={{fontFamily: DISPLAY, color: C.gold, fontSize: 130, lineHeight: 1, opacity: b, transform: `translateY(${(1 - b) * 80}px)`}}>FAZER PARTE!</div>
        <div style={{marginTop: 40, fontFamily: BODY, fontWeight: 700, color: C.white, fontSize: 40, letterSpacing: 10, opacity: c}}>G148 TEEN</div>
      </AbsoluteFill>
      <Confetti seed="outro" n={110} />
    </AbsoluteFill>
  );
};

// ---------- composição ----------
export const Motion: React.FC = () => {
  const dropAt = B(INTRO_BEATS);
  return (
    <AbsoluteFill style={{backgroundColor: C.navy}}>
      <Sequence durationInFrames={dropAt}><Intro /></Sequence>
      {timeline.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur} premountFor={30}>
          <Scene layout={s.layout} dur={s.dur} startAbs={s.from} />
          {s.flash && <Flash />}
          {s.confetti && <Confetti seed={`s${i}`} />}
        </Sequence>
      ))}
      {timeline.map((s, i) => s.label && (
        <Sequence key={`l${i}`} from={s.from} durationInFrames={B(INTRO_BEATS + 6) - B(INTRO_BEATS)}>
          <Kinetic text={s.label} dur={B(INTRO_BEATS + 6) - B(INTRO_BEATS)} size={s.label.length > 10 ? 120 : 160} />
        </Sequence>
      ))}
      {timeline.map((s, i) => s.wipe && (
        <Sequence key={`w${i}`} from={s.from - 7} durationInFrames={16}><Wipe /></Sequence>
      ))}
      <Sequence from={dropAt} durationInFrames={8}><Flash len={8} /></Sequence>
      <Sequence from={OUTRO_FROM} durationInFrames={TOTAL - OUTRO_FROM}><Outro dur={TOTAL - OUTRO_FROM} /></Sequence>
      <Sequence from={OUTRO_FROM} durationInFrames={8}><Flash /></Sequence>
      <Audio
        src={staticFile('electrodoodle.mp3')}
        trimBefore={Math.round(MUSIC_START * FPS)}
        volume={(f) => interpolate(f, [0, 4, TOTAL - 10, TOTAL], [0, 1, 1, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
