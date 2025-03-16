import { calculateGravity, calculatePosition, addVectors, getDistanceSquared, getNeighbourVector, isLeftBoundaryCollision, isRightBoundaryCollision, isTopBoundaryCollision, isBottomBoundaryCollision } from '../app/gravity.mjs';
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
    body.force = 5;
    body.angle = 0;
    neighbour.force = 10;
    neighbour.angle = Math.PI;
    const expected = Math.PI;

    const actualNeighbourVector = addVectors(body, neighbour);
    const actual = actualNeighbourVector.angle;

    assert.equal(actual, expected);
});

QUnit.test.todo('calculate vector sum with near-zero net force', assert => {
    const body = P.duplicate(P.BODY_1);
    const neighbour = P.duplicate(P.HORIZONTAL_NEIGHBOUR_1);
    body.force = 10;
    body.angle = 0;
    neighbour.force = 10;
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
        force: 0,
        angle: Math.PI / 2
    };

    const expected = {
        x: 10,
        y: 10
    };
    const actualBody = calculatePosition(body, 10000);
    const actual = actualBody.position;

    assert.deepEqual(actual, expected);
});

QUnit.test('check left border collision 0', assert => {
    const body = P.duplicate(P.BODY_1);
    const expected = false;
    const actual = isLeftBoundaryCollision(body);
    assert.equal(actual, expected);
});

QUnit.test('check left border collision 1', assert => {
    const body = P.duplicate(P.BODY_1);
    body.position.x = 1;
    const expected = true;
    const actual = isLeftBoundaryCollision(body);
    assert.equal(actual, expected);
});

QUnit.test('check left border collision 2', assert => {
    const body = P.duplicate(P.BODY_1);
    body.position.x = 1;
    body.force = 10;
    const expected = false;
    const actual = isLeftBoundaryCollision(body);
    assert.equal(actual, expected);
});

QUnit.test('check left border collision 3', assert => {
    const body = P.duplicate(P.BODY_1);
    body.position.x = 1;
    body.force = 10;
    body.angle = Math.PI / 2 + 0.00001;
    const expected = true;
    const actual = isLeftBoundaryCollision(body);
    assert.equal(actual, expected);
});

QUnit.test('check right border collision 0', assert => {
    const body = P.duplicate(P.BODY_1);
    const oBoundary = { w: 100, h: 100 };
    const expected = false;
    const actual = isRightBoundaryCollision(body, oBoundary);
    assert.equal(actual, expected);
});

QUnit.test('check right border collision 1', assert => {
    const body = P.duplicate(P.BODY_1);
    const oBoundary = { w: 100, h: 100 };
    body.position.x = 100;
    const expected = true;
    const actual = isRightBoundaryCollision(body, oBoundary);
    assert.equal(actual, expected);
});

QUnit.test('check right border collision 2', assert => {
    const body = P.duplicate(P.BODY_1);
    const oBoundary = { w: 100, h: 100 };
    body.position.x = 99;
    const expected = true;
    const actual = isRightBoundaryCollision(body, oBoundary);
    assert.equal(actual, expected);
});

QUnit.test('check right border collision 3', assert => {
    const body = P.duplicate(P.BODY_1);
    const oBoundary = { w: 100, h: 100 };
    body.position.x = 99;
    const expected = true;
    const actual = isRightBoundaryCollision(body, oBoundary);
    assert.equal(actual, expected);
});

QUnit.test('check right border collision 4', assert => {
    const body = P.duplicate(P.BODY_1);
    const oBoundary = { w: 100, h: 100 };
    body.position.x = 98;
    const expected = false;
    const actual = isRightBoundaryCollision(body, oBoundary);
    assert.equal(actual, expected);
});

QUnit.test('check top border collision 0', assert => {
    const body = P.duplicate(P.BODY_1);
    const expected = false;
    const actual = isTopBoundaryCollision(body);
    assert.equal(actual, expected);
});

QUnit.test('check top border collision 1', assert => {
    const body = P.duplicate(P.BODY_1);
    body.position.y = 1;
    const expected = true;
    const actual = isTopBoundaryCollision(body);
    assert.equal(actual, expected);
});

QUnit.test('check bottom border collision 0', assert => {
    const body = P.duplicate(P.BODY_1);
    const oBoundary = { w: 100, h: 100 };
    const expected = false;
    const actual = isBottomBoundaryCollision(body, oBoundary);
    assert.equal(actual, expected);
});

QUnit.test('check bottom border collision 1', assert => {
    const body = P.duplicate(P.BODY_1);
    const oBoundary = { w: 100, h: 100 };
    body.position.y = 100;
    const expected = true;
    const actual = isBottomBoundaryCollision(body, oBoundary);
    assert.equal(actual, expected);
});

QUnit.test('check bottom border collision 1', assert => {
    const body = P.duplicate(P.BODY_1);
    const oBoundary = { w: 100, h: 100 };
    body.position.y = 99;
    const expected = true;
    const actual = isBottomBoundaryCollision(body, oBoundary);
    assert.equal(actual, expected);
});

