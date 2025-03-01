import { createBody } from './gravity.mjs';
import { createDiv, createButton } from './learnhypertext.mjs';

const TIMER_INTERVAL = 70;
const CSS_CLASS_BODY_BOX = 'bodyBox';
const CSS_CLASS_NEIGHBOR_BOX = 'neighborBox';
const CSS_CLASS_TRAIL_BOX = 'trailBox';
const TRAIL_LENGTH = 16;
const E_BODY_TYPES = {
    STAR: 'star',
    SPACESHIP: 'spaceship'
}

class SpaceTimeView {
    static getXYFromID(sId) {
        let nYindex = sId.indexOf('y');
        let sX = sId.substring(1, nYindex);
        let sY = sId.substring(nYindex + 1);
        return {
            x: Number(sX),
            y: Number(sY)
        };
    }

    static getIDFromXY(x, y) {
        return `x${x}y${y}`;
    }

    static modulo(n, d) {
        return ((n % d) + d) % d;
    }

    static eraseBody(target, mass) {
        const sSanitizedMassId = (mass + '').replace('.', '_');
        target.classList.remove(`m${sSanitizedMassId}`);
        target.classList.remove(CSS_CLASS_BODY_BOX);
    }

    static drawBodyWithMass(target, mass) {
        const nPreviousMass = SpaceTimeView.modulo((mass - 1), 16);
        const sSanitizedMassId = (mass + '').replace('.', '_');
        target.classList.remove(`m${nPreviousMass}`);
        target.classList.add(`m${sSanitizedMassId}`);
    }

    static addBoxAfterRotation(boxes, rotatedX, rotatedY, gridSize) {
        if (Math.floor(rotatedX) >= 0 && Math.floor(rotatedY) >= 0 && Math.floor(rotatedX) < gridSize && Math.floor(rotatedY) < gridSize) {
            boxes.push({ x: Math.floor(rotatedX), y: Math.floor(rotatedY) });
        }
    }

    static erasePixels(pixels) {
        while (pixels.length > 0) {
            const pixelElementID = pixels.pop();
            let target = document.getElementById(pixelElementID);
            if (target) {
                target.classList.remove(CSS_CLASS_NEIGHBOR_BOX);
            }
        }
    }

    static drawSpaceshipWings(position, isPenDown, orientationTick, currentPixels, gridSize) {
        const aNeighborBoxes = [];
        const radOrientationAngle = 2 * Math.PI / 12 * orientationTick;
        const rotatedComponentX = Math.cos(radOrientationAngle);
        const rotatedComponentY = Math.sin(radOrientationAngle);
        SpaceTimeView.addBoxAfterRotation(aNeighborBoxes, position.x + rotatedComponentX, position.y + rotatedComponentY, gridSize);
        SpaceTimeView.addBoxAfterRotation(aNeighborBoxes, position.x - 1 - rotatedComponentX, position.y - rotatedComponentY, gridSize);
        // SpaceTimeView.addBoxAfterRotation(aNeighborBoxes, position.x - rotatedComponentX, position.y - rotatedComponentY, gridSize);
        // SpaceTimeView.addBoxAfterRotation(aNeighborBoxes, position.x + 1 - rotatedComponentX, position.y - rotatedComponentY, gridSize);
        if (isPenDown) {
            aNeighborBoxes.forEach(neighborBoxPosition => {
                const sElementID = SpaceTimeView.getIDFromXY(neighborBoxPosition.x, neighborBoxPosition.y);
                let target = document.getElementById(sElementID);
                target.classList.add(CSS_CLASS_NEIGHBOR_BOX);
                currentPixels.push(sElementID);
            });
        } else {
            SpaceTimeView.erasePixels(currentPixels);
        }
    }

    static drawSparkle(position, isPenDown, gridSize) {
        const aNeighborBoxes = SpaceTimeView.getNeighborBoxes(position, 1, gridSize);
        aNeighborBoxes.forEach(neighborBoxPosition => {
            const sElementID = SpaceTimeView.getIDFromXY(neighborBoxPosition.x, neighborBoxPosition.y);
            let target = document.getElementById(sElementID);
            if (isPenDown) {
                target.classList.add(CSS_CLASS_NEIGHBOR_BOX);
            } else {
                target.classList.remove(CSS_CLASS_NEIGHBOR_BOX);
            }
        });
    }

