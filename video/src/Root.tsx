import {Composition} from 'remotion';
import {Recap, TOTAL_FRAMES, FPS} from './Recap';
import {Motion, TOTAL} from './Motion';
export const Root = () => (
  <>
    <Composition id="CelebraTeenMotion" component={Motion} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
    <Composition id="CelebraTeen" component={Recap} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
