import {Composition, AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
const Hello = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background:'#111',color:'#fff',justifyContent:'center',alignItems:'center',fontSize:90,fontFamily:'sans-serif',opacity:interpolate(f,[0,20],[0,1])}}>Remotion OK</AbsoluteFill>;
};
export const Root = () => <Composition id="Hello" component={Hello} durationInFrames={60} fps={30} width={1080} height={1920}/>;
