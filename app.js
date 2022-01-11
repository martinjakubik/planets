import { makeSpaceGrid, makeSpaceTimeButtonBar, aSpaceTime } from './lib.mjs';
import { makeDataButtonBar, makeLoadBar } from './data.mjs';

makeSpaceGrid(80);
makeSpaceTimeButtonBar();
makeDataButtonBar(aSpaceTime);
makeLoadBar();