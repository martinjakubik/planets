import { createBody, calculateGravity, calculatePosition } from './gravity.mjs';
import { createDiv, createButton } from './lib/js/learnhypertext.mjs';

const DARKEST_COLOR = 0;
const LIGHTEST_COLOR = 255;
const CSS_RGB_BACKGROUND_COLOR = `rgb(${LIGHTEST_COLOR}, ${LIGHTEST_COLOR}, ${LIGHTEST_COLOR + 40})`;
const CSS_RGBA_SHINY_COLOR = `rgba(${DARKEST_COLOR}, ${DARKEST_COLOR}, ${DARKEST_COLOR}, 0.5)`;

const startTimer = function () {
    bTimerRunning = true;
    nTimerIntervalId = window.setInterval(moveTimeForward, 700);
    oTimeFwdButton.innerText = '||';
};

const stopTimer = function () {
    window.clearInterval(nTimerIntervalId);
    bTimerRunning = false;
    oTimeFwdButton.innerText = '>';
};

const getMassColor = function (mass) {
    return LIGHTEST_COLOR - mass * 16 + 1;
};

const getCssMassColor = function (body) {
    let sMassColor = DARKEST_COLOR;
    if (body && body.mass) {
        sMassColor = getMassColor(body.mass);
        return `rgb(${sMassColor}, ${sMassColor}, ${sMassColor})`;
    }
    return CSS_RGB_BACKGROUND_COLOR;
};

const getCssShineColor = function (pen) {
    if (pen === CSS_RGB_BACKGROUND_COLOR) {
        return CSS_RGB_BACKGROUND_COLOR;
    }
    return CSS_RGBA_SHINY_COLOR;
};

const calculateAllGravity = function () {
    const aCoordinates = aSpaceTime[nTime];
    if (aCoordinates) {
        aCoordinates.forEach(aXAxis => {
            aXAxis.forEach((oBody) => {
                aCoordinates.forEach(aXAxis => {
                    aXAxis.forEach(oNeighbour => {
                        if (oNeighbour.id !== oBody.id) {
                            const oRecalculatedBody = calculateGravity(oBody, oNeighbour);
                            const oCoordinates = oBody.position;
                            updateBodyAt(nTime, oCoordinates.x, oCoordinates.y, oRecalculatedBody);
                        }
                    })
                })
            })
        })
    }
};

const calculateAllPositions = function () {
    const aCoordinates = aSpaceTime[nTime];
    if (aCoordinates) {
        aCoordinates.forEach(aXAxis => {
            aXAxis.forEach(oBody => {
                const oCoordinates = oBody.position;
                calculatePosition(oBody, nTime);
                updateBodyAt(nTime, oCoordinates.x, oCoordinates.y, oBody);
            })
        });
    }
};

const getBodyAt = function (nTime, dx, dy) {
    const x = Math.floor(dx);
    const y = Math.floor(dy);
    const aSpace = aSpaceTime[nTime];
    const aXAxis = aSpace ? aSpace[x] : null;
    return aXAxis ? aXAxis[y] : null;
};

const updateBodyAt = function (nTime, dx, dy, oBody) {
    const x = Math.floor(dx);
    const y = Math.floor(dy);
    const nMoveToX = Math.floor(oBody.position.x);
    const nMoveToY = Math.floor(oBody.position.y);
    if (!aSpaceTime[nTime]) {
        aSpaceTime[nTime] = [];
    }
    if (x === oBody.position.x && y === oBody.position.y) {
        if (!aSpaceTime[nTime][x]) {
            aSpaceTime[nTime][x] = [];
        }
        aSpaceTime[nTime][x][y] = oBody;
    } else {
        deleteBodyAt(nTime, x, y);
        if (!aSpaceTime[nTime][nMoveToX]) {
            aSpaceTime[nTime][nMoveToX] = [];
        }
        aSpaceTime[nTime][nMoveToX][nMoveToY] = oBody;
    }
};

const deleteBodyAt = function (nTime, dx, dy) {
    const x = Math.floor(dx);
    const y = Math.floor(dy);
    if (aSpaceTime[nTime] && aSpaceTime[nTime][x] && aSpaceTime[nTime][x][y]) {
        delete aSpaceTime[nTime][x][y];
    }
};

