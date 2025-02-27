import { SpaceTimeView } from './spacetimeview.mjs';
import { SpaceTimeController } from './spacetimecontroller.mjs';

const oAppConfiguration = {
    gridSize: 90,
    maxSpaceTimeSize: 10 ** 6,
    hoverSound: 'https://www.supertitle.org/chirp.mp3',
    volumeIcon: {
        on: 'https://www.supertitle.org/volume-on.png',
        off: 'https://www.supertitle.org/volume-off.png'
    },
    settingsIcon: 'https://www.supertitle.org/settings.png'
};

const oSpaceTimeController = new SpaceTimeController(oAppConfiguration);
const oSpaceTimeView = new SpaceTimeView(oAppConfiguration);
oSpaceTimeView.makeSpaceGrid(oSpaceTimeController);
oSpaceTimeView.makeSpaceTimeButtonBar();