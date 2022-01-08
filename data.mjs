import { createDiv, createButton } from './lib/js/learnhypertext.mjs';

const handleSaveButtonClick = function () {

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

const makeDataButtonBar = function () {
    const buttonBar = createDiv('dataButtonBar');

    makeSaveSpaceTimeButton(buttonBar);
    makeLoadSpaceTimeButton(buttonBar);
};

export { makeDataButtonBar };