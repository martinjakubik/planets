import { createBody } from './gravity.mjs';
import { createDiv, createButton } from './learnhypertext.mjs';

const TIMER_INTERVAL = 70;
const CSS_CLASS_BODY_BOX = 'bodyBox';
const CSS_CLASS_NEIGHBOR_BOX = 'neighborBox';
const CSS_CLASS_TRAIL_BOX = 'trailBox';
const TRAIL_LENGTH = 16;

class SpaceTimeView {
    static getXYFromID (sId) {
        let aCoordinates = sId.split(':');
        let sX = aCoordinates[0];
        let sY = aCoordinates[1];
        return {
            x: Number(sX),
            y: Number(sY)
        };
    }

    static modulo (n, d) {
        return ((n % d) + d) % d;
    }

    static eraseBody (target, mass) {
        target.classList.remove(`m${mass}`);
        target.classList.remove(CSS_CLASS_BODY_BOX);
    }

    static incrementMass (target, mass) {
        const nPreviousMass = this.modulo((mass - 1), 16);
        target.classList.remove(`m${nPreviousMass}`);
        target.classList.add(`m${mass}`);
    }

    static drawSparkle (position, isPenDown, gridSize) {
        const aNeighborBoxes = SpaceTimeView.getNeighborBoxes(position, 1, gridSize);
        aNeighborBoxes.forEach(neighborBoxPosition => {
            let target = document.getElementById(`${neighborBoxPosition.x}:${neighborBoxPosition.y}`);
            if (isPenDown) {
                target.classList.add(CSS_CLASS_NEIGHBOR_BOX);
            } else {
                target.classList.remove(CSS_CLASS_NEIGHBOR_BOX);
            }
        });
    }

    static getNeighborBoxes (position, radius, gridSize) {
        const aNeighborBoxes = [];
        if ((position.x - radius) >= 0) {
            aNeighborBoxes.push({ x: position.x - radius, y: position.y });
        }
        if ((position.y - radius) >= 0) {
            aNeighborBoxes.push({ x: position.x, y: position.y - 1 });
        }
        if ((position.x + radius) < gridSize) {
            aNeighborBoxes.push({ x: position.x + radius, y: position.y });
        }
        if ((position.y + radius) < gridSize) {
            aNeighborBoxes.push({ x: position.x, y: position.y + radius });
        }
        return aNeighborBoxes;
    }

    constructor (oAppConfiguration) {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        this.appConfiguration = oAppConfiguration;

        this.appBox;

        this.spaceTimeController;

        this.timerIntervalId = 0;
        this.isTimerRunning = false;
        this.timeFwdButton;

        this.audioOn = false;
        this.settingsVisible = false;
        this.chirp = new Audio(this.appConfiguration.hoverSound);
        this.chirp.load();

        const oControlParent = document.getElementsByClassName('navigation')[0];

        const oVolumeControlButton = createButton('volumeControlButton', '', oControlParent);
        this.volumeIcon = document.createElement('img');
        this.volumeIcon.src = this.appConfiguration.volumeIcon.off;
        oVolumeControlButton.classList.add('controlButton');
        oVolumeControlButton.onclick = this.toggleAudio.bind(this);
        oVolumeControlButton.appendChild(this.volumeIcon);

        const oSettingsControlButton = createButton('settingsControlButton', '', oControlParent);
        this.settingsIcon = document.createElement('img');
        this.settingsIcon.src = this.appConfiguration.settingsIcon;
        oSettingsControlButton.classList.add('controlButton');
        oSettingsControlButton.onclick = this.toggleSettings.bind(this);
        oSettingsControlButton.appendChild(this.settingsIcon);

        this.trails = {};
    }

    toggleSettings () {
        this.settingsVisible = !this.settingsVisible;
        if (this.settingsVisible) {
            this.buttonBar.classList.add('visible');
        } else {
            this.buttonBar.classList.remove('visible');
        }
    }

    toggleAudio () {
        this.audioOn = !this.audioOn;
        if (this.audioOn) {
            this.volumeIcon.src = this.appConfiguration.volumeIcon.on;
            this.chirp.play();
        } else {
            this.volumeIcon.src = this.appConfiguration.volumeIcon.off;
        }
    }

