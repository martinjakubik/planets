const BODY_1 = {
    id: '1:1',
    mass: 1,
    position: {
        x: 10,
        y: 10
    },
    force: 0,
    angle: 0
};

const BODY_2 = {
    id: '1:2',
    mass: 1,
    position: {
        x: 10,
        y: 10
    },
    force: 1,
    angle: 0
};

const BODY_3 = {
    id: '1:3',
    mass: 1,
    position: {
        x: 10,
        y: 10
    },
    force: 1,
    angle: 0
};

const NEIGHBOUR_1 = {
    id: '2:2',
    mass: 1,
    position: {
        x: 20,
        y: 10
    },
    force: 0,
    angle: 0
};

const duplicate = function (body) {
    return {
        id: body.id,
        mass: body.mass,
        position: {
            x: body.position.x,
            y: body.position.y
        },
        force: body.force,
        angle: body.angle
    };
}

const printBody = function (body, label = '') {
    console.log(`label:'${label}' ${body.id} m:${body.mass} x:${body.position.x} y:${body.position.y} f:${body.force} a:${body.angle}`);
}

export { BODY_1, BODY_2, BODY_3, NEIGHBOUR_1, duplicate, printBody }
