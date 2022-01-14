import { createDiv, createButton } from './lib/js/learnhypertext.mjs';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sep', 'Oct', 'Nov', 'Dec'];

const handleSaveButtonClick = function () {
    const sContent = JSON.stringify(getSpaceTime());
    const oLocalStorage = window.localStorage;
    const sNowKey = getNowKey();
    const sKey = `spacetime-${sNowKey}`;
    oLocalStorage.setItem(sKey, sContent);
    handleStorageChange();
};

const makeSaveSpaceTimeButton = function (parentBox) {
    const oButton = createButton('saveSpaceTimeButton', 'Save', parentBox);
    oButton.onclick = handleSaveButtonClick;
};

let getSpaceTime, setSpaceTime;

const makeDataButtonBar = function (fnGetSpaceTime, fnSetSpaceTime) {
    const buttonBar = createDiv('dataButtonBar', dataView);

    getSpaceTime = fnGetSpaceTime;
    setSpaceTime = fnSetSpaceTime;

    makeSaveSpaceTimeButton(buttonBar);
};

const getNowKey = function () {
    const oNow = new Date();
    const sMonth = MONTHS_SHORT[oNow.getUTCMonth()];
    const sNowLabel = `${sMonth}.${oNow.getUTCDate()}.${oNow.getUTCHours()}:${oNow.getUTCMinutes()}`;
    return sNowLabel;
};

const handleLoadDataButtonClick = function (event) {
    let oTarget = event.target;
    const sKey = oTarget.id;
    const oStorageArea = window.localStorage;
    const oItem = oStorageArea.getItem(sKey);
    const aLoadedSpaceTime = JSON.parse(oItem);
    setSpaceTime(aLoadedSpaceTime);
    reset();
};

const handleDataDownloadButtonClick = function (event) {
    let oTarget = event.target;
    const sKey = oTarget.id;
    const aSpaceTime = getSpaceTime();
    const sContent = JSON.stringify(aSpaceTime);
    const a = document.createElement('a');
    a.href = `data:application/json,${sContent}`;
    a.download = `spacetime-${sKey}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

const handleDataDeleteButtonClick = function (event) {
    let oTarget = event.target;
    const sKey = oTarget.id;
    const oStorageArea = window.localStorage;
    oStorageArea.removeItem(sKey);
    handleStorageChange();
};

const addItemToStorageView = function (storageView, key) {
    const sTitle = key.substring(key.indexOf('-') + 1);
    const oItem = createDiv(key, storageView);
    const oLoadButton = createButton(key, sTitle, oItem);
    oLoadButton.className = 'load';
    oLoadButton.onclick = handleLoadDataButtonClick;
    const oAdditionalButtons = createDiv(key, oItem);
    oAdditionalButtons.className = 'additionalButtons';
    const oDownloadButton = createButton(key, null, oAdditionalButtons);
    oDownloadButton.className = 'download';
    oDownloadButton.onclick = handleDataDownloadButtonClick;
    const oDeleteButton = createButton(key, 'x', oAdditionalButtons);
    oDeleteButton.className = 'delete';
    oDeleteButton.onclick = handleDataDeleteButtonClick;
};

const updateStorageView = function (storageArea) {
    let oStorageView = document.getElementById('storageView');
    if(!oStorageView) {
        oStorageView = createDiv('storageView', dataView);
    }
    const aChildren = oStorageView.childNodes;
    for (let j = aChildren.length - 1; j >= 0; j--) {
        const oChild = aChildren[j];
        oStorageView.removeChild(oChild);
    }
    for (let i = 0; i < storageArea.length; i++) {
        const sKey = storageArea.key(i);
        addItemToStorageView(oStorageView, sKey);
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

let reset;
let dataView;

const makeLoadBar = function (fnReset) {
    window.addEventListener('storage', handleStorageChange);
    reset = fnReset;
    handleStorageChange();
};

const makeDataView = function (getSpaceTime, setSpaceTime, reset) {
    dataView = createDiv('dataView'),
    makeDataButtonBar(getSpaceTime, setSpaceTime);
    makeLoadBar(reset);
};

export { makeDataView };