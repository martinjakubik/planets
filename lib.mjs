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

let handleSpaceClick = function (event) {

    const oTarget = event.currentTarget;
    let sId = oTarget.id;
    let oCoordinates = getXYFromID(sId);
    let oBody = aSpaceTimeModel[oCoordinates.y][oCoordinates.x];
    if(!oBody) {
        oBody = createBody(oCoordinates.x, oCoordinates.y);
    }
    if (oBody.mass < 16) {
        oBody.mass++;
    } else {
        oBody = null;
    }
    aSpaceTimeModel[oCoordinates.y][oCoordinates.x] = oBody;
    drawBody(oCoordinates, getCssMassColor(oBody));

};

let calculateAllGravity = function () {

    for (let y1 = 0; y1 < aSpaceTimeModel.length; y1++) {
        for (let x1 = 0; x1 < aSpaceTimeModel[y1].length; x1++) {
            let oBody = aSpaceTimeModel[y1][x1];
            if (oBody) {
                for (let y2 = 0; y2 < aSpaceTimeModel.length; y2++) {
                    for (let x2 = 0; x2 < aSpaceTimeModel[y2].length; x2++) {
                        let oNeighbour = aSpaceTimeModel[y2][x2];
                        if (oNeighbour && oNeighbour.id !== oBody.id) {
                            calculateGravity(oBody, oNeighbour);
                        }
                    }
                }
            }
        }
    }

};

let handleTimeButtonClick = function () {

    calculateAllGravity();
    nTime++;

    for (let y = 0; y < aSpaceTimeModel.length; y++) {
        for (let x = 0; x < aSpaceTimeModel[y].length; x++) {
            let oBody = aSpaceTimeModel[y][x];
            if (oBody) {

                let oPosition = calculatePosition(oBody, nTime);
                let newX = Math.floor(oPosition.x);
                let newY = Math.floor(oPosition.y);
                if (newX !== x || newY !== y) {
                    if (x > 0 && x < oAppConfiguration.gridSize && y > 0 && y < oAppConfiguration.gridSize) {
                        drawBody({x: x, y: y}, CSS_RGB_BACKGROUND_COLOR);
                        aSpaceTimeModel[y][x] = null;
                    }
                    if (newX > 0 && newX < oAppConfiguration.gridSize && newY > 0 && newY < oAppConfiguration.gridSize) {
                        drawBody({x: newX, y: newY}, getCssMassColor(oBody));
                        aSpaceTimeModel[newY][newX] = oBody;
                    }
                }
            }
        }
    }

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

    let oNewTarget = document.getElementById(`${position.x}:${position.y}`);
    oNewTarget.style.backgroundColor = pen;
    drawShininess(position, getCssShineColor(pen));

};

let drawShininess = function (position, pen) {

    const aNeighborBoxes = getNeighborBoxes(position);
    aNeighborBoxes.forEach(neighborPosition => {
        let target = document.getElementById(`${neighborPosition.x}:${neighborPosition.y}`);
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

let makeOuterBox = function (parentBox) {

    let box = document.createElement('div');
    parentBox.appendChild(box);

    return box;

};

let makeBox = function (parentBox, sizeOfBox, x, y) {

    let box = document.createElement('div');
    parentBox.appendChild(box);

    box.id = `${x}:${y}`;
    box.onclick = handleSpaceClick;
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
    let rowBox;

    while (y >= 0) {

        aSpaceTimeModel[y] = [];
        x = 0;
        rowBox = makeOuterBox(spaceTimeBox);
        while (x < numberOfColumns) {

            aSpaceTimeModel[y].push(null);
            makeBox(rowBox, nSizeOfBox, x, y);
            x = x + 1;

        }

        y = y - 1;

    }

};

let makeTimeButton = function () {

    let buttonBox = makeOuterBox(document.body);
    buttonBox.id = 'buttonBox';

    const oButton = document.createElement('button');
    oButton.id = 'timeButton';
    oButton.innerText = '>';
    oButton.onclick = handleTimeButtonClick;
    buttonBox.appendChild(oButton);
    document.body.appendChild(buttonBox);

};

let oAppConfiguration = {
    gridSize: 0
};

let aSpaceTimeModel = [];
let nTime = 0;

export { makeSpaceTimeGrid, makeTimeButton, calculateGravity, calculatePosition };