const handleSpaceClick = function (event) {
    const oTarget = event.currentTarget;
    let sId = oTarget.id;
    let oCoordinates = getXYFromID(sId);
    let oBody = getBodyAt(nTime, oCoordinates.x, oCoordinates.y);
    if(oBody) {
        oBody.mass++;
    } else {
        oBody = createBody(nTime, oCoordinates.x, oCoordinates.y);
    }
    if (oBody.mass < 16) {
        updateBodyAt(nTime, oCoordinates.x, oCoordinates.y, oBody);
    } else {
        deleteBodyAt(nTime, oCoordinates.x, oCoordinates.y);
        oBody = null;
    }
    drawBody(oCoordinates, getCssMassColor(oBody));
    if (!bTimerRunning) {
        startTimer();
    }
};

const moveTimeForward = function () {
    const clear = true;
    drawSpace(nTime, clear);

    if (nSpaceTimeSize < oAppConfiguration.maxSpaceTimeSize) {
        const nPreviousTime = nTime;
        nTime++;
        const oTimeBackButton = document.getElementById('timeBackButton');
        oTimeBackButton.disabled = false;
        if (!aSpaceTime[nTime]) {
            const oSpaceSnapshot = copySpaceSnapshot(aSpaceTime[nPreviousTime]);
            aSpaceTime[nTime] = oSpaceSnapshot;
            calculateAllGravity();
            calculateAllPositions();
            const nSnapshotSize = JSON.stringify(oSpaceSnapshot).length;
            nSpaceTimeSize = nSpaceTimeSize + nSnapshotSize;
        }
    } else {
        const oTimeFwdButton = document.getElementById('timeFwdButton');
        oTimeFwdButton.disabled = true;
    }

    drawSpace(nTime);
};

const moveTimeBackward = function () {
    const clear = true;
    drawSpace(nTime, clear);

    const oTimeBackButton = document.getElementById('timeBackButton');
    if (nTime === 0) {
        oTimeBackButton.disabled = true;
    } else {
        nTime--;
        const oTimeFwdButton = document.getElementById('timeFwdButton');
        oTimeFwdButton.disabled = false;
    }
    drawSpace(nTime);
};

const handleTimeFwdButtonClick = function () {
    if (bTimerRunning) {
        stopTimer();
        moveTimeForward();
    } else {
        startTimer();
    }
};

const handleTimeBackButtonClick = function () {
    stopTimer();
    moveTimeBackward();
};

const getXYFromID = function (sId) {
    let aCoordinates = sId.split(':');
    let sX = aCoordinates[0];
    let sY = aCoordinates[1];
    return {
        x: Number(sX),
        y: Number(sY)
    };
};

const copySpaceSnapshot = function (aCoordinates) {
    let aSpaceSnapshot = [];
    aCoordinates.forEach(aXAxis => {
        aXAxis.forEach(oBody => {
            const x = Math.floor(oBody.position.x);
            const y = Math.floor(oBody.position.y);
            if (!aSpaceSnapshot[x]) {
                aSpaceSnapshot[x] = [];
            }
            aSpaceSnapshot[x][y] = oBody;
        })
    });
    return aSpaceSnapshot;
};

const drawSpace = function (nTime, bClear) {
    const aCoordinates = aSpaceTime[nTime];
    if (aCoordinates) {
        aCoordinates.forEach(aXAxis => {
            aXAxis.forEach(oBody => {
                const floorX = Math.floor(oBody.position.x);
                const floorY = Math.floor(oBody.position.y);
                if (floorX > 0 && floorX < oAppConfiguration.gridSize && floorY > 0 && floorY < oAppConfiguration.gridSize) {
                    if (bClear) {
                        drawBody({x: floorX, y: floorY}, CSS_RGB_BACKGROUND_COLOR);
                    } else {
                        drawBody({x: floorX, y: floorY}, getCssMassColor(oBody));
                    }
                }
            })
        });
    }
};

