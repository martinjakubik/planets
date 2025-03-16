import { SpaceTimeController } from '../app/spacetimecontroller.mjs';
import * as P from './planettest.js';

QUnit.module('space time controller');

QUnit.test('get body from empty', assert => {
    const expected = null;
    const stc = new SpaceTimeController(P.TEST_APP_CONFIGURATION);

    const actual = stc.getBodyAt(10, 10);

    assert.equal(actual, expected);
});

QUnit.test('update single body', assert => {
    const body = P.duplicate(P.BODY_1);
    const expected = body;
    const stc = new SpaceTimeController(P.TEST_APP_CONFIGURATION);
    stc.updateBodyAt(10, 10, body);

    const actual = stc.getBodyAt(10, 10);

    assert.equal(actual, expected);
});

QUnit.test('update body after moved, expect absent', assert => {
    const body1 = P.duplicate(P.BODY_1);
    const body2 = P.duplicate(P.BODY_2);
    const expected = null;
    const stc = new SpaceTimeController(P.TEST_APP_CONFIGURATION);
    stc.updateBodyAt(10, 10, body1);
    stc.updateBodyAt(20, 20, body2);
    stc.incrementTime(100);

    const actual = stc.getBodyAt(10, 10);

    assert.equal(actual, expected);
});

QUnit.test('get model after time increment', assert => {
    const body1 = P.duplicate(P.BODY_1);
    const expectedBody = P.duplicate(P.BODY_1);
    const expectedSpaceSnapshot = [null, null, null, null, null, null, null, null, null, null, [null, null, null, null, null, null, null, null, null, null, expectedBody]];
    const stc = new SpaceTimeController(P.TEST_APP_CONFIGURATION);
    stc.updateBodyAt(10, 10, body1);
    stc.incrementTime();
    stc.calculateAllGravity();
    stc.calculateAllPositions();
    const expected = {
        same: true,
        difference: null
    };

    const actualSpaceSnapshot = stc.getSpaceSnapshotAt(0);
    const actual = P.compareSpaceSnaphshot(actualSpaceSnapshot, expectedSpaceSnapshot);

    assert.deepEqual(actual, expected);
});

QUnit.test('add two bodies with no time increment, expect initial snapshot', assert => {
    const body1 = P.duplicate(P.BODY_1);
    const body2 = P.duplicate(P.HORIZONTAL_NEIGHBOUR_1);
    const expected = {
        '10-10': {
            'id': '1:1',
            'mass': 1,
            'position': {
                'x': 10,
                'y': 10
            },
            'force': 0,
            'angle': 0
        },
        '20-10': {
            'id': '2:2',
            'mass': 1,
            'position': {
                'x': 20,
                'y': 10
            },
            'force': 0,
            'angle': 0
        }
    };
    const stc = new SpaceTimeController(P.TEST_APP_CONFIGURATION);
    stc.updateBodyAt(10, 10, body1);
    stc.updateBodyAt(20, 10, body2);

    const actual = stc.getSpaceSnapshot();

    assert.deepEqual(actual, expected);
});

QUnit.test('add two bodies with time increment, expect moved closer', assert => {
    const body1 = P.duplicate(P.BODY_1);
    const body2 = P.duplicate(P.HORIZONTAL_NEIGHBOUR_1);
    body1.mass = 100;
    body2.mass = 100;
    const expected = {
        body1: {
            isXIncreased: true,
            isYSame: true
        },
        body2: {
            isXDecreased: true,
            isYSame: true
        }
    };
    const stc = new SpaceTimeController(P.TEST_APP_CONFIGURATION);
    stc.updateBodyAt(10, 10, body1);
    stc.updateBodyAt(20, 10, body2);
    stc.incrementTime();
    stc.calculateAllGravity();
    stc.calculateAllPositions();

    const actualSpaceSnapshot = stc.getSpaceSnapshot();
    const body1updated = Object.values(actualSpaceSnapshot).find(body => body.id === '1:1');
    const body2updated = Object.values(actualSpaceSnapshot).find(body => body.id === '2:2');
    const actual = {
        body1: {
            isXIncreased: body1updated.position.x > P.BODY_1.position.x,
            isYSame: body1updated.position.y === P.BODY_1.position.y
        },
        body2: {
            isXDecreased: body2updated.position.x < P.HORIZONTAL_NEIGHBOUR_1.position.x,
            isYSame: body2updated.position.y === P.HORIZONTAL_NEIGHBOUR_1.position.y
        }
    }

    assert.deepEqual(actual, expected);
});

QUnit.test('update body after moved, expect present', assert => {
    const body1 = P.duplicate(P.BODY_1);
    const body2 = P.duplicate(P.HORIZONTAL_NEIGHBOUR_1);
    const expected = {
        body1: {
            isForceIncreased: true,
            isAngleSame: true,
            isXIncreased: true,
            isYSame: true
        }
    };

    const stc = new SpaceTimeController(P.TEST_APP_CONFIGURATION);
    stc.updateBodyAt(10, 10, body1);
    stc.updateBodyAt(20, 10, body2);
    stc.incrementTime();
    stc.calculateAllGravity();
    stc.calculateAllPositions();

    const actualSpaceSnapshot = stc.getSpaceSnapshot();
    const body1updated = Object.values(actualSpaceSnapshot).find(body => body.id === '1:1');
    console.log(P.BODY_1, body1updated)
    const actual = {
        body1: {
            isForceIncreased: body1updated.force > P.BODY_1.force,
            isAngleSame: body1updated.angle === P.BODY_1.angle,
            isXIncreased: body1updated.position.x > P.BODY_1.position.x,
            isYSame: body1updated.position.y === P.BODY_1.position.y
        }
    }

    assert.deepEqual(actual, expected);
});