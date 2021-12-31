import { calculateGravity, calculatePosition } from '../lib.mjs';

QUnit.module('lib');

const BODY_1 = {
    id: '1:1',
    mass: 1,
    initialPosition: {
        x: 10,
        y: 10
    },
    position: {
        x: 10,
        y: 10
    },
    force: 1,
    angle: 0
};

const BODY_2 = {
    id: '1:2',
    mass: 1,
    initialPosition: {
        x: 10,
        y: 10
    },
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
    initialPosition: {
        x: 10,
        y: 10
    },
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
    initialPosition: {
        x: 20,
        y: 10
    },
    position: {
        x: 20,
        y: 10
    },
    force: 1,
    angle: Math.PI
};

QUnit.test('calculate flat angle', assert => {

    const body = BODY_1;
    const neighbour = NEIGHBOUR_1;

    body.force = 1;
    body.angle = 0;

    neighbour.force = 1;
    neighbour.angle = Math.PI;

    const expected = 0;
    const actualBody = calculateGravity(body, neighbour);
    const actual =  actualBody.angle;

    assert.equal(actual, expected);

});

QUnit.test('calculate vertical angle', assert => {

    const body = BODY_1;
    const neighbour = NEIGHBOUR_1;

    body.force = 1;
    body.angle = -1 * Math.PI / 2;

    neighbour.force = 1;
    neighbour.angle = Math.PI / 2;

    const expected = -1 * Math.PI / 2;
    const actualBody = calculateGravity(body, neighbour);
    const actual =  actualBody.angle;

    assert.equal(actual, expected);

});

QUnit.test('calculate position', assert => {

    const body = {
        id: '100:100',
        mass: 1,
        initialPosition: {
            x: 1,
            y: 18
        },
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
