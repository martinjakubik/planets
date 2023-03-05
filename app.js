import { makeSpaceGrid, makeSpaceTimeButtonBar, reset } from './lib.mjs';
import { makeDataView } from './data.mjs';
import { SpaceTimeController } from './spacetimecontroller.mjs';

const oSpaceTimeController = new SpaceTimeController();
makeDataView(SpaceTimeController, reset);
makeSpaceGrid(80, oSpaceTimeController);
makeSpaceTimeButtonBar();