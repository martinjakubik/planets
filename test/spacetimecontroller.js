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

    assert.equal(actual, expected);
});

QUnit.test('update body after moved, expect present in space snapshot', assert => {
    const body1 = P.duplicate(P.BODY_1);
    const body2 = P.duplicate(P.HORIZONTAL_NEIGHBOUR_1);
    const expected = {
        '11-10': {
            'id': '1:2',
            'mass': 1,
            'position': {
                'x': 11,
                'y': 10
            },
            'force': 1,
            'angle': 0
        }
    };
    const stc = new SpaceTimeController(P.TEST_APP_CONFIGURATION);
    stc.updateBodyAt(10, 10, body1);
    stc.updateBodyAt(20, 10, body2);
    // stc.incrementTime();
    stc.calculateAllGravity();
    stc.calculateAllPositions();

    const actual = stc.getSpaceSnapshot();

    assert.deepEqual(actual, expected);
});

QUnit.test('update body after moved, expect present', assert => {
    const body1 = P.duplicate(P.BODY_1);
    const body2 = P.duplicate(P.BODY_2);
    const expected = P.duplicate(P.BODY_1);
    expected.position.x = 15;
    const stc = new SpaceTimeController(P.TEST_APP_CONFIGURATION);
    stc.updateBodyAt(10, 10, body1);
    stc.updateBodyAt(20, 10, body2);
    stc.incrementTime();
    stc.calculateAllGravity();
    stc.calculateAllPositions();

    const actual = stc.getBodyAt(15, 10);

    assert.equal(actual, expected);
});

