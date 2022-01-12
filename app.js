import { makeSpaceGrid, makeSpaceTimeButtonBar, reset, getSpaceTime, setSpaceTime } from './lib.mjs';
import { makeDataView } from './data.mjs';

makeDataView(getSpaceTime, setSpaceTime, reset);
makeSpaceGrid(80);
makeSpaceTimeButtonBar();