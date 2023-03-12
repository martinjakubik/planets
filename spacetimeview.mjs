import { createBody } from './gravity.mjs';
import { createDiv, createButton } from './lib/js/learnhypertext.mjs';
import { SpaceTimeController } from './spacetimecontroller.mjs';

const DARKEST_COLOR = 0;
const LIGHTEST_COLOR = 255;
const CSS_RGB_BACKGROUND_COLOR = `rgb(${LIGHTEST_COLOR}, ${LIGHTEST_COLOR}, ${LIGHTEST_COLOR + 40})`;
const CSS_RGBA_SHINY_COLOR = `rgba(${DARKEST_COLOR}, ${DARKEST_COLOR}, ${DARKEST_COLOR}, 0.5)`;

class SpaceTimeView {
    static getXYFromID(sId) {
        let aCoordinates = sId.split(':');
        let sX = aCoordinates[0];
        let sY = aCoordinates[1];
        return {
            x: Number(sX),
            y: Number(sY)
        };
    };

    static getMassColor(mass) {
        return LIGHTEST_COLOR - mass * 16 + 1;
    };

    static getCssMassColor(body) {
        let sMassColor = DARKEST_COLOR;
        if (body && body.mass) {
            sMassColor = SpaceTimeView.getMassColor(body.mass);
            return `rgb(${sMassColor}, ${sMassColor}, ${sMassColor})`;
        }
        return CSS_RGB_BACKGROUND_COLOR;
    };

    static getCssShineColor(pen) {
        if (pen === CSS_RGB_BACKGROUND_COLOR) {
            return CSS_RGB_BACKGROUND_COLOR;
        }
        return CSS_RGBA_SHINY_COLOR;
    };

    static drawBody(position, pen, gridSize) {
        const floorPosition = {
            x: Math.floor(position.x),
            y: Math.floor(position.y)
        };
        const oNewTarget = document.getElementById(`${floorPosition.x}:${floorPosition.y}`);
        oNewTarget.style.backgroundColor = pen;
        SpaceTimeView.drawShininess(floorPosition, SpaceTimeView.getCssShineColor(pen), gridSize);
    };

