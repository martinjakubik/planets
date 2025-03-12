import { calculateGravity, calculatePosition, addVectors, getDistanceSquared, getNeighbourVector } from '../app/gravity.mjs';
import * as P from './planettest.js';

QUnit.module('gravity');

// note: good braid without collision
/*
{x: 16, y: 28}
{x: 24, y: 46}
{x: 46, y: 45}
*/

QUnit.test('calculate flat angle', assert => {
    const body = P.duplicate(P.BODY_1);
    const neighbour = P.duplicate(P.HORIZONTAL_NEIGHBOUR_1);

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
    const body = P.duplicate(P.BODY_1);
    const neighbour = P.duplicate(P.HORIZONTAL_NEIGHBOUR_1);

    neighbour.position.x = 10;
    neighbour.position.y = 20;

    const expected = 100;
    const actual = getDistanceSquared(body, neighbour);

    assert.equal(actual, expected);
});

QUnit.test('calculate angle to neighbour', assert => {
    const body = P.duplicate(P.BODY_1);
    const neighbour = P.duplicate(P.HORIZONTAL_NEIGHBOUR_1);
    const distanceSquared = 100;

    neighbour.position.x = 10;
    neighbour.position.y = 20;

    const expected = Math.PI / 2;
    const actualVectorToNeighbour = getNeighbourVector(body, neighbour, distanceSquared);
    const actual = actualVectorToNeighbour.angle;

    assert.equal(actual, expected);
});

QUnit.test('calculate vector sum with neighbour', assert => {
    const body = P.duplicate(P.BODY_1);
    const neighbour = P.duplicate(P.HORIZONTAL_NEIGHBOUR_1);

    body.force = 1;
    body.angle = 0;

    neighbour.force = 1;
    neighbour.angle = Math.PI;

    const expected = Math.PI;
    const actualNeighbourVector = addVectors(body, neighbour);
    const actual = actualNeighbourVector.angle;

    assert.equal(actual, expected);
});

QUnit.test('calculate vertical angle', assert => {
    const body = P.duplicate(P.BODY_1);
    const neighbour = P.duplicate(P.HORIZONTAL_NEIGHBOUR_1);

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
            x: 10,
            y: 10
        },
        force: 1,
        angle: Math.PI / 2
    };

    const expected = {
        x: 10,
        y: 12
    };
    const actual = calculatePosition(body, 10000);

    assert.equal(actual, expected);
});
