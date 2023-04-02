import { SpaceTimeView } from './spacetimeview.mjs';
import { SpaceTimeController } from './spacetimecontroller.mjs';

const oAppConfiguration = {
    gridSize: 0,
    maxSpaceTimeSize: 10 ** 6,
    hoverSound: 'https://www.supertitle.org/chirp.mp3',
    volumeIcon: {
        on: 'https://www.supertitle.org/volume-on.png',
        off: 'https://www.supertitle.org/volume-off.png'
    }
};

const oSpaceTimeController = new SpaceTimeController(oAppConfiguration);
const oSpaceTimeView = new SpaceTimeView(oAppConfiguration);
oSpaceTimeView.makeSpaceTimeButtonBar();
oSpaceTimeView.makeSpaceGrid(80, oSpaceTimeController);