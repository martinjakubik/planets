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
    const aBodies = Object.entries(oSpaceTime);
    aBodies.forEach(([oBodyKey, oBody]) => {
        aBodies.forEach(([oNeighbourKey, oNeighbour]) => {
            if (oNeighbourKey !== oBodyKey) {
                calculateGravity(oBody, oNeighbour);
            }
        });
    });
};

const handleSpaceTimeClick = function (event) {
    const oTarget = event.currentTarget;
    let sId = oTarget.id;
    let oCoordinates = getXYFromID(sId);
    let oBody = oSpaceTime[sId];
    if(oBody) {
        oBody.mass++;
    } else {
        oBody = createBody(oCoordinates.x, oCoordinates.y);
    }
    if (oBody.mass < 16) {
        oSpaceTime[sId] = oBody;
        if (!aSpaceTimeHistory[nTime]) {
            aSpaceTimeHistory[nTime] = [];
        }
    } else {
        delete oSpaceTime[sId];
        oBody = null;
    }
    const oSpaceTimeSnapshot = copySpaceTimeSnapshot(oSpaceTime);
    aSpaceTimeHistory[nTime] = oSpaceTimeSnapshot;
    drawBody(oCoordinates, getCssMassColor(oBody));
};

const handleTimeButtonClick = function () {
    calculateAllGravity();
    const clear = true;
    drawSpaceTime(nTime, clear);
    nTime++;
    drawSpaceTime(nTime);

    const oSpaceTimeSnapshot = copySpaceTimeSnapshot(oSpaceTime);
    aSpaceTimeHistory[nTime] = oSpaceTimeSnapshot;
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

const copySpaceTimeSnapshot = function (oSpaceTime) {
    let oSpaceTimeSnapshot = {};
    const aSpaceTimeEntries = Object.entries(oSpaceTime);
    aSpaceTimeEntries.forEach(([key, value]) => {
        oSpaceTimeSnapshot[key] = Object.assign({}, value);
    });
    return oSpaceTimeSnapshot;
};

const drawSpaceTime = function (nTime, bClear) {
    const aBodies = Object.values(oSpaceTime);
    aBodies.forEach(oBody => {
        const x = oBody.position.x;
        const y = oBody.position.y;
        const oNewPosition = calculatePosition(oBody, nTime);
        const newX = Math.floor(oNewPosition.x);
        const newY = Math.floor(oNewPosition.y);
        if (newX !== x || newY !== y) {
            if (x > 0 && x < oAppConfiguration.gridSize && y > 0 && y < oAppConfiguration.gridSize) {
                drawBody({x: x, y: y}, CSS_RGB_BACKGROUND_COLOR);
            }
            if (newX > 0 && newX < oAppConfiguration.gridSize && newY > 0 && newY < oAppConfiguration.gridSize) {
                drawBody({x: newX, y: newY}, getCssMassColor(oBody));
            }
        }
    });
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
    box.onclick = handleSpaceTimeClick;
    box.style.height = sizeOfBox;
    box.style.width = sizeOfBox;
    box.style.backgroundColor = CSS_RGB_BACKGROUND_COLOR;

    return box;
};

const makeSpaceTimeGrid = function (numberOfRows) {
    oAppConfiguration.gridSize = numberOfRows;
    let nSizeOfBox = Math.floor(720 / oAppConfiguration.gridSize);

    let numberOfColumns = numberOfRows;

    let y = numberOfRows - 1;
    let x = 0;
    let spaceTimeBox = makeOuterBox(document.body);
    spaceTimeBox.id = 'spaceTime';
    spaceTimeBox.style.backgroundColor = CSS_RGB_BACKGROUND_COLOR;
    let rowBox;

    oSpaceTime = {};

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

const makeTimeButton = function (parentBox) {
    const oButton = document.createElement('button');
    oButton.id = 'timeButton';
    oButton.innerText = '>';
    oButton.onclick = handleTimeButtonClick;
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

    makeTimeButton(buttonBar);
    makeGridToggleButton(buttonBar);

    document.body.appendChild(buttonBar);
};

const oAppConfiguration = {
    gridSize: 0
};

let oSpaceTime;
let nTime = 0;

const aSpaceTimeHistory = [];

export { makeSpaceTimeGrid, makeButtonBar, calculateGravity, calculatePosition };