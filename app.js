let handleHover = function (event) {

    const oTarget = event.currentTarget;
    oTarget.classList.add('touch');
    setTimeout(() => {oTarget.classList.remove('touch');}, 500);

};

let handleClick = function (event) {

    const oTarget = event.currentTarget;
    let sId = oTarget.id;
    let aCoordinates = sId.split(':');
    let sX = aCoordinates[0];
    let sY = aCoordinates[1];
    let x = Number(sX);
    let y = Number(sY);
    let oPlanet = aGridModel[y][x];
    if(!oPlanet) {
        oPlanet = {
            mass: 1
        };
    }
    oPlanet.mass = oPlanet.mass < 16 ? oPlanet.mass + 1 : 0;
    aGridModel[y][x] = oPlanet;
    let nMassColor = 255 - oPlanet.mass * 16;
    oTarget.style.backgroundColor = `rgb(${nMassColor}, ${nMassColor}, ${nMassColor})`;

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

let oAppConfiguration = {
    gridSize: 0
};

let aGridModel = [];

makeGrid(20);