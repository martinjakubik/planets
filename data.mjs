import { createDiv, createButton } from './lib/js/learnhypertext.mjs';

const handleDownloadButtonClick = function () {
    const sContent = JSON.stringify(aSpaceTime);
    const a = document.createElement('a');
    a.href = `data:application/json,${sContent}`;
    const sNowLabel = getNowLabel();
    a.download = `spacetime-${sNowLabel}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const handleSaveButtonClick = function () {
    const sContent = JSON.stringify(aSpaceTime);
    const oLocalStorage = window.localStorage;
    const sNowLabel = getNowLabel();
    const sKey = `spacetime-${sNowLabel}`;
    oLocalStorage.setItem(sKey, sContent);
    handleStorageChange();
};

const handleLoadFileInputChange = function () {
};

const makeDownloadSpaceTimeButton = function (parentBox) {
    const oButton = createButton('downloadSpaceTimeButton', 'Download', parentBox);
    oButton.onclick = handleDownloadButtonClick;
};

const makeSaveSpaceTimeButton = function (parentBox) {
    const oButton = createButton('saveSpaceTimeButton', 'Save', parentBox);
    oButton.onclick = handleSaveButtonClick;
};

const makeUploadSpaceTimeButton = function (parentBox) {
    const sAccept = 'json';
    loadSpaceTimeButton = createFileInput('loadSpaceTimeButton', 'Upload', parentBox, sAccept);
    loadSpaceTimeButton.addEventListener('change', handleLoadFileInputChange);
};

let aSpaceTime;
let loadSpaceTimeButton;

const makeDataButtonBar = function (spaceTime) {
    const buttonBar = createDiv('dataButtonBar');

    aSpaceTime = spaceTime;

    makeDownloadSpaceTimeButton(buttonBar);
    makeSaveSpaceTimeButton(buttonBar);
    makeUploadSpaceTimeButton(buttonBar);
};

const getNowLabel = function () {
    const oNow = new Date();
    const sNowLabel = `${oNow.getUTCFullYear()}-${oNow.getUTCMonth()}-${oNow.getUTCDate()}`;
    return sNowLabel;
};

const createFileInput = function (sId, sLabel, oParent, sAccept) {

    if (!oParent) {
        oParent = document.body;
    }

    const oInput = document.createElement('input');
    oInput.type = 'file';
    oInput.id = sId;
    if (sAccept && sAccept.length > 0) {
        oInput.accept = sAccept;
    }

    const oLabel = document.createElement('label');
    oLabel.for = sId;
    oLabel.innerText = sLabel;

    oParent.appendChild(oLabel);
    oParent.appendChild(oInput);

    return oInput;

};

const updateStorageView = function (storageArea) {
    let oStorageView = document.getElementById('storageView');
    if(!oStorageView) {
        oStorageView = document.createElement('ul');
        oStorageView.id = 'storageView';
        document.body.appendChild(oStorageView);
    }
    const aChildren = oStorageView.childNodes;
    for (let j = aChildren.length - 1; j >= 0; j--) {
        const oChild = aChildren[j];
        oStorageView.removeChild(oChild);
    }
    for (let i = 0; i < storageArea.length; i++) {
        const sKey = storageArea.key(i);
        const oChild = document.createElement('li');
        oChild.innerText =sKey;
        oStorageView.appendChild(oChild);
    }
};

const handleStorageChange = function (storageEvent) {
    let oStorageArea;
    if (storageEvent) {
        oStorageArea  = storageEvent.storage;
    } else {
        oStorageArea = window.localStorage;
    }
    updateStorageView(oStorageArea);
};

const makeLoadBar = function () {
    window.addEventListener('storage', handleStorageChange);
};

export { makeDataButtonBar, makeLoadBar };