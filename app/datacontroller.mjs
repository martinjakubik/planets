import { createDiv, createButton } from '../../lib/js/learnhypertext.mjs';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

class DataController {

    constructor () {
        this.getSpaceTimeModel;
        this.setSpaceTimeModel;
        this.resetSpaceTimeModel;
        this.resetViewAndModel;
        this.dataView;
        this.uploadSpaceTimeButton;
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.appConfiguration = { maxSpaceTimeSize: 10 ** 6 };
    }

    handleNewButtonClick () {
        this.resetSpaceTimeModel();
        this.resetViewAndModel();
    }

    handleSaveButtonClick () {
        const sContent = JSON.stringify(this.getSpaceTimeModel());
        const oLocalStorage = window.localStorage;
        const sNowKey = this.getNowKey();
        const sKey = `spacetime-${sNowKey}`;
        oLocalStorage.setItem(sKey, sContent);
        this.handleStorageChange.call(this);
    }

    validateSpaceTime (a) {
        let aSpaceTime = [];
        const nSnapshotSize = JSON.stringify(a).length;
        if (nSnapshotSize < this.appConfiguration.maxSpaceTimeSize) {
            aSpaceTime = JSON.parse(a);
        }
        return aSpaceTime;
    }

    handleLoadFileInputChange () {
        const aFiles = document.getElementById('uploadSpaceTimeButton').files;
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const aSpaceTime = this.validateSpaceTime.call(this, reader.result);
            this.setSpaceTimeModel.call(this, aSpaceTime);
        }, false);

        if (aFiles && aFiles.length > 0) {
            const oFile = aFiles[0];
            reader.readAsText(oFile);
        }
    }

    makeNewButton (parentBox) {
        const oButton = createButton('newButton', 'New', parentBox);
        oButton.onclick = this.handleNewButtonClick.bind(this);
    }

    makeSaveSpaceTimeButton (parentBox) {
        const oButton = createButton('saveSpaceTimeButton', 'Save', parentBox);
        oButton.onclick = this.handleSaveButtonClick.bind(this);
    }

    makeUploadSpaceTimeButton (parentBox) {
        const sAccept = '.spacetime';
        this.uploadSpaceTimeButton = this.createFileInput.call(this, 'uploadSpaceTimeButton', 'Upload', parentBox, sAccept);
        this.uploadSpaceTimeButton.addEventListener('change', this.handleLoadFileInputChange.bind(this));
    }

    makeDataButtonBar (fnGetSpaceTimeModel, fnSetSpaceTimeModel, fnResetSpaceTimeModel) {
        const buttonBar = createDiv('dataButtonBar', this.dataView);

        this.resetSpaceTimeModel = fnResetSpaceTimeModel;
        this.getSpaceTimeModel = fnGetSpaceTimeModel;
        this.setSpaceTimeModel = fnSetSpaceTimeModel;

        this.makeNewButton.call(this, buttonBar);
        this.makeSaveSpaceTimeButton.call(this, buttonBar);
        this.makeUploadSpaceTimeButton.call(this, buttonBar);
    }

    getNowKey () {
        const oNow = new Date();
        const sMonth = MONTHS_SHORT[oNow.getUTCMonth()];
        const sNowLabel = `${sMonth}.${oNow.getUTCDate()}.${oNow.getUTCHours()}:${oNow.getUTCMinutes()}`;
        return sNowLabel;
    }

    handleLoadDataButtonClick (event) {
        let oTarget = event.target;
        const sKey = oTarget.id;
        const oStorageArea = window.localStorage;
        const oItem = oStorageArea.getItem(sKey);
        const aLoadedSpaceTime = JSON.parse(oItem);
        this.setSpaceTimeModel.call(this, aLoadedSpaceTime);
    }

    handleDataDownloadButtonClick (event) {
        let oTarget = event.target;
        const sKey = oTarget.id;
        const aSpaceTime = this.getSpaceTimeModel.call(this);
        const sContent = JSON.stringify(aSpaceTime);
        const a = document.createElement('a');
        a.href = `data:application/json,${sContent}`;
        a.download = `planets-${sKey}.spacetime`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    handleDataDeleteButtonClick (event) {
        let oTarget = event.target;
        const sKey = oTarget.id;
        const oStorageArea = window.localStorage;
        oStorageArea.removeItem(sKey);
        this.handleStorageChange.call(this);
    }

    addItemToStorageView (storageView, key) {
        const sTitle = key.substring(key.indexOf('-') + 1);
        const oItem = createDiv(key, storageView);
        const oLoadButton = createButton(key, sTitle, oItem);
        oLoadButton.className = 'load';
        oLoadButton.onclick = this.handleLoadDataButtonClick.bind(this);
        const oAdditionalButtons = createDiv(key, oItem);
        oAdditionalButtons.className = 'additionalButtons';
        const oDownloadButton = createButton(key, null, oAdditionalButtons);
        oDownloadButton.className = 'download';
        oDownloadButton.onclick = this.handleDataDownloadButtonClick.bind(this);
        const oDeleteButton = createButton(key, null, oAdditionalButtons);
        oDeleteButton.className = 'delete';
        oDeleteButton.onclick = this.handleDataDeleteButtonClick.bind(this);
    }

    updateStorageView (storageArea) {
        let oStorageView = document.getElementById('storageView');
        if (!oStorageView) {
            oStorageView = createDiv('storageView', this.dataView);
        }
        const aChildren = oStorageView.childNodes;
        for (let j = aChildren.length - 1; j >= 0; j--) {
            const oChild = aChildren[j];
            oStorageView.removeChild(oChild);
        }
        for (let i = 0; i < storageArea.length; i++) {
            const sKey = storageArea.key(i);
            this.addItemToStorageView.call(this, oStorageView, sKey);
        }
    }

    handleStorageChange (storageEvent) {
        let oStorageArea;
        if (storageEvent) {
            oStorageArea = storageEvent.storage;
        } else {
            oStorageArea = window.localStorage;
        }
        this.updateStorageView(oStorageArea);
    }

    createFileInput (sId, sLabel, oParent, sAccept) {
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
    }

    handleKeyDown (event) {
        const keyCode = event.keyCode;
        if (keyCode === 78) {
            this.resetSpaceTime();
        }
    }

    makeLoadBar (fnResetViewAndModel) {
        window.addEventListener('storage', this.handleStorageChange.bind(this));
        this.resetViewAndModel = fnResetViewAndModel;
        this.handleStorageChange.call(this);
    }

    makeDataView (spaceTimeController, resetViewAndModel) {
        this.dataView = createDiv('dataView'),
        this.makeDataButtonBar.call(this, spaceTimeController.getSpaceTimeModel, spaceTimeController.setSpaceTimeModel, spaceTimeController.resetSpaceTimeModel);
        this.makeLoadBar.call(this, resetViewAndModel);
    }
}

export { DataController };