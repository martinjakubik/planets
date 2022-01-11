import { makeSpaceGrid, makeSpaceTimeButtonBar, reset, getSpaceTime, setSpaceTime } from './lib.mjs';
import { makeDataButtonBar, makeLoadBar } from './data.mjs';

makeSpaceGrid(80);
makeSpaceTimeButtonBar();
makeDataButtonBar(getSpaceTime, setSpaceTime);
makeLoadBar(reset);