    startTimer () {
        this.isTimerRunning = true;
        this.timerIntervalId = window.setInterval(this.moveTimeForward.bind(this), TIMER_INTERVAL);
        this.timeFwdButton.innerText = '||';
    }

    stopTimer () {
        window.clearInterval(this.timerIntervalId);
        this.isTimerRunning = false;
        this.timeFwdButton.innerText = '>';
    }

    createBody (time, x, y) {
        const sBodyKey = `${time}:${x}:${y}`;
        const oPosition = { x: x, y: y };
        this.initializeTrail(sBodyKey, oPosition);
        return createBody(time, x, y);
    }

    handleSpaceClick (event) {
        const oTarget = event.currentTarget;
        let sId = oTarget.id;
        let oCoordinates = SpaceTimeView.getXYFromID(sId);
        let oBody = this.spaceTimeController.getBodyAt(oCoordinates.x, oCoordinates.y);
        if (oBody) {
            oBody.mass++;
        } else {
            oBody = this.createBody(this.spaceTimeController.getTime(), oCoordinates.x, oCoordinates.y);
        }

        let bIsPenDown = true;
        if (oBody.mass < 16) {
            this.spaceTimeController.updateBodyAt(oCoordinates.x, oCoordinates.y, oBody);
        } else {
            this.spaceTimeController.deleteBodyAt(oCoordinates.x, oCoordinates.y);
            oBody = null;
            bIsPenDown = false;
        }
        const nMass = oBody ? oBody.mass : 0;
        this.drawBody(oCoordinates, bIsPenDown, nMass, this.appConfiguration.gridSize);
        if (!this.isTimerRunning) {
            this.startTimer.call(this);
        }
    }

    moveTimeForward () {
        const bIsPenDown = false;
        this.drawSpace(bIsPenDown);

        if (this.spaceTimeController.isModelSizeAcceptable()) {
            this.spaceTimeController.incrementTime();
            this.oTimeBackButton.disabled = false;
        } else {
            this.timeFwdButton.disabled = true;
        }

        this.drawSpace();
    }

    moveTimeBackward () {
        const bIsPenDown = false;
        this.drawSpace(bIsPenDown);

        if (this.spaceTimeController.getTime() === 0) {
            this.oTimeBackButton.disabled = true;
        } else {
            this.spaceTimeController.incrementTime(-1);
            this.timeFwdButton.disabled = false;
        }
        this.drawSpace();
    }

    handleTimeFwdButtonClick () {
        this.stopTimer.call(this);
        this.moveTimeForward.call(this);
    }

    handleTimeBackButtonClick () {
        this.stopTimer.call(this);
        this.moveTimeBackward.call(this);
    }

    eraseBox (position) {
        const oTarget = document.getElementById(`${position.x}:${position.y}`);
        oTarget.classList.remove(CSS_CLASS_BODY_BOX);
        oTarget.classList.remove(CSS_CLASS_TRAIL_BOX);
    }

    initializeTrail (sKey, position) {
        if (!this.trails[sKey]) {
            if (position) {
                this.trails[sKey] = [];
                let i;
                for (i = 0; i < TRAIL_LENGTH; i++) {
                    this.trails[sKey].push(position);
                }
            }
        }
    }

    moveTrail (sKey, newPosition) {
        if (this.trails[sKey]) {
            if (newPosition) {
                let i;
                for (i = this.trails[sKey].length - 1; i > 0; i--) {
                    this.trails[sKey][i] = this.trails[sKey][i - 1];
                }
                this.trails[sKey][0] = newPosition;
            }
        }
    }

    trimTrail (sKey) {
        if (this.trails[sKey]) {
            if (this.trails[sKey].length === 1) {
                delete this.trails[sKey];
            } else {
                this.trails[sKey].shift();
            }
        }
    }

    drawTrail (sKey) {
        let aTrail = this.trails[sKey];
        let i;
        for (i = 1; i < aTrail.length - 1; i++) {
            let position = aTrail[i];
            let oTarget = document.getElementById(`${position.x}:${position.y}`);
            oTarget.classList.add(CSS_CLASS_BODY_BOX);
            oTarget.classList.add(CSS_CLASS_TRAIL_BOX);
        }
    }