    static drawShininess(position, pen, gridSize) {
        const aNeighborBoxes = SpaceTimeView.getNeighborBoxes(position, 1, gridSize);
        aNeighborBoxes.forEach(neighborBoxPosition => {
            let target = document.getElementById(`${neighborBoxPosition.x}:${neighborBoxPosition.y}`);
            target.style.border = `1px solid ${pen}`;
            target.style.boxSizing = 'border-box';
        });
    };

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
    };

    constructor(oAppConfiguration) {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        this.appConfiguration = oAppConfiguration;

        this.spaceTimeSize = 0;
        this.appBox;

        this.spaceTimeController;

        this.timerIntervalId = 0;
        this.isTimerRunning = false;
        this.timeFwdButton;
    }

    startTimer() {
        this.isTimerRunning = true;
        this.timerIntervalId = window.setInterval(this.moveTimeForward.bind(this), 700);
        this.timeFwdButton.innerText = '||';
    };

    stopTimer() {
        window.clearInterval(this.timerIntervalId);
        this.isTimerRunning = false;
        this.timeFwdButton.innerText = '>';
    };

    handleSpaceClick(event) {
        const oTarget = event.currentTarget;
        let sId = oTarget.id;
        let oCoordinates = SpaceTimeView.getXYFromID(sId);
        let oBody = this.spaceTimeController.getBodyAt(oCoordinates.x, oCoordinates.y);
        if (oBody) {
            oBody.mass++;
        } else {
            oBody = createBody(this.spaceTimeController.getTime(), oCoordinates.x, oCoordinates.y);
        }
        if (oBody.mass < 16) {
            this.spaceTimeController.updateBodyAt(oCoordinates.x, oCoordinates.y, oBody);
        } else {
            this.spaceTimeController.deleteBodyAt(oCoordinates.x, oCoordinates.y);
            oBody = null;
        }
        SpaceTimeView.drawBody(oCoordinates, SpaceTimeView.getCssMassColor(oBody), this.appConfiguration.gridSize);
        if (!this.isTimerRunning) {
            this.startTimer.call(this);
        }
    };

    moveTimeForward() {
        const clear = true;
        this.drawSpace(clear);

        if (this.spaceTimeSize < this.appConfiguration.maxSpaceTimeSize) {
            const nPreviousTime = this.spaceTimeController.getTime();
            this.spaceTimeController.incrementTime();
            this.oTimeBackButton.disabled = false;
            if (!this.spaceTimeController.getSpaceSnapshot()) {
                const oSpaceSnapshot = SpaceTimeController.copySpaceSnapshot(this.spaceTimeController.getSpaceSnapshotAt(nPreviousTime));
                this.spaceTimeController.addSpaceSnapshot(oSpaceSnapshot);
                this.spaceTimeController.calculateAllGravity();
                this.spaceTimeController.calculateAllPositions();
                const nSnapshotSize = JSON.stringify(oSpaceSnapshot).length;
                this.spaceTimeSize = this.spaceTimeSize + nSnapshotSize;
            }
        } else {
            this.timeFwdButton.disabled = true;
        }

        this.drawSpace();
    };

    moveTimeBackward() {
        const clear = true;
        this.drawSpace(clear);

        if (this.spaceTimeController.getTime() === 0) {
            this.oTimeBackButton.disabled = true;
        } else {
            this.spaceTimeController.incrementTime(-1);
            this.timeFwdButton.disabled = false;
        }
        this.drawSpace();
    };

    handleTimeFwdButtonClick() {
        if (this.isTimerRunning) {
            this.stopTimer.call(this);
            this.moveTimeForward.call(this);
        } else {
            this.startTimer.call(this);
        }
    };

    handleTimeBackButtonClick() {
        this.stopTimer.call(this);
        this.moveTimeBackward.call(this);
    };

    drawSpace(bClear) {
        const aCoordinates = this.spaceTimeController.getSpaceSnapshot();
        if (aCoordinates) {
            aCoordinates.forEach(aXAxis => {
                aXAxis.forEach(oBody => {
                    const floorX = Math.floor(oBody.position.x);
                    const floorY = Math.floor(oBody.position.y);
                    if (floorX > 0 && floorX < this.appConfiguration.gridSize && floorY > 0 && floorY < this.appConfiguration.gridSize) {
                        if (bClear) {
                            SpaceTimeView.drawBody({ x: floorX, y: floorY }, CSS_RGB_BACKGROUND_COLOR, this.appConfiguration.gridSize);
                        } else {
                            SpaceTimeView.drawBody({ x: floorX, y: floorY }, SpaceTimeView.getCssMassColor(oBody), this.appConfiguration.gridSize);
                        }
                    }
                })
            });
        }
    };

    makeAppBox() {
        this.appBox = document.getElementById('app');
        if (!this.appBox) {
            this.appBox = createDiv('app');
        }
    };

    makeSpaceGrid(numberOfRows, oSpaceTimeController) {
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
        spaceTimeBox.style.backgroundColor = CSS_RGB_BACKGROUND_COLOR;
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
                box.style.backgroundColor = CSS_RGB_BACKGROUND_COLOR;
                x = x + 1;
            }

            y = y - 1;
        }
    };

    makeTimeFwdButton(parentBox) {
        this.timeFwdButton = createButton('timeFwdButton', '>', parentBox);
        this.timeFwdButton.onclick = this.handleTimeFwdButtonClick.bind(this);
    };

    makeTimeBackButton(parentBox) {
        this.oTimeBackButton = createButton('timeBackButton', '<', parentBox);
        this.oTimeBackButton.onclick = this.handleTimeBackButtonClick.bind(this);
        this.oTimeBackButton.disabled = true;
    };

    makeSpaceTimeButtonBar() {
        const buttonBar = createDiv('buttonBar', this.appBox);

        this.makeTimeBackButton(buttonBar);
        this.makeTimeFwdButton(buttonBar);
    };

    handleKeyDown(event) {
        const keyCode = event.keyCode;
        if (keyCode === 37) {
            this.moveTimeBackward();
        } else if (keyCode === 39) {
            this.stopTimer.call(this);
            this.moveTimeForward.call(this);
        }
    };
}

export { SpaceTimeView };