const drawBody = function (position, pen) {
    const floorPosition = {
        x: Math.floor(position.x),
        y: Math.floor(position.y)
    };
    const oNewTarget = document.getElementById(`${floorPosition.x}:${floorPosition.y}`);
    oNewTarget.style.backgroundColor = pen;
    drawShininess(floorPosition, getCssShineColor(pen));
};

const drawShininess = function (position, pen) {
    const aNeighborBoxes = getNeighborBoxes(position, 1);
    aNeighborBoxes.forEach(neighborBoxPosition => {
        let target = document.getElementById(`${neighborBoxPosition.x}:${neighborBoxPosition.y}`);
        target.style.border = `1px solid ${pen}`;
        target.style.boxSizing = 'border-box';
    });
};

const getNeighborBoxes = function (position, radius) {
    const aNeighborBoxes = [];
    if ((position.x - radius) >= 0) {
        aNeighborBoxes.push({x: position.x - radius, y: position.y});
    }
    if ((position.y - radius) >= 0) {
        aNeighborBoxes.push({x: position.x, y: position.y - 1});
    }
    if ((position.x + radius) < oAppConfiguration.gridSize) {
        aNeighborBoxes.push({x: position.x + radius, y: position.y});
    }
    if ((position.y + radius) < oAppConfiguration.gridSize) {
        aNeighborBoxes.push({x: position.x, y: position.y + radius});
    }
    return aNeighborBoxes;
};

const makeAppBox = function () {
    appBox = document.getElementById('app');
    if(!appBox) {
        appBox = createDiv('app');
    }
};

const makeSpaceGrid = function (numberOfRows) {
    oAppConfiguration.gridSize = numberOfRows;
    let nSizeOfBox = Math.floor(720 / oAppConfiguration.gridSize);

    let numberOfColumns = numberOfRows;

    let y = numberOfRows - 1;
    let x = 0;
    makeAppBox();
    let spaceTimeBox = document.getElementById('spaceTime');
    if(!spaceTimeBox) {
        spaceTimeBox = createDiv('spaceTime', appBox);
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
            box.onclick = handleSpaceClick;
            box.style.height = nSizeOfBox;
            box.style.width = nSizeOfBox;
            box.style.backgroundColor = CSS_RGB_BACKGROUND_COLOR;
            x = x + 1;
        }

        y = y - 1;
    }
};

const makeTimeFwdButton = function (parentBox) {
    oTimeFwdButton = createButton('timeFwdButton', '>', parentBox);
    oTimeFwdButton.onclick = handleTimeFwdButtonClick;
};

const makeTimeBackButton = function (parentBox) {
    const oButton = createButton('timeBackButton', '<', parentBox);
    oButton.onclick = handleTimeBackButtonClick;
    oButton.disabled = true;
};

const makeSpaceTimeButtonBar = function () {
    const buttonBar = createDiv('buttonBar', appBox);

    makeTimeBackButton(buttonBar);
    makeTimeFwdButton(buttonBar);
};

const handleKeyDown = function (event) {
    const keyCode = event.keyCode;
    if (keyCode === 37) {
        moveTimeBackward();
    } else if (keyCode === 39) {
        stopTimer();
        moveTimeForward();
    }
};

document.addEventListener('keydown', handleKeyDown);

const reset = function () {
    nTime = 0;
    window.clearInterval(nTimerIntervalId);
    makeSpaceGrid(oAppConfiguration.gridSize);
    const oButton = document.getElementById('timeBackButton');
    oButton.disabled = true;
};

const oAppConfiguration = {
    gridSize: 0,
    maxSpaceTimeSize: 10 ** 6
};

let nTime = 0;
let nSpaceTimeSize = 0;
let appBox;

let aSpaceTime = [];

let nTimerIntervalId = 0;
let bTimerRunning = false;
let oTimeFwdButton;

const getSpaceTime = function () {
    return aSpaceTime;
};

const setSpaceTime = function (spaceTime) {
    aSpaceTime = spaceTime;
};

export { makeSpaceGrid, makeSpaceTimeButtonBar, calculateGravity, calculatePosition, reset, getSpaceTime, setSpaceTime };