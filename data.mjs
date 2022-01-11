import { createDiv, createButton } from './lib/js/learnhypertext.mjs';

const handleSaveButtonClick = function () {
    const sContent = JSON.stringify(getSpaceTime());
    const oLocalStorage = window.localStorage;
    const sNowLabel = getNowLabel();
    const sKey = `spacetime-${sNowLabel}`;
    oLocalStorage.setItem(sKey, sContent);
    handleStorageChange();
};

const makeSaveSpaceTimeButton = function (parentBox) {
    const oButton = createButton('saveSpaceTimeButton', 'Save', parentBox);
    oButton.onclick = handleSaveButtonClick;
};

let getSpaceTime, setSpaceTime;

const makeDataButtonBar = function (fnGetSpaceTime, fnSetSpaceTime) {
    const buttonBar = createDiv('dataButtonBar');

    getSpaceTime = fnGetSpaceTime;
    setSpaceTime = fnSetSpaceTime;

    makeSaveSpaceTimeButton(buttonBar);
};

const getNowLabel = function () {
    const oNow = new Date();
    const sMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sep', 'Oct', 'Nov', 'Dec'];
    const sMonth = sMonths[oNow.getUTCMonth()];
    const sNowLabel = `${sMonth}.${oNow.getUTCDate()}.${oNow.getUTCHours()}:${oNow.getUTCMinutes()}`;
    return sNowLabel;
};

const handleStoredDataClick = function (event) {
    const oTarget = event.target;
    const sKey = oTarget.innerText;
    const oStorageArea = window.localStorage;
    const oItem = oStorageArea.getItem(sKey);
    const aLoadedSpaceTime = JSON.parse(oItem);
    setSpaceTime(aLoadedSpaceTime);
    reset();
};

const addItemToStorageView = function (storageView, key) {
    const oListItem = document.createElement('li');
    oListItem.innerText = key;
    oListItem.onclick = handleStoredDataClick;
    storageView.appendChild(oListItem);
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

const makeLoadBar = function (fnReset) {
    window.addEventListener('storage', handleStorageChange);
    reset = fnReset;
    handleStorageChange();
};

export { makeDataButtonBar, makeLoadBar };