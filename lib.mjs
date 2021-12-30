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

let createBody = function (x, y) {

    return {
        id: `${x}:${y}`,
        mass: 1,
        initialPosition: {
            x: x,
            y: y
        },
        position: {
            x: x,
            y: y
        },
        force: 0,
        angle: 0
    };

};

let calculateAllGravity = function () {

    for (let y1 = 0; y1 < aSpaceTimeModel.length; y1++) {
        for (let x1 = 0; x1 < aSpaceTimeModel[y1].length; x1++) {
            let oBody1 = aSpaceTimeModel[y1][x1];
            if (oBody1) {
                for (let y2 = 0; y2 < aSpaceTimeModel.length; y2++) {
                    for (let x2 = 0; x2 < aSpaceTimeModel[y2].length; x2++) {
                        let oBody2 = aSpaceTimeModel[y2][x2];
                        if (oBody2 && oBody2.id !== oBody1.id) {
                            calculateGravity(oBody1, oBody2);
                        }
                    }
                }
            }
        }
    }

};

let calculateGravity = function (body, neighbour) {

    let nDistanceSquared = (body.position.x - neighbour.position.x) ** 2 + (body.position.y - neighbour.position.y) ** 2;
    let neighbourVector = {
        force: body.mass * neighbour.mass / nDistanceSquared,
        angle: Math.atan2(neighbour.position.y - body.position.y, neighbour.position.x - body.position.x)
    };
    let vectorSum = addVectors(body, neighbourVector);
    let sumOfMagnitudes = vectorSum.magnitude;
    let sumOfAngles = vectorSum.angle;
    console.table({
        'body id': body.id,
        'neighbour id': neighbour.id,
        'add vector magnitudes': sumOfMagnitudes,
        'sumOfAngles': sumOfAngles
    });
    body.angle = sumOfAngles;
    body.force = sumOfMagnitudes;

    console.log(body);

};

let addVectors = function (v1, v2) {

    let v1Cartesian = convertRadialVectorToCartesian(v1);
    let v2Cartesian = convertRadialVectorToCartesian(v2);

    let resultant = {
        x: v1Cartesian.x + v2Cartesian.x,
        y: v1Cartesian.y + v2Cartesian.y
    };

    return {
        magnitude: Math.sqrt(resultant.x * resultant.x, resultant.y * resultant.y),
        angle: Math.atan2(resultant.y, resultant.x)
    };

};

let convertRadialVectorToCartesian = function (v) {

    return {
        x: Math.cos(v.angle) * v.force,
        y: Math.sin(v.angle) * v.force
    };

};

let calculatePosition = function (body, time) {

    // x(t) = x0 + v0 * t + 1/2 at^2,
    // see: https://phys.libretexts.org/Bookshelves/University_Physics/Book%3A_University_Physics_%28OpenStax%29/Book%3A_University_Physics_I_-_Mechanics_Sound_Oscillations_and_Waves_%28OpenStax%29/03%3A_Motion_Along_a_Straight_Line/3.08%3A_Finding_Velocity_and_Displacement_from_Acceleration
    let x0 = body.initialPosition;
    let v0 = 0;
    let acceleration = body.force / body.mass;
    let displacementMagnitude = v0 * time + 1/2 * acceleration * time * time;
    let xDisplacement = Math.cos(body.angle) * displacementMagnitude;
    let yDisplacement = Math.sin(body.angle) * displacementMagnitude;
    let x = x0.x + xDisplacement;
    let y = x0.y + yDisplacement;
    body.position = {x: x, y: y};
    return body.position;

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

                console.log(oPosition);

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

    const oButton = document.createElement('button');
    oButton.id = 'timeButton';
    oButton.innerText = '>';
    oButton.onclick = handleTimeButtonClick;
    buttonBox.appendChild(oButton);
    document.body.appendChild(buttonBox);

};

let makeRecalculateButton = function () {

    let buttonBox = makeOuterBox(document.body);

    const oButton = document.createElement('button');
    oButton.id = 'recalculateButton';
    oButton.innerText = 're-calculate';
    oButton.onclick = calculateAllGravity;
    buttonBox.appendChild(oButton);
    document.body.appendChild(buttonBox);

};

let oAppConfiguration = {
    gridSize: 0
};

let aSpaceTimeModel = [];
let nTime = 0;

export { makeSpaceTimeGrid, makeTimeButton, makeRecalculateButton, calculateGravity, calculatePosition };