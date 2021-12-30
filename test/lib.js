import { calculatePosition } from '../lib.mjs';

QUnit.module('lib');

QUnit.test('calculate position', assert => {

    const body = {
        id: '100:100',
        mass: 1,
        initialPosition: {
            x: 3,
            y: 15
        },
        position: {
            x: 3,
            y: 15
        },
        force: 0.04,
        angle: -Math.PI / 2
    };
    assert.equal(calculatePosition(body, 10), 3);

});
