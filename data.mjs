import { createDiv, createButton } from './lib/js/learnhypertext.mjs';

const handleSaveButtonClick = function () {
    const sContent = JSON.stringify(aSpaceTime);
    const a = document.createElement('a');
    a.href = `data:application/json,${sContent}`;
    const sNowLabel = getNowLabel();
    a.download = `spacetime-${sNowLabel}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const handleLoadButtonClick = function () {

};

const makeSaveSpaceTimeButton = function (parentBox) {
    const oButton = createButton('saveSpaceTimeButton', 'Save', parentBox);
    oButton.onclick = handleSaveButtonClick;
};

const makeLoadSpaceTimeButton = function (parentBox) {
    const oButton = createButton('loadSpaceTimeButton', 'Load', parentBox);
    oButton.onclick = handleLoadButtonClick;
};

let aSpaceTime;

const makeDataButtonBar = function (spaceTime) {
    const buttonBar = createDiv('dataButtonBar');

    aSpaceTime = spaceTime;

    makeSaveSpaceTimeButton(buttonBar);
    // makeLoadSpaceTimeButton(buttonBar);
};

const getNowLabel = function () {
    const oNow = new Date();
    const sNowLabel = `${oNow.getUTCFullYear()}-${oNow.getUTCMonth()}-${oNow.getUTCDate()}`;
    return sNowLabel;
};

export { makeDataButtonBar };