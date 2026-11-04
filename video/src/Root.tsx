import {Composition} from 'remotion';
import {Recap, TOTAL_FRAMES, FPS} from './Recap';
export const Root = () => (
  <Composition id="CelebraTeen" component={Recap} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
);
