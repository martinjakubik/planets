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
    const buttonBar = createDiv('dataButtonBar', dataView);

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
    let oTarget = event.target;
    if (oTarget.tagName === 'SPAN') {
        oTarget = oTarget.parentElement;
    }
    const sKey = oTarget.id;
    const oStorageArea = window.localStorage;
    const oItem = oStorageArea.getItem(sKey);
    const aLoadedSpaceTime = JSON.parse(oItem);
    setSpaceTime(aLoadedSpaceTime);
    reset();
};

const addItemToStorageView = function (storageView, key) {
    const oListItem = document.createElement('li');
    oListItem.id = key;
    oListItem.onclick = handleStoredDataClick;

    const oTitle = document.createElement('span');
    const sTitle = key.substring(key.indexOf('-') + 1);
    oTitle.innerText = sTitle;
    oListItem.appendChild(oTitle);

    storageView.appendChild(oListItem);
};

const updateStorageView = function (storageArea) {
    let oStorageView = document.getElementById('storageView');
    if(!oStorageView) {
        oStorageView = document.createElement('ol');
        oStorageView.id = 'storageView';
        dataView.appendChild(oStorageView);
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