import { createBody, calculateGravity, calculatePosition } from './gravity.mjs';

const DARKEST_COLOR = 0;
const LIGHTEST_COLOR = 255;
const CSS_RGB_BACKGROUND_COLOR = `rgb(${DARKEST_COLOR}, ${DARKEST_COLOR}, ${DARKEST_COLOR + 40})`;

let getMassColor = function (mass) {
    return LIGHTEST_COLOR - mass * 16 + 1;
};

let getCssMassColor = function (body) {
    let sMassColor = DARKEST_COLOR;
    if (body && body.mass) {
        sMassColor = getMassColor(body.mass);
        return `rgb(${sMassColor}, ${sMassColor}, ${sMassColor})`;
    }
    return CSS_RGB_BACKGROUND_COLOR;
};

let getCssShineColor = function (pen) {
    if (pen === CSS_RGB_BACKGROUND_COLOR) {
        return CSS_RGB_BACKGROUND_COLOR;
    }
    return `rgb(205, 205, 255)`;
};

let handleSpaceTimeClick = function (event) {
    const oTarget = event.currentTarget;
    let sId = oTarget.id;
    let oCoordinates = getXYFromID(sId);
    let oBody = oSpaceTime[sId];
    if(!oBody) {
        oBody = createBody(oCoordinates.x, oCoordinates.y);
    }
    if (oBody.mass < 16) {
        oBody.mass++;
        oSpaceTime[sId] = oBody;
    } else {
        delete oSpaceTime[sId];
    }
    drawBody(oCoordinates, getCssMassColor(oBody));
    console.log(oCoordinates);
};

let calculateAllGravity = function () {
    const aBodies = Object.entries(oSpaceTime);
    aBodies.forEach(([oBodyKey, oBody]) => {
        aBodies.forEach(([oNeighbourKey, oNeighbour]) => {
            if (oNeighbourKey !== oBodyKey) {
                calculateGravity(oBody, oNeighbour);
            }
        });
    });
};

let handleTimeButtonClick = function () {
    calculateAllGravity();
    nTime++;

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

let getXYFromID = function (sId) {
    let aCoordinates = sId.split(':');
    let sX = aCoordinates[0];
    let sY = aCoordinates[1];
    return {
        x: Number(sX),
        y: Number(sY)
    };
};

let drawBody = function (position, pen) {
    const floorPosition = {
        x: Math.floor(position.x),
        y: Math.floor(position.y)
    };
    const oNewTarget = document.getElementById(`${floorPosition.x}:${floorPosition.y}`);
    oNewTarget.style.backgroundColor = pen;
    drawShininess(floorPosition, getCssShineColor(pen));
};

let drawShininess = function (position, pen) {
    const aNeighborBoxes = getNeighborBoxes(position);
    aNeighborBoxes.forEach(neighborBoxPosition => {
        let target = document.getElementById(`${neighborBoxPosition.x}:${neighborBoxPosition.y}`);
        target.style.backgroundColor = pen;
    });
};

let getNeighborBoxes = function (position) {
    const aNeighborBoxes = [];
    if (position.x > 0) {
        aNeighborBoxes.push({x: position.x - 1, y: position.y});
    }
    if (position.y > 0) {
        aNeighborBoxes.push({x: position.x, y: position.y - 1});
    }
    if (position.x < oAppConfiguration.gridSize - 1) {
        aNeighborBoxes.push({x: position.x + 1, y: position.y});
    }
    if (position.y < oAppConfiguration.gridSize - 1) {
        aNeighborBoxes.push({x: position.x, y: position.y + 1});
    }
    return aNeighborBoxes;
};

let handleGridToggleButtonClick = function () {
    const spaceTimeBox = document.getElementById('spaceTime');
    spaceTimeBox.classList.toggle('grid');
};

let makeOuterBox = function (parentBox) {
    let box = document.createElement('div');
    parentBox.appendChild(box);

    return box;
};

let makeBox = function (parentBox, sizeOfBox, x, y) {
    let box = document.createElement('div');
    parentBox.appendChild(box);

    box.id = `${x}:${y}`;
    box.onclick = handleSpaceTimeClick;
    box.style.height = sizeOfBox;
    box.style.width = sizeOfBox;
    box.style.backgroundColor = CSS_RGB_BACKGROUND_COLOR;

    return box;
};

let makeSpaceTimeGrid = function (numberOfRows) {
    oAppConfiguration.gridSize = numberOfRows;
    let nSizeOfBox = Math.floor(720 / oAppConfiguration.gridSize);

    let numberOfColumns = numberOfRows;

    let y = numberOfRows - 1;
    let x = 0;
    let spaceTimeBox = makeOuterBox(document.body);
    spaceTimeBox.id = 'spaceTime';
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

let makeTimeButton = function (parentBox) {
    const oButton = document.createElement('button');
    oButton.id = 'timeButton';
    oButton.innerText = '>';
    oButton.onclick = handleTimeButtonClick;
    parentBox.appendChild(oButton);
};

let makeGridToggleButton = function (parentBox) {
    const oButton = document.createElement('button');
    oButton.id = 'gridToggleButton';
    oButton.innerText = 'grid';
    oButton.onclick = handleGridToggleButtonClick;
    parentBox.appendChild(oButton);
};

let makeButtonBar = function () {
    const buttonBar = makeOuterBox(document.body);
    buttonBar.id = 'buttonBar';

    makeTimeButton(buttonBar);
    makeGridToggleButton(buttonBar);

    document.body.appendChild(buttonBar);
};

let oAppConfiguration = {
    gridSize: 0
};

let oSpaceTime;
let nTime = 0;

export { makeSpaceTimeGrid, makeButtonBar, calculateGravity, calculatePosition };