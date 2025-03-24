import { addVectors, createBody } from './gravity.mjs';
import { createDiv, createButton, createParagraph } from './learnhypertext.mjs';

const TIMER_INTERVAL = 70;
const TIMER_INTERVAL_THRUST = 1000;
const TIMER_INTERVAL_MOVE_PHASER = 70;
const TIMER_INTERVAL_CLEAR_PHASER = 4000;
const CSS_CLASS_ROW_ELEMENT = 'rowElement';
const CSS_CLASS_BODY_ELEMENT = 'bodyElement';
const CSS_CLASS_SPARKLE_ELEMENT = 'sparkleElement';
const CSS_CLASS_TRAIL_ELEMENT = 'trailElement';
const CSS_CLASS_THRUST_ELEMENT = 'thrustElement';
const CSS_CLASS_PHASER_ELEMENT = 'phaserElement';
const TRAIL_LENGTH = 16;
const SPACESHIP_THRUST_FORCE = 0.001;
const SPACESHIP_PHASER_DISTANCE_PER_TICK = 3;
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

    static eraseBody(element, mass) {
        const sSanitizedMassId = (mass + '').replace('.', '_');
        element.classList.remove(`m${sSanitizedMassId}`);
        element.classList.remove(CSS_CLASS_BODY_ELEMENT);
    }

    static drawBodyWithMass(element, mass) {
        element.classList.add(CSS_CLASS_BODY_ELEMENT);
        const nPreviousMass = SpaceTimeView.modulo((mass - 1), 16);
        const sSanitizedMassId = (mass + '').replace('.', '_');
        element.classList.remove(`m${nPreviousMass}`);
        element.classList.add(`m${sSanitizedMassId}`);
    }

    static validateAndAddPixel(pixels, x, y, gridSize) {
        if (Math.round(x) >= 0 && Math.round(y) >= 0 && Math.round(x) < gridSize && Math.round(y) < gridSize) {
            pixels.push({ x: Math.round(x), y: Math.round(y) });
        }
    }

    static drawSpaceshipWingPixels(pixels, currentElementIDs) {
        pixels.forEach(pixel => {
            const sElementID = SpaceTimeView.getIDFromXY(pixel.x, pixel.y);
            let element = document.getElementById(sElementID);
            element.classList.add(CSS_CLASS_SPARKLE_ELEMENT);
            currentElementIDs.push(sElementID);
        });
    }

    static eraseSpaceshipWingPixels(currentElementIDs) {
        while (currentElementIDs.length > 0) {
            const sElementID = currentElementIDs.pop();
            let element = document.getElementById(sElementID);
            if (element) {
                element.classList.remove(CSS_CLASS_SPARKLE_ELEMENT);
            }
        }
    }

    static drawSpaceshipWings(position, isPenDown, orientationTick, currentElementIDs, gridSize) {
        const pixels = [];
        const radOrientationAngle = 2 * Math.PI / 12 * orientationTick;
        const xoffset = Math.cos(radOrientationAngle);
        const yoffset = Math.sin(radOrientationAngle);
        SpaceTimeView.validateAndAddPixel(pixels, position.x - xoffset, position.y + yoffset, gridSize);
        if (isPenDown) {
            SpaceTimeView.drawSpaceshipWingPixels(pixels, currentElementIDs);
        } else {
            SpaceTimeView.eraseSpaceshipWingPixels(currentElementIDs);
        }
    }

    static drawSpaceshipThrust(position, orientationTick, currentElementIDs, gridSize) {
        const pixels = [];
        const radOrientationAngle = 2 * Math.PI / 12 * orientationTick;
        const xoffset = Math.cos(radOrientationAngle);
        const yoffset = Math.sin(radOrientationAngle);
        SpaceTimeView.validateAndAddPixel(pixels, position.x - 3 * xoffset, position.y + 3 * yoffset, gridSize);
        pixels.forEach(pixel => {
            const sElementID = SpaceTimeView.getIDFromXY(pixel.x, pixel.y);
            let element = document.getElementById(sElementID);
            element.classList.add(CSS_CLASS_THRUST_ELEMENT);
            currentElementIDs.push(sElementID);
        });
    }

    static eraseSpaceshipThrust(currentElementIDs) {
        while (currentElementIDs.length > 0) {
            const sElementID = currentElementIDs.pop();
            let element = document.getElementById(sElementID);
            if (element) {
                element.classList.remove(CSS_CLASS_THRUST_ELEMENT);
            }
        }
    }

    static drawSpaceshipPhaser(position, distance, orientationTick, currentElementIDs, gridSize) {
        const pixels = [];
        const radOrientationAngle = 2 * Math.PI / 12 * orientationTick;
        const xoffset = Math.cos(radOrientationAngle);
        const yoffset = Math.sin(radOrientationAngle);
        SpaceTimeView.validateAndAddPixel(pixels, position.x + distance * xoffset, position.y - distance * yoffset, gridSize);
        pixels.forEach(pixel => {
            const sElementID = SpaceTimeView.getIDFromXY(pixel.x, pixel.y);
            let element = document.getElementById(sElementID);
            element.classList.add(CSS_CLASS_PHASER_ELEMENT);
            if (currentElementIDs.indexOf(sElementID) < 0) {
                currentElementIDs.push(sElementID);
            }
        });
    }

    static eraseSpaceshipPhaser(currentElementIDs) {
        while (currentElementIDs.length > 0) {
            const sElementID = currentElementIDs.pop();
            let element = document.getElementById(sElementID);
            if (element) {
                element.classList.remove(CSS_CLASS_PHASER_ELEMENT);
            }
        }
    }

    static clearSpaceshipPhaser(clearPhaserInterval, pixels) {
        window.clearInterval(clearPhaserInterval);
        SpaceTimeView.eraseSpaceshipPhaser(pixels);
    }

    static drawSparkle(position, isPenDown, gridSize) {
        const pixels = SpaceTimeView.getSparklePixels(position, 1, gridSize);
        pixels.forEach(pixel => {
            const sElementID = SpaceTimeView.getIDFromXY(pixel.x, pixel.y);
            let element = document.getElementById(sElementID);
            if (isPenDown) {
                element.classList.add(CSS_CLASS_SPARKLE_ELEMENT);
            } else {
                element.classList.remove(CSS_CLASS_SPARKLE_ELEMENT);
            }
        });
    }

    static getSparklePixels(position, radius, gridSize) {
        const pixels = [];
        SpaceTimeView.validateAndAddPixel(pixels, position.x - radius, position.y, gridSize);
        SpaceTimeView.validateAndAddPixel(pixels, position.x, position.y - radius, gridSize);
        SpaceTimeView.validateAndAddPixel(pixels, position.x + radius, position.y, gridSize);
        SpaceTimeView.validateAndAddPixel(pixels, position.x, position.y + radius, gridSize);
        return pixels;
    }

    constructor(oAppConfiguration) {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        this.appConfiguration = oAppConfiguration;

        this.appElement;

        this.spaceTimeController;

        this.timerIntervalId = 0;
        this.isTimerRunning = false;
        this.timeFwdButton;

        this.thrustTimerTimeoutId = 1;
        this.phaserTimerTimeoutId = 2;
        this.phaserIntervalId = 3;

        this.spaceship = {
            orientationTick: 0,
            pixels: [],
            thrustPixels: [],
            phaserDistance: -1,
            phaserPixels: []
        };

        this.audioOn = false;
        this.settingsVisible = false;
        this.chirp = new Audio(this.appConfiguration.getResource('hoverSound'));
        this.chirp.load();

        const oControlParent = document.getElementsByClassName('navigation')[0];

        const oVolumeControlButton = createButton('volumeControlButton', '', oControlParent);
        this.volumeIcon = document.createElement('img');
        this.volumeIcon.src = this.appConfiguration.getResource('volumeIconOff');
        oVolumeControlButton.classList.add('controlButton');
        oVolumeControlButton.onclick = this.toggleAudio.bind(this);
        oVolumeControlButton.appendChild(this.volumeIcon);

        const oSettingsControlButton = createButton('settingsControlButton', '', oControlParent);
        this.settingsIcon = document.createElement('img');
        this.settingsIcon.src = this.appConfiguration.getResource('settingsIcon');
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
            this.volumeIcon.src = this.appConfiguration.getResource('volumeIconOn');
            this.chirp.play();
        } else {
            this.volumeIcon.src = this.appConfiguration.getResource('volumeIconOff');
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

    drawOnSpaceAtElementId(sBoxId) {
        let oCoordinates = SpaceTimeView.getXYFromID(sBoxId);
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

    handleSpaceClick(event) {
        const element = event.currentTarget;
        let sElementId = element.id;
        this.drawOnSpaceAtElementId(sElementId);
    }

    spaceshipThrust(nForce = SPACESHIP_THRUST_FORCE) {
        const radOrientationAngle = -2 * Math.PI * this.spaceship.orientationTick / 12;
        const thrustVector = {
            force: nForce,
            angle: radOrientationAngle
        };
        const oSpaceship = this.spaceTimeController.getSpaceship();
        const spaceshipVector = oSpaceship ? {
            force: oSpaceship.force,
            angle: oSpaceship.angle
        } : {
            force: 0,
            angle: 0
        };
        const resultantVector = addVectors(spaceshipVector, thrustVector);
        oSpaceship.force = resultantVector.magnitude;
        oSpaceship.angle = resultantVector.angle;
        this.spaceTimeController.updateSpaceship(oSpaceship);
        const floorPosition = {
            x: Math.floor(oSpaceship.position.x),
            y: Math.floor(oSpaceship.position.y)
        };
        SpaceTimeView.drawSpaceshipThrust(floorPosition, this.spaceship.orientationTick, this.spaceship.thrustPixels, this.appConfiguration.gridSize);
        this.thrustTimerTimeoutId = window.setTimeout(SpaceTimeView.eraseSpaceshipThrust, TIMER_INTERVAL_THRUST, this.spaceship.thrustPixels);
    };

    drawSpaceshipPhaser(spaceshipPosition, spaceshipOrientationTick) {
        SpaceTimeView.eraseSpaceshipPhaser(this.spaceship.phaserPixels);
        this.spaceship.phaserDistance = this.spaceship.phaserDistance + SPACESHIP_PHASER_DISTANCE_PER_TICK;
        SpaceTimeView.drawSpaceshipPhaser(spaceshipPosition, this.spaceship.phaserDistance, spaceshipOrientationTick, this.spaceship.phaserPixels, this.appConfiguration.gridSize);
    }

    spaceshipPhaser() {
        const oSpaceship = this.spaceTimeController.getSpaceship();
        const spaceshipPosition = {
            x: Math.floor(oSpaceship.position.x),
            y: Math.floor(oSpaceship.position.y)
        };
        this.spaceship.phaserDistance = -1;
        SpaceTimeView.clearSpaceshipPhaser(this.phaserIntervalId, this.spaceship.phaserPixels);
        this.phaserIntervalId = window.setInterval(this.drawSpaceshipPhaser.bind(this), TIMER_INTERVAL_MOVE_PHASER, spaceshipPosition, this.spaceship.orientationTick);
        this.clearPhaserTimerTimeoutId = window.setTimeout(SpaceTimeView.clearSpaceshipPhaser, TIMER_INTERVAL_CLEAR_PHASER, this.phaserIntervalId, this.spaceship.phaserPixels);
    };

    spaceshipTurnRightClockwise() {
        this.spaceship.orientationTick = SpaceTimeView.modulo((this.spaceship.orientationTick - 1), 12);
    }

    spaceshipTurnLeftCounterclockwise() {
        this.spaceship.orientationTick = SpaceTimeView.modulo((this.spaceship.orientationTick + 1), 12);
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
        const element = document.getElementById(sElementID);
        element.classList.remove(CSS_CLASS_BODY_ELEMENT);
        element.classList.remove(CSS_CLASS_TRAIL_ELEMENT);
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
            let element = document.getElementById(sElementID);
            element.classList.add(CSS_CLASS_BODY_ELEMENT);
            element.classList.add(CSS_CLASS_TRAIL_ELEMENT);
        }
    }

    drawBody(position, eType = E_BODY_TYPES.STAR, isPenDown, mass = 0, gridSize) {
        const floorPosition = {
            x: Math.floor(position.x),
            y: Math.floor(position.y)
        };
        const sElementID = SpaceTimeView.getIDFromXY(floorPosition.x, floorPosition.y);
        const oNewTarget = document.getElementById(sElementID);
        if (isPenDown) {
            SpaceTimeView.drawBodyWithMass(oNewTarget, mass);
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
        this.appElement = document.getElementById('app');
        if (!this.appElement) {
            const oContainer = document.getElementById('container');
            let oParentElement = document.body;
            if (oContainer) {
                oParentElement = oContainer;
            }
            this.appElement = createDiv('app', oParentElement);
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
        let numberOfColumns = numberOfRows;

        let y = 0;
        let x = 0;
        this.makeAppBox();
        let spaceTimeBox = document.getElementById('spaceTime');
        if (!spaceTimeBox) {
            spaceTimeBox = createDiv('spaceTime', this.appElement);
        }
        let row;

        let sElementID = '';
        let pixel = null;
        while (y < numberOfRows) {
            x = 0;
            row = document.getElementById(`row${y}`);
            if (!row) {
                row = createDiv(`row${y}`, spaceTimeBox);
                row.classList.add(CSS_CLASS_ROW_ELEMENT);
            }
            while (x < numberOfColumns) {
                sElementID = SpaceTimeView.getIDFromXY(x, y);
                pixel = document.getElementById(sElementID);
                if (!pixel) {
                    pixel = createDiv(sElementID, row);
                }
                pixel.onclick = this.handleSpaceClick.bind(this);
                pixel.onmouseenter = this.playChirp.bind(this);
                x = x + 1;
            }

            y = y + 1;
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

    makeSpaceshipTurnLeftButton(parentBox) {
        this.spaceshipTurnLeftButton = createButton('spaceshipTurnLeftButton', '', parentBox);
        const oTurnLeftIcon = document.createElement('img');
        oTurnLeftIcon.src = this.appConfiguration.getResource('turnLeftIcon');
        this.spaceshipTurnLeftButton.appendChild(oTurnLeftIcon);
        createParagraph('leftLabel', '', this.spaceshipTurnLeftButton);
        this.spaceshipTurnLeftButton.onclick = this.spaceshipTurnLeftCounterclockwise.bind(this);
    }

    makeSpaceshipThrustButton(parentBox) {
        this.spaceshipThrustButton = createButton('spaceshipThrustButton', '', parentBox);
        const oThrustIcon = document.createElement('img');
        oThrustIcon.src = this.appConfiguration.getResource('thrustIcon');
        this.spaceshipThrustButton.appendChild(oThrustIcon);
        this.spaceshipThrustButton.onclick = this.spaceshipThrust.bind(this, SPACESHIP_THRUST_FORCE * 4);
    }

    makeSpaceshipPhaserButton(parentBox) {
        this.spaceshipPhaserButton = createButton('spaceshipPhaserButton', '', parentBox);
        const oPhaserIcon = document.createElement('img');
        oPhaserIcon.src = this.appConfiguration.getResource('phaserIcon');
        this.spaceshipPhaserButton.appendChild(oPhaserIcon);
        this.spaceshipPhaserButton.onclick = this.spaceshipPhaser.bind(this);
    }

    makeSpaceshipTurnRightButton(parentBox) {
        this.spaceshipTurnRightButton = createButton('spaceshipTurnRightButton', '', parentBox);
        const oTurnRightIcon = document.createElement('img');
        oTurnRightIcon.src = this.appConfiguration.getResource('turnRightIcon');
        this.spaceshipTurnRightButton.appendChild(oTurnRightIcon);
        this.spaceshipTurnRightButton.onclick = this.spaceshipTurnRightClockwise.bind(this);
    }

    makeSpaceTimeButtonBar() {
        this.buttonBar = createDiv('buttonBar', this.appElement);
        this.buttonBar.classList.add('visible');

        this.makeTimeBackButton(this.buttonBar);
        this.makeTimeFwdButton(this.buttonBar);
        this.makeSpaceshipPhaserButton(this.buttonBar);
        this.makeSpaceshipTurnLeftButton(this.buttonBar);
        this.makeSpaceshipThrustButton(this.buttonBar);
        this.makeSpaceshipTurnRightButton(this.buttonBar);
    }

    upArrowPressed() {
        this.spaceshipThrust();
    }

    zPressed() {
        this.spaceshipPhaser();
    }

    rightArrowPressed() {
        this.spaceshipTurnRightClockwise();
    }

    leftArrowPressed() {
        this.spaceshipTurnLeftCounterclockwise();
    }

    handleKeyDown(event) {
        const keyCode = event.keyCode;
        if (keyCode === 66) {
            this.moveTimeBackward();
        } else if (keyCode === 70) {
            this.stopTimer.call(this);
            this.moveTimeForward.call(this);
        } else if (keyCode === 38) {
            this.upArrowPressed();
            event.preventDefault();
        } else if (keyCode === 90) {
            this.zPressed();
            event.preventDefault();
        } else if (keyCode === 37) {
            this.leftArrowPressed();
            event.preventDefault();
        } else if (keyCode === 39) {
            this.rightArrowPressed();
            event.preventDefault();
        }
    }
}

export { SpaceTimeView };