import { createDiv, createButton } from './lib/js/learnhypertext.mjs';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul','Aug','Sep', 'Oct', 'Nov', 'Dec'];

const handleNewButtonClick = function () {
    setSpaceTime([]);
    reset();
};

const handleSaveButtonClick = function () {
    const sContent = JSON.stringify(getSpaceTime());
    const oLocalStorage = window.localStorage;
    const sNowKey = getNowKey();
    const sKey = `spacetime-${sNowKey}`;
    oLocalStorage.setItem(sKey, sContent);
    handleStorageChange();
};

const validateSpaceTime = function (a) {
    let aSpaceTime = [];
    const nSnapshotSize = JSON.stringify(a).length;
    if (nSnapshotSize < oAppConfiguration.maxSpaceTimeSize) {
        aSpaceTime = JSON.parse(a);
    }
    return aSpaceTime;
};

const handleLoadFileInputChange = function () {
    const aFiles = document.getElementById('uploadSpaceTimeButton').files;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
        const aSpaceTime = validateSpaceTime(reader.result);
        setSpaceTime(aSpaceTime);
        reset();
    }, false);

    if (aFiles && aFiles.length > 0) {
        const oFile = aFiles[0];
        reader.readAsText(oFile);
    }
};

const makeNewButton = function (parentBox) {
    const oButton = createButton('newButton', 'New', parentBox);
    oButton.onclick = handleNewButtonClick;
};

const makeSaveSpaceTimeButton = function (parentBox) {
    const oButton = createButton('saveSpaceTimeButton', 'Save', parentBox);
    oButton.onclick = handleSaveButtonClick;
};

const makeUploadSpaceTimeButton = function (parentBox) {
    const sAccept = '.spacetime';
    uploadSpaceTimeButton = createFileInput('uploadSpaceTimeButton', 'Upload', parentBox, sAccept);
    uploadSpaceTimeButton.addEventListener('change', handleLoadFileInputChange);
};

const makeDataButtonBar = function (fnGetSpaceTime, fnSetSpaceTime) {
    const buttonBar = createDiv('dataButtonBar', dataView);

    getSpaceTime = fnGetSpaceTime;
    setSpaceTime = fnSetSpaceTime;

    makeNewButton(buttonBar);
    makeSaveSpaceTimeButton(buttonBar);
    makeUploadSpaceTimeButton(buttonBar);
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
    a.download = `planets-${sKey}.spacetime`;
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
    const oDeleteButton = createButton(key, null, oAdditionalButtons);
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
    for (let i = 0; i < storageArea.length; i++) {
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

    const oStylishButton = createButton(sId + 'StylishButton', sLabel, oParent);
    oStylishButton.classList.add('inputStylishButton');

    oStylishButton.appendChild(oInput);
    oParent.appendChild(oStylishButton);

    return oInput;
};

const handleKeyDown = function (event) {
    const keyCode = event.keyCode;
    if (keyCode === 78) {
        setSpaceTime([]);
        reset();
    }
};

let getSpaceTime, setSpaceTime;
let reset;
let dataView;
let uploadSpaceTimeButton;
document.addEventListener('keydown', handleKeyDown);
const oAppConfiguration = { maxSpaceTimeSize: 10 ** 6 };

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