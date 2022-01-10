import { makeSpaceGrid, makeSpaceTimeButtonBar, aSpaceTime } from './lib.mjs';
import { makeDataButtonBar } from './data.mjs';

makeSpaceGrid(80);
makeSpaceTimeButtonBar();
makeDataButtonBar(aSpaceTime);