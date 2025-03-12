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

const HORIZONTAL_NEIGHBOUR_1 = {
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

const compareSpaceSnaphshot = function (s1, s2) {
    let result = {
        same: true,
        difference: null
    }
    let s1SetIndex, s1Set, s1BoxIndex, s1Box;
    for (s1SetIndex = 0; s1SetIndex < s1.length; s1SetIndex++) {
        s1Set = s1[s1SetIndex];
        if (s1Set) {
            for (s1BoxIndex = 0; s1BoxIndex < s1Set.length; s1BoxIndex++) {
                s1Box = s1Set[s1BoxIndex];
                if (s1Box) {
                    if (!s2 || !(s2[s1SetIndex]) || !(s2[s1SetIndex][s1BoxIndex] === s1Box)) {
                        result.same = false;
                        result.difference = { s1SetIndex: s1SetIndex, s1BoxIndex: s1BoxIndex };
                        break;
                    }
                } else {
                    if (s2 && s2[s1SetIndex]) {
                        result.same = false;
                        result.difference = { s1SetIndex: s1SetIndex, s1BoxIndex: s1BoxIndex };
                        break;
                    }
                }
            }
        }
        if (!result.same) {
            break;
        }
    }
    return result;
}

export { BODY_1, BODY_2, BODY_3, HORIZONTAL_NEIGHBOUR_1, duplicate, printBody, compareSpaceSnaphshot }
