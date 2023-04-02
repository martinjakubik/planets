import { calculateGravity, calculatePosition, addVectors, getDistanceSquared, getNeighbourVector } from '../app/gravity.mjs';

QUnit.module('gravity');

// note: good braid without collision
/*
{x: 16, y: 28}
{x: 24, y: 46}
{x: 46, y: 45}
*/

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

QUnit.test('calculate flat angle', assert => {
    const body = duplicate(BODY_1);
    const neighbour = duplicate(NEIGHBOUR_1);

    body.force = 1;
    body.angle = 0;

    neighbour.force = 1;
    neighbour.angle = Math.PI;

    const expected = 0;
    const actualBody = calculateGravity(body, neighbour);
    const actual = actualBody.angle;

    assert.equal(actual, expected);
});

QUnit.test('calculate distance squared', assert => {
    const body = duplicate(BODY_1);
    const neighbour = duplicate(NEIGHBOUR_1);

    neighbour.position.x = 10;
    neighbour.position.y = 20;

    const expected = 100;
    const actual = getDistanceSquared(body, neighbour);

    assert.equal(actual, expected);
});

QUnit.test('calculate angle to neighbour', assert => {
    const body = duplicate(BODY_1);
    const neighbour = duplicate(NEIGHBOUR_1);
    const distanceSquared = 100;

    neighbour.position.x = 10;
    neighbour.position.y = 20;

    const expected = Math.PI / 2;
    const actualVectorToNeighbour = getNeighbourVector(body, neighbour, distanceSquared);
    const actual = actualVectorToNeighbour.angle;

    assert.equal(actual, expected);
});

QUnit.test('calculate vector sum with neighbour', assert => {
    const body = duplicate(BODY_1);
    const neighbour = duplicate(NEIGHBOUR_1);

    printBody(BODY_1, '4 BODY_1');
    body.force = 1;
    body.angle = Math.PI / 2;

    neighbour.force = 1;
    neighbour.angle = -1 * Math.PI / 2;
    neighbour.position.x = 10;
    neighbour.position.y = 20;

    const expected = Math.PI / 2;
    const actualNeighbourVector = addVectors(body, neighbour);
    const actual = actualNeighbourVector.angle;

    assert.equal(actual, expected);
});

QUnit.test('calculate vertical angle', assert => {
    const body = duplicate(BODY_1);
    const neighbour = duplicate(NEIGHBOUR_1);

    printBody(BODY_1, '5 BODY_1');

    neighbour.position.x = 10;
    neighbour.position.y = 20;

    const expected = Math.PI / 2;
    const actualBody = calculateGravity(body, neighbour);
    const actual = actualBody.angle;

    assert.equal(actual, expected);
});

QUnit.test('calculate position', assert => {
    const body = {
        id: '100:100',
        mass: 1,
        position: {
            x: 3,
            y: 15
        },
        force: 0.005524271728019903,
        angle: -Math.PI / 4
    };

    const expected = {
        x: 2,
        y: 17
    };
    const actual = calculatePosition(body, 10);

    assert.equal(actual, expected);
});
