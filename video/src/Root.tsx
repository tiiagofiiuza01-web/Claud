import {Composition} from 'remotion';
import {Recap, TOTAL_FRAMES, FPS} from './Recap';
import {Motion, TOTAL} from './Motion';
import {Solene, TOTAL as SOLENE_TOTAL} from './Solene';
import {Vintage, TOTAL as VINTAGE_TOTAL} from './Vintage';
export const Root = () => (
  <>
    <Composition id="VintageFormatura01" component={Vintage} durationInFrames={VINTAGE_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="FormaturaMM" component={Solene} durationInFrames={SOLENE_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="CelebraTeenMotion" component={Motion} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
    <Composition id="CelebraTeen" component={Recap} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