    drawBody (position, isPenDown, mass = 0, gridSize) {
        const floorPosition = {
            x: Math.floor(position.x),
            y: Math.floor(position.y)
        };
        const oNewTarget = document.getElementById(`${floorPosition.x}:${floorPosition.y}`);
        SpaceTimeView.incrementMass(oNewTarget, mass);
        if (isPenDown) {
            oNewTarget.classList.add(CSS_CLASS_BODY_BOX);
        } else {
            SpaceTimeView.eraseBody(oNewTarget, mass);
        }
        SpaceTimeView.drawSparkle(floorPosition, isPenDown, gridSize);
    }

    drawSpace (isPenDown = true) {
        if (this.trails) {
            Object.keys(this.trails).forEach(sKey => {
                let aTrail = this.trails[sKey];
                if (isPenDown) {
                    this.drawTrail(sKey);
                } else {
                    this.eraseBox(aTrail[aTrail.length - 1]);
                }
                if (!this.spaceTimeController.getBodyWithId(sKey)) {
                    this.trimTrail(sKey);
                }
            });
        }
        const aBodies = this.spaceTimeController.getBodies();
        aBodies.forEach(oBody => {
            const floorPosition = {
                x: Math.floor(oBody.position.x),
                y: Math.floor(oBody.position.y)
            };
            if (floorPosition.x > 0 && floorPosition.x < this.appConfiguration.gridSize && floorPosition.y > 0 && floorPosition.y < this.appConfiguration.gridSize) {
                this.drawBody(floorPosition, isPenDown, oBody.mass, this.appConfiguration.gridSize);
                this.moveTrail(oBody.id, floorPosition);
            }
        });
    }

    makeAppBox () {
        this.appBox = document.getElementById('app');
        if (!this.appBox) {
            const oContainer = document.getElementById('container');
            let oParentElement = document.getElementsByTagName('body');
            if (oContainer) {
                oParentElement = oContainer;
            }
            this.appBox = createDiv('app', oParentElement);
        }
    }

    playChirp () {
        if (this.audioOn) {
            this.chirp.play();
        }
    }

    makeSpaceGrid (numberOfRows, oSpaceTimeController) {
        this.spaceTimeController = oSpaceTimeController;
        this.appConfiguration.gridSize = numberOfRows;
        let nSizeOfBox = Math.floor(720 / this.appConfiguration.gridSize);

        let numberOfColumns = numberOfRows;

        let y = numberOfRows - 1;
        let x = 0;
        this.makeAppBox();
        let spaceTimeBox = document.getElementById('spaceTime');
        if (!spaceTimeBox) {
            spaceTimeBox = createDiv('spaceTime', this.appBox);
        }
        let rowBox;

        let sBoxId = '';
        let box = null;
        while (y >= 0) {
            x = 0;
            rowBox = document.getElementById(`row${y}`);
            if (!rowBox) {
                rowBox = createDiv(`row${y}`, spaceTimeBox);
            }
            while (x < numberOfColumns) {
                sBoxId = `${x}:${y}`;
                box = document.getElementById(sBoxId);
                if (!box) {
                    box = createDiv(sBoxId, rowBox);
                }
                box.onclick = this.handleSpaceClick.bind(this);
                box.style.height = nSizeOfBox;
                box.style.width = nSizeOfBox;
                box.onmouseenter = this.playChirp.bind(this);
                x = x + 1;
            }

            y = y - 1;
        }
    }

    makeTimeFwdButton (parentBox) {
        this.timeFwdButton = createButton('timeFwdButton', '>', parentBox);
        this.timeFwdButton.onclick = this.handleTimeFwdButtonClick.bind(this);
    }

    makeTimeBackButton (parentBox) {
        this.oTimeBackButton = createButton('timeBackButton', '<', parentBox);
        this.oTimeBackButton.onclick = this.handleTimeBackButtonClick.bind(this);
        this.oTimeBackButton.disabled = true;
    }

    makeSpaceTimeButtonBar () {
        this.buttonBar = createDiv('buttonBar', this.appBox);

        this.makeTimeBackButton(this.buttonBar);
        this.makeTimeFwdButton(this.buttonBar);
    }

    handleKeyDown (event) {
        const keyCode = event.keyCode;
        if (keyCode === 37) {
            this.moveTimeBackward();
        } else if (keyCode === 39) {
            this.stopTimer.call(this);
            this.moveTimeForward.call(this);
        }
    }
}

export { SpaceTimeView };