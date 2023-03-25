import { createDiv, createButton } from '../../lib/js/learnhypertext.mjs';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

class DataController {

    constructor() {
        let getSpaceTimeModel, setSpaceTimeModel, resetSpaceTimeModel;
        let resetViewAndModel;
        let dataView;
        let uploadSpaceTimeButton;
        document.addEventListener('keydown', handleKeyDown);
        this.appConfiguration = { maxSpaceTimeSize: 10 ** 6 };
    }

    handleNewButtonClick() {
        resetSpaceTimeModel();
        resetViewAndModel();
    };

    handleSaveButtonClick() {
        const sContent = JSON.stringify(getSpaceTimeModel());
        const oLocalStorage = window.localStorage;
        const sNowKey = getNowKey();
        const sKey = `spacetime-${sNowKey}`;
        oLocalStorage.setItem(sKey, sContent);
        handleStorageChange();
    };

    validateSpaceTime(a) {
        let aSpaceTime = [];
        const nSnapshotSize = JSON.stringify(a).length;
        if (nSnapshotSize < this.appConfiguration.maxSpaceTimeSize) {
            aSpaceTime = JSON.parse(a);
        }
        return aSpaceTime;
    };

    handleLoadFileInputChange() {
        const aFiles = document.getElementById('uploadSpaceTimeButton').files;
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const aSpaceTime = validateSpaceTime(reader.result);
            setSpaceTimeModel(aSpaceTime);
            reset();
        }, false);

        if (aFiles && aFiles.length > 0) {
            const oFile = aFiles[0];
            reader.readAsText(oFile);
        }
    };

    makeNewButton(parentBox) {
        const oButton = createButton('newButton', 'New', parentBox);
        oButton.onclick = handleNewButtonClick;
    };

    makeSaveSpaceTimeButton(parentBox) {
        const oButton = createButton('saveSpaceTimeButton', 'Save', parentBox);
        oButton.onclick = handleSaveButtonClick;
    };

    makeUploadSpaceTimeButton(parentBox) {
        const sAccept = '.spacetime';
        uploadSpaceTimeButton = createFileInput('uploadSpaceTimeButton', 'Upload', parentBox, sAccept);
        uploadSpaceTimeButton.addEventListener('change', handleLoadFileInputChange);
    };

    makeDataButtonBar(fnGetSpaceTimeModel, fnSetSpaceTimeModel, fnResetSpaceTimeModel) {
        const buttonBar = createDiv('dataButtonBar', dataView);

        resetSpaceTimeModel = fnResetSpaceTimeModel;
        getSpaceTimeModel = fnGetSpaceTimeModel;
        setSpaceTimeModel = fnSetSpaceTimeModel;

        makeNewButton(buttonBar);
        makeSaveSpaceTimeButton(buttonBar);
        makeUploadSpaceTimeButton(buttonBar);
    };

    getNowKey() {
        const oNow = new Date();
        const sMonth = MONTHS_SHORT[oNow.getUTCMonth()];
        const sNowLabel = `${sMonth}.${oNow.getUTCDate()}.${oNow.getUTCHours()}:${oNow.getUTCMinutes()}`;
        return sNowLabel;
    };

    handleLoadDataButtonClick(event) {
        let oTarget = event.target;
        const sKey = oTarget.id;
        const oStorageArea = window.localStorage;
        const oItem = oStorageArea.getItem(sKey);
        const aLoadedSpaceTime = JSON.parse(oItem);
        setSpaceTimeModel(aLoadedSpaceTime);
        reset();
    };

    handleDataDownloadButtonClick(event) {
        let oTarget = event.target;
        const sKey = oTarget.id;
        const aSpaceTime = getSpaceTimeModel();
        const sContent = JSON.stringify(aSpaceTime);
        const a = document.createElement('a');
        a.href = `data:application/json,${sContent}`;
        a.download = `planets-${sKey}.spacetime`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    handleDataDeleteButtonClick(event) {
        let oTarget = event.target;
        const sKey = oTarget.id;
        const oStorageArea = window.localStorage;
        oStorageArea.removeItem(sKey);
        handleStorageChange();
    };

    addItemToStorageView(storageView, key) {
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

    updateStorageView(storageArea) {
        let oStorageView = document.getElementById('storageView');
        if (!oStorageView) {
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

    handleStorageChange(storageEvent) {
        let oStorageArea;
        if (storageEvent) {
            oStorageArea = storageEvent.storage;
        } else {
            oStorageArea = window.localStorage;
        }
        updateStorageView(oStorageArea);
    };

    createFileInput(sId, sLabel, oParent, sAccept) {
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

    handleKeyDown(event) {
        const keyCode = event.keyCode;
        if (keyCode === 78) {
            resetSpaceTime();
            reset();
        }
    };

    makeLoadBar(fnResetViewAndModel) {
        window.addEventListener('storage', handleStorageChange);
        resetViewAndModel = fnResetViewAndModel;
        handleStorageChange();
    };

    makeDataView(spaceTimeController, resetViewAndModel) {
        dataView = createDiv('dataView'),
            makeDataButtonBar(spaceTimeController.getSpaceTimeModel, spaceTimeController.setSpaceTimeModel, spaceTimeController.resetSpaceTimeModel);
        makeLoadBar(resetViewAndModel);
    };
}

export { DataController };