import { SpaceTimeController } from '../app/spacetimecontroller.mjs';
import * as P from './planettest.js';

QUnit.module('space time controller');

QUnit.test('get body from empty', assert => {
    const expected = null;
    const stc = new SpaceTimeController();

    const actual = stc.getBodyAt(10, 10);

    assert.equal(actual, expected);
});

QUnit.test('update single body', assert => {
    const body = P.duplicate(P.BODY_1);
    const expected = body;
    const stc = new SpaceTimeController();
    stc.updateBodyAt(10, 10, body);

    const actual = stc.getBodyAt(10, 10);

    assert.equal(actual, expected);
});

