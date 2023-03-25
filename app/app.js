import { SpaceTimeView } from './spacetimeview.mjs';
import { SpaceTimeController } from './spacetimecontroller.mjs';

const oAppConfiguration = {
    gridSize: 0,
    maxSpaceTimeSize: 10 ** 6
};

const oSpaceTimeController = new SpaceTimeController();
const oSpaceTimeView = new SpaceTimeView(oAppConfiguration);
oSpaceTimeView.makeSpaceGrid(80, oSpaceTimeController);