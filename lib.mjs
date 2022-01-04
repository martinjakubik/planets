import { createBody, calculateGravity, calculatePosition } from './gravity.mjs';

const DARKEST_COLOR = 0;
const LIGHTEST_COLOR = 255;
const CSS_RGB_BACKGROUND_COLOR = `rgb(${DARKEST_COLOR}, ${DARKEST_COLOR}, ${DARKEST_COLOR + 40})`;
const CSS_RGBA_SHINY_COLOR = `rgba(${LIGHTEST_COLOR}, ${LIGHTEST_COLOR}, ${LIGHTEST_COLOR}, 0.5)`;

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
    const aBodies = Object.entries(oSpace);
    aBodies.forEach(([oBodyKey, oBody]) => {
        aBodies.forEach(([oNeighbourKey, oNeighbour]) => {
            if (oNeighbourKey !== oBodyKey) {
                calculateGravity(oBody, oNeighbour);
            }
        });
    });
};

const calculateAllPositions = function () {
    const aBodies = Object.values(oSpace);
    aBodies.forEach(oBody => {
        calculatePosition(oBody, nTime);
    });
};

const handleSpaceClick = function (event) {
    const oTarget = event.currentTarget;
    let sId = oTarget.id;
    let oCoordinates = getXYFromID(sId);
    let oBody = oSpace[sId];
    if(oBody) {
        oBody.mass++;
    } else {
        oBody = createBody(oCoordinates.x, oCoordinates.y);
    }
    if (oBody.mass < 16) {
        oSpace[sId] = oBody;
        if (!aSpaceTime[nTime]) {
            aSpaceTime[nTime] = [];
        }
    } else {
        delete oSpace[sId];
        oBody = null;
    }
    const oSpaceSnapshot = copySpaceSnapshot(oSpace);
    aSpaceTime[nTime] = oSpaceSnapshot;
    drawBody(oCoordinates, getCssMassColor(oBody));
};

const handleTimeFwdButtonClick = function () {
    const clear = true;
    drawSpace(nTime, clear);

    nTime++;
    const oTimeBackButton = document.getElementById('timeBackButton');
    oTimeBackButton.disabled = false;

    if (!aSpaceTime[nTime]) {
        calculateAllGravity();
        calculateAllPositions();
        const oSpaceSnapshot = copySpaceSnapshot(oSpace);
        aSpaceTime[nTime] = oSpaceSnapshot;
    }

    drawSpace(nTime);
};

const handleTimeBackButtonClick = function () {
    const clear = true;
    drawSpace(nTime, clear);

    const oTimeBackButton = document.getElementById('timeBackButton');
    if (nTime === 0) {
        oTimeBackButton.disabled = true;
    } else {
        nTime--;
    }
    drawSpace(nTime);
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

const copySpaceSnapshot = function (oSpace) {
    let oSpaceSnapshot = {};
    const aSpaceSnapshots = Object.entries(oSpace);
    aSpaceSnapshots.forEach(([key, value]) => {
        oSpaceSnapshot[key] = Object.assign({}, value);
    });
    return oSpaceSnapshot;
};

const drawSpace = function (nTime, bClear) {
    const oSpaceSnapshot = aSpaceTime[nTime];
    if (oSpaceSnapshot) {
        const aBodies = Object.values(oSpaceSnapshot);
        aBodies.forEach(oBody => {
            const floorX = Math.floor(oBody.position.x);
            const floorY = Math.floor(oBody.position.y);
            if (floorX > 0 && floorX < oAppConfiguration.gridSize && floorY > 0 && floorY < oAppConfiguration.gridSize) {
                if (bClear) {
                    drawBody({x: floorX, y: floorY}, CSS_RGB_BACKGROUND_COLOR);
                } else {
                    drawBody({x: floorX, y: floorY}, getCssMassColor(oBody));
                }
            }
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
        target.style.backgroundColor = pen;
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

const handleGridToggleButtonClick = function () {
    const spaceTimeBox = document.getElementById('spaceTime');
    spaceTimeBox.classList.toggle('grid');
};

const makeOuterBox = function (parentBox) {
    let box = document.createElement('div');
    parentBox.appendChild(box);

    return box;
};

const makeBox = function (parentBox, sizeOfBox, x, y) {
    let box = document.createElement('div');
    parentBox.appendChild(box);

    box.id = `${x}:${y}`;
    box.onclick = handleSpaceClick;
    box.style.height = sizeOfBox;
    box.style.width = sizeOfBox;
    box.style.backgroundColor = CSS_RGB_BACKGROUND_COLOR;

    return box;
};

const makeSpaceGrid = function (numberOfRows) {
    oAppConfiguration.gridSize = numberOfRows;
    let nSizeOfBox = Math.floor(720 / oAppConfiguration.gridSize);

    let numberOfColumns = numberOfRows;

    let y = numberOfRows - 1;
    let x = 0;
    let spaceTimeBox = makeOuterBox(document.body);
    spaceTimeBox.id = 'spaceTime';
    spaceTimeBox.style.backgroundColor = CSS_RGB_BACKGROUND_COLOR;
    let rowBox;

    oSpace = {};

    while (y >= 0) {
        x = 0;
        rowBox = makeOuterBox(spaceTimeBox);
        while (x < numberOfColumns) {
            makeBox(rowBox, nSizeOfBox, x, y);
            x = x + 1;
        }

        y = y - 1;
    }
};

const makeTimeFwdButton = function (parentBox) {
    const oButton = document.createElement('button');
    oButton.id = 'timeFwdButton';
    oButton.innerText = '>';
    oButton.onclick = handleTimeFwdButtonClick;
    parentBox.appendChild(oButton);
};

const makeTimeBackButton = function (parentBox) {
    const oButton = document.createElement('button');
    oButton.id = 'timeBackButton';
    oButton.innerText = '<';
    oButton.onclick = handleTimeBackButtonClick;
    oButton.disabled = true;
    parentBox.appendChild(oButton);
};

const makeGridToggleButton = function (parentBox) {
    const oButton = document.createElement('button');
    oButton.id = 'gridToggleButton';
    oButton.innerText = 'grid';
    oButton.onclick = handleGridToggleButtonClick;
    parentBox.appendChild(oButton);
};

const makeButtonBar = function () {
    const buttonBar = makeOuterBox(document.body);
    buttonBar.id = 'buttonBar';

    makeTimeBackButton(buttonBar);
    makeTimeFwdButton(buttonBar);
    makeGridToggleButton(buttonBar);

    document.body.appendChild(buttonBar);
};

const oAppConfiguration = {
    gridSize: 0
};

let oSpace;
let nTime = 0;

const aSpaceTime = [];

export { makeSpaceGrid, makeButtonBar, calculateGravity, calculatePosition };