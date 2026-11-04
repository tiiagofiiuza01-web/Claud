import React from 'react';
import {
  AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import {loadFont} from '@remotion/fonts';
import beatsData from './beats.json';

const display = 'Anton';
const body = 'Montserrat';
loadFont({family: display, url: staticFile('anton.woff2')});
loadFont({family: body, url: staticFile('montserrat.woff2'), weight: '100 900'});

export const FPS = 30;
const MUSIC_START = 1.997; // primeiro tempo forte da música
const BEATS = (beatsData.beats as number[]).filter((b) => b >= MUSIC_START - 0.01).map((b) => b - MUSIC_START);
const beatFrame = (i: number) => Math.round(BEATS[i] * FPS);

const GOLD = '#FFD400';
const NAVY = '#1B1464';

type Shot = {src: string; at: number; beats: number; label?: string; flash?: boolean};

// at = segundo no clipe de origem; beats = duração em batidas da música
const SHOTS: Shot[] = [
  // Abertura
  {src: 'geral', at: 0.3, beats: 4},
  {src: 'geral', at: 4.5, beats: 2},
  {src: 'geral', at: 6.0, beats: 2},
  // Diversão
  {src: 'geral', at: 18.5, beats: 2, label: 'DIVERSÃO', flash: true},
  {src: 'geral', at: 22.0, beats: 2},
  {src: 'geral', at: 24.5, beats: 2},
  {src: 'geral', at: 28.0, beats: 2},
  // Vôlei
  {src: 'geral', at: 12.0, beats: 2, label: 'COPA DAS NAÇÕES', flash: true},
  {src: 'volei', at: 0.5, beats: 4},
  {src: 'geral', at: 30.5, beats: 2},
  {src: 'volei', at: 13.0, beats: 2},
  {src: 'volei', at: 17.5, beats: 2},
  {src: 'volei', at: 24.0, beats: 2},
  {src: 'geral', at: 42.0, beats: 2},
  {src: 'volei', at: 34.0, beats: 2},
  {src: 'volei', at: 50.0, beats: 2},
  // Louvor
  {src: 'louvor', at: 8.5, beats: 2, label: 'LOUVOR', flash: true},
  {src: 'louvor', at: 10.0, beats: 2},
  {src: 'louvor', at: 12.5, beats: 2},
  {src: 'louvor', at: 26.0, beats: 1},
  {src: 'louvor', at: 30.0, beats: 1},
  {src: 'premiacao', at: 9.2, beats: 2},
  {src: 'geral', at: 52.5, beats: 2},
  // Premiação
  {src: 'geral', at: 44.0, beats: 2, label: 'PREMIAÇÃO', flash: true},
  {src: 'geral', at: 48.5, beats: 2},
  {src: 'premiacao', at: 20.0, beats: 2},
  {src: 'premiacao', at: 26.0, beats: 2},
  {src: 'premiacao', at: 34.0, beats: 2},
  {src: 'geral', at: 62.0, beats: 2},
  {src: 'geral', at: 64.5, beats: 2},
  {src: 'geral', at: 70.0, beats: 4, flash: true},
  {src: 'geral', at: 74.0, beats: 2},
  // Final
  {src: 'premiacao', at: 47.5, beats: 8},
];

const timeline = (() => {
  let b = 0;
  return SHOTS.map((s) => {
    const from = beatFrame(b);
    b += s.beats;
    return {...s, from, dur: beatFrame(b) - from};
  });
})();

export const TOTAL_FRAMES = timeline[timeline.length - 1].from + timeline[timeline.length - 1].dur;

const Clip: React.FC<{shot: Shot; dur: number; index: number}> = ({shot, dur, index}) => {
  const f = useCurrentFrame();
  // leve zoom contínuo, alternando direção, mais "punch" na entrada
  const punch = interpolate(f, [0, 5], [1.12, 1.0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const drift = interpolate(f, [0, dur], index % 2 ? [1.0, 1.06] : [1.06, 1.0]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: 'black'}}>
      <OffthreadVideo
        src={staticFile(`${shot.src}.mp4`)}
        trimBefore={Math.round(shot.at * FPS)}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${punch * drift})`}}
      />
      {shot.flash && (
        <AbsoluteFill style={{backgroundColor: 'white', opacity: interpolate(f, [0, 6], [0.85, 0], {extrapolateRight: 'clamp'})}} />
      )}
    </AbsoluteFill>
  );
};

const SectionLabel: React.FC<{text: string; dur: number}> = ({text, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 12, stiffness: 180}});
  const out = interpolate(f, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 380, opacity: out}}>
      <div style={{
        transform: `scale(${interpolate(s, [0, 1], [0.4, 1])}) rotate(-3deg)`,
        background: GOLD, color: NAVY, fontFamily: display, fontSize: 120, lineHeight: 1,
        padding: '18px 44px 10px', letterSpacing: 2, boxShadow: '0 18px 0 rgba(0,0,0,0.35)', textAlign: 'center',
      }}>{text}</div>
    </AbsoluteFill>
  );
};

const Title: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: f, fps, config: {damping: 11, stiffness: 160}});
  const b = spring({frame: f - 8, fps, config: {damping: 12, stiffness: 160}});
  const c = spring({frame: f - 16, fps, config: {damping: 14}});
  const out = interpolate(f, [beatFrame(8) - 8, beatFrame(8)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: out}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(27,20,100,0.0) 20%, rgba(27,20,100,0.75) 50%, rgba(27,20,100,0.0) 80%)'}} />
      <div style={{textAlign: 'center', transform: 'rotate(-4deg)'}}>
        <div style={{fontFamily: display, color: 'white', fontSize: 230, lineHeight: 0.9, transform: `translateY(${(1 - a) * -300}px)`, opacity: a, textShadow: '0 10px 0 rgba(0,0,0,.35)'}}>CELEBRA</div>
        <div style={{fontFamily: display, color: GOLD, fontSize: 200, lineHeight: 0.95, transform: `scale(${b})`, textShadow: '0 10px 0 rgba(0,0,0,.35)'}}>TEEN 2026</div>
        <div style={{fontFamily: body, fontWeight: 900, color: 'white', fontSize: 52, letterSpacing: 10, marginTop: 24, opacity: c, transform: `translateY(${(1 - c) * 40}px)`}}>COPA DAS NAÇÕES</div>
      </div>
    </AbsoluteFill>
  );
};

const Ending: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: f - 4, fps, config: {damping: 12}});
  const b = spring({frame: f - 14, fps, config: {damping: 14}});
  const fade = interpolate(f, [dur - 15, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <AbsoluteFill style={{backgroundColor: NAVY, opacity: interpolate(f, [0, 12], [0, 0.7], {extrapolateRight: 'clamp'})}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div style={{fontFamily: body, fontWeight: 900, color: 'white', fontSize: 64, letterSpacing: 6, opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>OBRIGADO POR</div>
        <div style={{fontFamily: display, color: GOLD, fontSize: 190, lineHeight: 1, transform: `scale(${a})`, textShadow: '0 10px 0 rgba(0,0,0,.35)'}}>FAZER PARTE!</div>
        <div style={{fontFamily: body, fontWeight: 700, color: 'white', fontSize: 46, letterSpacing: 8, marginTop: 40, opacity: b}}>G148 TEEN · CELEBRA 2026</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Recap: React.FC = () => {
  const last = timeline[timeline.length - 1];
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {timeline.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.dur} premountFor={30}>
          <Clip shot={s} dur={s.dur} index={i} />
        </Sequence>
      ))}
      {timeline.map((s, i) => s.label && (
        <Sequence key={`l${i}`} from={s.from} durationInFrames={Math.min(beatFrame(4), TOTAL_FRAMES - s.from)}>
          <SectionLabel text={s.label} dur={beatFrame(4)} />
        </Sequence>
      ))}
      <Sequence from={0} durationInFrames={beatFrame(8)}><Title /></Sequence>
      <Sequence from={last.from} durationInFrames={last.dur}><Ending dur={last.dur} /></Sequence>
      <Audio
        src={staticFile('musica.mp3')}
        trimBefore={Math.round(MUSIC_START * FPS)}
        volume={(f) => interpolate(f, [0, 6, TOTAL_FRAMES - 45, TOTAL_FRAMES], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
    </AbsoluteFill>
  );
};
