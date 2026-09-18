import {Composition, registerRoot} from 'remotion';
import {CaptionOverlay, type Props} from './CaptionOverlay';
import data from '../../project.json';

const props = data as Props;
registerRoot(() => <Composition id="Captions" component={CaptionOverlay}
  width={props.settings.width} height={props.settings.height} fps={props.settings.fps}
  durationInFrames={props.settings.durationInFrames} defaultProps={props}/>);