    static getNeighborBoxes(position, radius, gridSize) {
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

    constructor(oAppConfiguration) {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        this.appConfiguration = oAppConfiguration;

        this.appBox;

        this.spaceTimeController;

        this.timerIntervalId = 0;
        this.isTimerRunning = false;
        this.timeFwdButton;

        this.spaceship = {
            orientationTick: 0,
            pixels: []
        };

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

    toggleSettings() {
        this.settingsVisible = !this.settingsVisible;
        if (this.settingsVisible) {
            this.buttonBar.classList.add('visible');
        } else {
            this.buttonBar.classList.remove('visible');
        }
    }

    toggleAudio() {
        this.audioOn = !this.audioOn;
        if (this.audioOn) {
            this.volumeIcon.src = this.appConfiguration.volumeIcon.on;
            this.chirp.play();
        } else {
            this.volumeIcon.src = this.appConfiguration.volumeIcon.off;
        }
    }

    startTimer() {
        this.isTimerRunning = true;
        this.timerIntervalId = window.setInterval(this.moveTimeForward.bind(this), TIMER_INTERVAL);
        this.timeFwdButton.innerText = '||';
    }

    stopTimer() {
        window.clearInterval(this.timerIntervalId);
        this.isTimerRunning = false;
        this.timeFwdButton.innerText = '>';
    }

    createBody(time, x, y) {
        const sBodyKey = `${time}:${x}:${y}`;
        const oPosition = { x: x, y: y };
        this.initializeTrail(sBodyKey, oPosition);
        return createBody(time, x, y);
    }

    createSpaceship(x, y) {
        const oSpaceship = createBody(0, x, y);
        const nMass = 0.1;
        const bIsPenDown = true;
        oSpaceship.mass = nMass;
        this.spaceTimeController.updateBodyAt(x, y, oSpaceship);
        this.drawBody({ x: x, y: y }, E_BODY_TYPES.SPACESHIP, bIsPenDown, nMass, this.appConfiguration.gridSize);
        return oSpaceship;
    }

    handleSpaceClick(event) {
        const oTarget = event.currentTarget;
        let sId = oTarget.id;
        let oCoordinates = SpaceTimeView.getXYFromID(sId);
        let oBody1 = this.spaceTimeController.getBodyAt(oCoordinates.x, oCoordinates.y);
        if (oBody1) {
            oBody1.mass++;
        } else {
            oBody1 = this.createBody(this.spaceTimeController.getTime(), oCoordinates.x, oCoordinates.y);
        }

        let bIsPenDown = true;
        if (oBody1.mass < 16) {
            this.spaceTimeController.updateBodyAt(oCoordinates.x, oCoordinates.y, oBody1);
        } else {
            this.spaceTimeController.deleteBodyAt(oCoordinates.x, oCoordinates.y);
            oBody1 = null;
            bIsPenDown = false;
        }
        const nMass = oBody1 ? oBody1.mass : 0;
        this.drawBody(oCoordinates, E_BODY_TYPES.STAR, bIsPenDown, nMass, this.appConfiguration.gridSize);
        if (!this.isTimerRunning) {
            this.startTimer.call(this);
        }
    }

    moveTimeForward() {
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

    moveTimeBackward() {
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

    handleTimeFwdButtonClick() {
        this.stopTimer.call(this);
        this.moveTimeForward.call(this);
    }

    handleTimeBackButtonClick() {
        this.stopTimer.call(this);
        this.moveTimeBackward.call(this);
    }

    eraseBox(position) {
        const sElementID = SpaceTimeView.getIDFromXY(position.x, position.y);
        const oTarget = document.getElementById(sElementID);
        oTarget.classList.remove(CSS_CLASS_BODY_BOX);
        oTarget.classList.remove(CSS_CLASS_TRAIL_BOX);
    }

    initializeTrail(sKey, position) {
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

    moveTrail(sKey, newPosition) {
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

    trimTrail(sKey) {
        if (this.trails[sKey]) {
            if (this.trails[sKey].length === 1) {
                delete this.trails[sKey];
            } else {
                this.trails[sKey].shift();
            }
        }
    }

    drawTrail(sKey) {
        let aTrail = this.trails[sKey];
        let i;
        for (i = 1; i < aTrail.length - 1; i++) {
            let position = aTrail[i];
            const sElementID = SpaceTimeView.getIDFromXY(position.x, position.y);
            let oTarget = document.getElementById(sElementID);
            oTarget.classList.add(CSS_CLASS_BODY_BOX);
            oTarget.classList.add(CSS_CLASS_TRAIL_BOX);
        }
    }

    drawBody(position, eType = E_BODY_TYPES.STAR, isPenDown, mass = 0, gridSize) {
        const floorPosition = {
            x: Math.floor(position.x),
            y: Math.floor(position.y)
        };
        const sElementID = SpaceTimeView.getIDFromXY(floorPosition.x, floorPosition.y);
        const oNewTarget = document.getElementById(sElementID);
        SpaceTimeView.drawBodyWithMass(oNewTarget, mass);
        if (isPenDown) {
            oNewTarget.classList.add(CSS_CLASS_BODY_BOX);
        } else {
            SpaceTimeView.eraseBody(oNewTarget, mass);
        }
        switch (eType) {
            case E_BODY_TYPES.SPACESHIP:
                SpaceTimeView.drawSpaceshipWings(floorPosition, isPenDown, this.spaceship.orientationTick, this.spaceship.pixels, gridSize);
                break;
            case E_BODY_TYPES.STAR:
            default:
                SpaceTimeView.drawSparkle(floorPosition, isPenDown, gridSize);
                break;
        }
    }

    drawSpace(isPenDown = true) {
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
            const sBodyType = oBody.id === '0:45:45' ? E_BODY_TYPES.SPACESHIP : E_BODY_TYPES.STAR;
            if (floorPosition.x > 0 && floorPosition.x < this.appConfiguration.gridSize && floorPosition.y > 0 && floorPosition.y < this.appConfiguration.gridSize) {
                this.drawBody(floorPosition, sBodyType, isPenDown, oBody.mass, this.appConfiguration.gridSize);
                this.moveTrail(oBody.id, floorPosition);
            }
        });
    }

    makeAppBox() {
        this.appBox = document.getElementById('app');
        if (!this.appBox) {
            const oContainer = document.getElementById('container');
            let oParentElement = document.body;
            if (oContainer) {
                oParentElement = oContainer;
            }
            this.appBox = createDiv('app', oParentElement);
        }
    }

    playChirp() {
        if (this.audioOn) {
            this.chirp.play();
        }
    }

    makeSpaceGrid(oSpaceTimeController) {
        this.spaceTimeController = oSpaceTimeController;
        let numberOfRows = this.appConfiguration.gridSize;

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
                sBoxId = SpaceTimeView.getIDFromXY(x, y);
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
        const nSpaceshipX = Math.floor(numberOfColumns / 2);
        const nSpaceshipY = Math.floor(numberOfRows / 2);
        this.createSpaceship(nSpaceshipX, nSpaceshipY);
    }

    makeTimeFwdButton(parentBox) {
        this.timeFwdButton = createButton('timeFwdButton', '>', parentBox);
        this.timeFwdButton.onclick = this.handleTimeFwdButtonClick.bind(this);
    }

    makeTimeBackButton(parentBox) {
        this.oTimeBackButton = createButton('timeBackButton', '<', parentBox);
        this.oTimeBackButton.onclick = this.handleTimeBackButtonClick.bind(this);
        this.oTimeBackButton.disabled = true;
    }

    makeSpaceTimeButtonBar() {
        this.buttonBar = createDiv('buttonBar', this.appBox);

        this.makeTimeBackButton(this.buttonBar);
        this.makeTimeFwdButton(this.buttonBar);
    }

    handleKeyDown(event) {
        const keyCode = event.keyCode;
        if (keyCode === 66) {
            this.moveTimeBackward();
        } else if (keyCode === 70) {
            this.stopTimer.call(this);
            this.moveTimeForward.call(this);
        } else if (keyCode === 37) {
            this.spaceship.orientationTick = SpaceTimeView.modulo((this.spaceship.orientationTick - 1), 12);
        } else if (keyCode === 39) {
            this.spaceship.orientationTick = SpaceTimeView.modulo((this.spaceship.orientationTick + 1), 12);
        }
    }
}

export { SpaceTimeView };