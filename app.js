let handleHover = function (event) {

    const oTarget = event.currentTarget;
    oTarget.classList.add('touch');
    setTimeout(() => {oTarget.classList.remove('touch');}, 500);

};

let handleClick = function (event) {

    const oTarget = event.currentTarget;
    let sId = oTarget.id;
    let oCoordinates = getXYFromID(sId);
    let oPlanet = aGridModel[oCoordinates.y][oCoordinates.x];
    if(!oPlanet) {
        oPlanet = createPlanet(oCoordinates.x, oCoordinates.y);
    }
    if (oPlanet.mass < 16) {
        oPlanet.mass++;
    } else {
        oPlanet = null;
    }
    aGridModel[oCoordinates.y][oCoordinates.x] = oPlanet;
    let nMassColor = 255;
    if (oPlanet) {
        nMassColor = 255 - oPlanet.mass * 16;
    }
    oTarget.style.backgroundColor = `rgb(${nMassColor}, ${nMassColor}, ${nMassColor})`;

    calculateAllGravity();

};

let createPlanet = function (x, y) {

    return {
        id: `${x}:${y}`,
        mass: 1,
        force: 0,
        angle: 0
    };

};

let calculateAllGravity = function () {

    for (let y1 = 0; y1 < aGridModel.length; y1++) {
        for (let x1 = 0; x1 < aGridModel[y1].length; x1++) {
            let oBody1 = aGridModel[y1][x1];
            if (oBody1) {
                for (let y2 = 0; y2 < aGridModel.length; y2++) {
                    for (let x2 = 0; x2 < aGridModel[y2].length; x2++) {
                        let oBody2 = aGridModel[y2][x2];
                        if (oBody2 && oBody2.id !== oBody1.id) {
                            calculateGravity(oBody1, oBody2);
                        }
                    }
                }
            }
        }
    }

};

let calculateGravity = function (body1, body2) {

    let oBody1XY = getXYFromID(body1.id);
    let oBody2XY = getXYFromID(body2.id);
    let nDistanceSquared = (oBody1XY.x - oBody2XY.x) ** 2 + (oBody1XY.y - oBody2XY.y) ** 2;
    let nForce = body1.mass * body2.mass / nDistanceSquared;
    let nAngle = Math.atan2(oBody1XY.x - oBody2XY.x, oBody1XY.y - oBody2XY.y);
    body1.force = nForce;
    body1.angle = nAngle;
    console.log(nForce, nAngle);

};

let calculatePosition = function (body, time) {

    // x(t) = x0 + v0 * t + 1/2 at^2
    let x0 = getXYFromID(body.id);
    let v0 = 0;
    let acceleration = body.force / body.mass;
    let displacement = v0 * time + 1/2 * acceleration * time * time;
    let x = x0.x + displacement;
    let y = x0.y + displacement;
    return {x: x, y: y};

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

let makeRowBox = function (parentBox) {

    let box = document.createElement('div');
    parentBox.appendChild(box);

    return box;

};

let makeBox = function (parentBox, sizeOfBox, x, y) {

    let box = document.createElement('div');
    parentBox.appendChild(box);

    box.id = `${x}:${y}`;
    box.onmouseover = handleHover;
    box.onclick = handleClick;
    box.style.backgroundColor = 'rgb(255, 255, 255)';

    return box;

};

let makeGrid = function (numberOfRows) {

    oAppConfiguration.gridSize = numberOfRows;

    let numberOfColumns = numberOfRows;

    let y = 0;
    let x = 0;
    let rowBox;

    while (y < numberOfRows) {

        aGridModel[y] = [];
        x = 0;
        rowBox = makeRowBox(document.body);
        while (x < numberOfColumns) {

            aGridModel[y].push(null);
            makeBox(rowBox, 16, x, y);
            x = x + 1;

        }

        y = y + 1;

    }

};

let handleTimeButtonClick = function () {

    nTime++;
    for (let y = 0; y < aGridModel.length; y++) {
        for (let x = 0; x < aGridModel[y].length; x++) {
            let oBody = aGridModel[y][x];
            if (oBody) {

                let nMassColor = 255;
                nMassColor = 255 - oBody.mass * 16;
                let oPosition = calculatePosition(oBody, nTime);
                let newX = Math.floor(oPosition.x);
                let newY = Math.floor(oPosition.y);
                if (newX !== x || newY !== y) {
                    if (x > 0 && x < oAppConfiguration.gridSize && y > 0 && y < oAppConfiguration.gridSize) {
                        let oOldTarget = document.getElementById(`${x}:${y}`);
                        oOldTarget.style.backgroundColor = 'rgb(255, 255, 255)';
                        aGridModel[y][x] = null;
                    }
                    if (newX > 0 && newX < oAppConfiguration.gridSize && newY > 0 && newY < oAppConfiguration.gridSize) {
                        let oNewTarget = document.getElementById(`${newX}:${newY}`);
                        oNewTarget.style.backgroundColor = `rgb(${nMassColor}, ${nMassColor}, ${nMassColor})`;
                        aGridModel[newY][newX] = oBody;
                    }
                }

                console.log(oPosition);

            }
        }
    }

};

let makeButton = function () {

    const oButton = document.createElement('button');
    oButton.innerText = '>';
    oButton.onclick = handleTimeButtonClick;
    document.body.appendChild(oButton);

};

let oAppConfiguration = {
    gridSize: 0
};

let aGridModel = [];
let nTime = 0;

makeGrid(20);
makeButton();